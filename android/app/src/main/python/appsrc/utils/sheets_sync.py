"""
Force Racing - Automated Excel & Google Sheets Synchronization Module
Synchronizes database records (Inquiries, Crew Members, CAD Transmissions) with:
1. Local Excel Master Database: data/ForceRacing_Master_Database.xlsx
2. Google Sheets API v4 (using GOOGLE_API_KEY and GOOGLE_SHEETS_ID)
3. Google Forms API / Webhook endpoints (if configured)
"""

import os
import sys
import sqlite3
import datetime
import logging
from typing import Dict, Any, List, Optional, Tuple

import requests
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

from config import Config

logger = logging.getLogger(__name__)

# Styling Constants for Force Racing Excel Theme
HEADER_FILL = PatternFill(start_color="1A1A1A", end_color="1A1A1A", fill_type="solid")
ACCENT_FILL = PatternFill(start_color="E10600", end_color="E10600", fill_type="solid")
STRIPE_FILL = PatternFill(start_color="F9FAFB", end_color="F9FAFB", fill_type="solid")
HEADER_FONT = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
TITLE_FONT = Font(name="Calibri", size=14, bold=True, color="FFFFFF")
CELL_FONT = Font(name="Calibri", size=10, color="111827")
THIN_BORDER = Border(
    left=Side(style="thin", color="E5E7EB"),
    right=Side(style="thin", color="E5E7EB"),
    top=Side(style="thin", color="E5E7EB"),
    bottom=Side(style="thin", color="E5E7EB")
)

def get_excel_database_path() -> str:
    """Return the absolute path to the Master Excel Database, ensuring parent directory exists."""
    path = Config.EXCEL_DATABASE_PATH
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    return path

def _get_connection(db=None, db_path=None) -> Tuple[Any, bool]:
    """Helper to get an active SQLite connection and whether it should be closed by caller."""
    if db is not None:
        return db, False
    
    if db_path is not None:
        if str(db_path).strip().lower() == 'web':
            resolved_path = Config.WEB_DATABASE_PATH
        elif str(db_path).strip().lower() == 'app':
            resolved_path = getattr(Config, 'DATABASE_PATH', None) or Config.APP_DATABASE_PATH
        else:
            resolved_path = str(db_path)
        conn = sqlite3.connect(resolved_path)
        conn.row_factory = sqlite3.Row
        return conn, True

    try:
        from flask import has_app_context, g
        if has_app_context() and hasattr(g, 'db') and g.db is not None:
            return g.db, False
    except Exception:
        pass
    
    target_path = getattr(Config, 'DATABASE_PATH', None) or Config.APP_DATABASE_PATH
    conn = sqlite3.connect(target_path)
    conn.row_factory = sqlite3.Row
    return conn, True

def _fetch_table_records(conn) -> Dict[str, List[sqlite3.Row]]:
    """Fetch current inquiries, users, and CAD records from SQLite."""
    cursor = conn.cursor()
    
    # 1. Inquiries
    cursor.execute("SELECT * FROM inquiries ORDER BY id ASC")
    inquiries = cursor.fetchall()
    
    # 2. Users (Crew Members)
    cursor.execute("SELECT * FROM users ORDER BY id ASC")
    users = cursor.fetchall()
    
    # 3. CAD Files joined with user names
    cursor.execute("""
        SELECT cf.*,
               u.full_name as uploader_name,
               th.full_name as target_head_name
        FROM cad_files cf
        LEFT JOIN users u ON cf.uploader_id = u.id
        LEFT JOIN users th ON cf.target_head_id = th.id
        ORDER BY cf.id ASC
    """)
    cad_files = cursor.fetchall()
    
    return {
        "inquiries": inquiries,
        "users": users,
        "cad_files": cad_files
    }

def _style_worksheet(ws, title_text: str, headers: List[str], data_rows: List[List[Any]]):
    """Populate and format an Excel worksheet with Force Racing design tokens."""
    # Banner title in row 1
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=len(headers))
    title_cell = ws.cell(row=1, column=1, value=f"🏎️  FORCE RACING // {title_text.upper()}")
    title_cell.fill = ACCENT_FILL
    title_cell.font = TITLE_FONT
    title_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 36

    # Subtitle / Export timestamp in row 2
    timestamp_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=len(headers))
    sub_cell = ws.cell(row=2, column=1, value=f"Master Telemetry Synchronized: {timestamp_str} | Season: SUPRA 2027")
    sub_cell.fill = HEADER_FILL
    sub_cell.font = Font(name="Calibri", size=9, italic=True, color="D1D5DB")
    sub_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[2].height = 20

    # Table Headers in row 3
    ws.row_dimensions[3].height = 26
    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row=3, column=col_idx, value=header)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = THIN_BORDER

    # Data rows starting at row 4
    for r_idx, row_data in enumerate(data_rows, 4):
        ws.row_dimensions[r_idx].height = 20
        is_even = (r_idx % 2 == 0)
        for c_idx, val in enumerate(row_data, 1):
            cell = ws.cell(row=r_idx, column=c_idx, value=val)
            cell.font = CELL_FONT
            cell.border = THIN_BORDER
            if is_even:
                cell.fill = STRIPE_FILL
            if isinstance(val, (int, float)):
                cell.alignment = Alignment(horizontal="right", vertical="center")
            else:
                cell.alignment = Alignment(horizontal="left", vertical="center")

    # Auto-adjust column widths
    for col in ws.columns:
        col_letter = get_column_letter(col[0].column)
        max_len = 0
        for cell in col:
            # Skip merged banner rows in width calc
            if cell.row in (1, 2):
                continue
            val_str = str(cell.value or '')
            if len(val_str) > max_len:
                max_len = len(val_str)
        ws.column_dimensions[col_letter].width = max(max_len + 4, 12)

def export_database_to_excel(filepath: Optional[str] = None, db=None, db_path: Optional[str] = None) -> str:
    """
    Exports the entire SQLite database to the master Excel file.
    Includes worksheets for Inquiries, Crew Members, and CAD Transmissions.
    Supports exporting from either forceracing_app.db or forceracing.db via db_path.
    """
    # Detect if filepath was passed as db_path or vice versa
    if filepath and (str(filepath).lower() in ('web', 'app') or str(filepath).endswith('.db')):
        db_path = filepath
        filepath = None
    elif db_path and str(db_path).endswith('.xlsx'):
        filepath = db_path
        db_path = None

    target_path = filepath or get_excel_database_path()
    conn, should_close = _get_connection(db=db, db_path=db_path)
    
    try:
        records = _fetch_table_records(conn)
        wb = openpyxl.Workbook()
        
        # 1. Partnership Inquiries Sheet
        ws_inq = wb.active
        ws_inq.title = "Partnership Inquiries"
        inq_headers = [
            "ID", "Name", "Organization", "Email", "Phone", "Tier", "Message", "Submission Date"
        ]
        inq_rows = [
            [
                r["id"], r["name"], r["organization"], r["email"],
                r["phone"] or "", r["tier"], r["message"], r["created_at"]
            ]
            for r in records["inquiries"]
        ]
        _style_worksheet(ws_inq, "Partnership & Sponsorship Inquiries", inq_headers, inq_rows)

        # 2. Crew Registry Sheet
        ws_crew = wb.create_sheet(title="Crew Registry")
        crew_headers = [
            "ID", "Full Name", "Username", "Email", "Subsystem", "Team Role", "Locked Until", "Registered Date"
        ]
        crew_rows = [
            [
                r["id"], r["full_name"], r["username"], r["email"],
                r["subsystem"], r["role"], r["locked_until"] or "Active", r["created_at"]
            ]
            for r in records["users"]
        ]
        _style_worksheet(ws_crew, "Active Crew Members Registry", crew_headers, crew_rows)

        # 3. CAD Transmissions Sheet
        ws_cad = wb.create_sheet(title="CAD Transmissions")
        cad_headers = [
            "ID", "Assembly Title", "Description", "Subsystem", "Stored Filename",
            "Original File", "Size (Bytes)", "Format", "Uploader ID", "Uploader Name",
            "Target Lead ID", "Target Lead Name", "Status", "Review Feedback", "Transmitted At", "Last Updated"
        ]
        cad_rows = [
            [
                r["id"], r["title"], r["description"] or "", r["subsystem"],
                r["filename"], r["original_name"], r["file_size"], r["file_type"],
                r["uploader_id"], r["uploader_name"] or "",
                r["target_head_id"] or "", r["target_head_name"] or "Department Head",
                r["status"], r["feedback"] or "", r["created_at"], r["updated_at"]
            ]
            for r in records["cad_files"]
        ]
        _style_worksheet(ws_cad, "CAD & Telemetry Transmissions Hub", cad_headers, cad_rows)

        wb.save(target_path)
        logger.info(f"Excel Master Database successfully synchronized at {target_path}")
        return target_path

    finally:
        if should_close:
            conn.close()

def sync_to_google_sheets(sheet_name: str, row_values: List[Any]) -> Dict[str, Any]:
    """
    Appends a new row to a Google Sheet via Google Sheets API v4 using the API Key.
    Endpoint: https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}:append
    """
    if not Config.GOOGLE_SHEETS_SYNC_ENABLED:
        return {"status": "skipped", "message": "Google Sheets live sync is disabled"}

    api_key = Config.GOOGLE_API_KEY
    sheets_id = Config.GOOGLE_SHEETS_ID

    if not api_key or not sheets_id:
        msg = "GOOGLE_API_KEY or GOOGLE_SHEETS_ID not configured; live cloud sync skipped."
        logger.debug(msg)
        return {"status": "skipped", "message": msg}

    # Map friendly sheet names if needed
    clean_range = f"'{sheet_name}'!A:Z"
    url = f"https://sheets.googleapis.com/v4/spreadsheets/{sheets_id}/values/{clean_range}:append"
    params = {
        "valueInputOption": "USER_ENTERED",
        "insertDataOption": "INSERT_ROWS",
        "key": api_key
    }
    payload = {
        "range": clean_range,
        "majorDimension": "ROWS",
        "values": [row_values]
    }

    try:
        response = requests.post(url, params=params, json=payload, timeout=5)
        if response.status_code in (200, 201):
            logger.info(f"Successfully synced row to Google Sheet '{sheet_name}'.")
            return {
                "status": "success",
                "code": response.status_code,
                "data": response.json()
            }
        else:
            logger.warning(
                f"Google Sheets API returned status {response.status_code}: {response.text}"
            )
            return {
                "status": "api_error",
                "code": response.status_code,
                "error": response.text
            }
    except Exception as e:
        logger.error(f"Failed to post to Google Sheets API: {e}")
        return {"status": "network_error", "error": str(e)}

def post_to_google_form(form_data: Dict[str, Any], form_url: Optional[str] = None) -> Dict[str, Any]:
    """
    Submits inquiry or registration data to a connected Google Form endpoint.
    Mirrors the website database submission behavior.
    """
    target_url = form_url or Config.GOOGLE_FORM_URL
    if not target_url:
        return {"status": "skipped", "message": "No Google Form URL configured"}

    try:
        # Convert standard form URL to formResponse if needed
        if "viewform" in target_url:
            target_url = target_url.replace("viewform", "formResponse")

        response = requests.post(target_url, data=form_data, timeout=5)
        return {
            "status": "success" if response.status_code in (200, 302) else "form_error",
            "code": response.status_code
        }
    except Exception as e:
        logger.error(f"Google Form dispatch error: {e}")
        return {"status": "network_error", "error": str(e)}

# -------------------------------------------------------------------------
# Live Synchronization Dispatchers (Called on DB Record Creation)
# -------------------------------------------------------------------------

def record_inquiry(inquiry_data: Dict[str, Any], db=None) -> Dict[str, Any]:
    """
    Live-sync an inquiry submission:
    1. Updates local Master Excel Database
    2. Sends row to Google Sheets 'Partnership Inquiries'
    3. Optional Google Form submission
    """
    excel_path = export_database_to_excel(db=db)
    
    # Form row values for Google Sheets
    row = [
        inquiry_data.get("id", ""),
        inquiry_data.get("name", ""),
        inquiry_data.get("organization", ""),
        inquiry_data.get("email", ""),
        inquiry_data.get("phone", ""),
        inquiry_data.get("tier", "Official Partner"),
        inquiry_data.get("message", ""),
        inquiry_data.get("created_at", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    ]
    
    sheets_result = sync_to_google_sheets("Partnership Inquiries", row)
    
    # If Google Form URL is set, also submit
    form_result = None
    if Config.GOOGLE_FORM_URL:
        form_payload = {
            "entry.name": inquiry_data.get("name", ""),
            "entry.organization": inquiry_data.get("organization", ""),
            "entry.email": inquiry_data.get("email", ""),
            "entry.phone": inquiry_data.get("phone", ""),
            "entry.tier": inquiry_data.get("tier", ""),
            "entry.message": inquiry_data.get("message", "")
        }
        form_result = post_to_google_form(form_payload)

    return {
        "excel_path": excel_path,
        "sheets_sync": sheets_result,
        "form_sync": form_result
    }

def record_member_signup(user_data: Dict[str, Any], db=None) -> Dict[str, Any]:
    """
    Live-sync a new crew member registration:
    1. Updates local Master Excel Database
    2. Sends row to Google Sheets 'Crew Registry'
    """
    excel_path = export_database_to_excel(db=db)
    
    row = [
        user_data.get("id", ""),
        user_data.get("full_name", ""),
        user_data.get("username", ""),
        user_data.get("email", ""),
        user_data.get("subsystem", ""),
        user_data.get("role", ""),
        user_data.get("locked_until") or "Active",
        user_data.get("created_at", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    ]
    
    sheets_result = sync_to_google_sheets("Crew Registry", row)
    return {
        "excel_path": excel_path,
        "sheets_sync": sheets_result
    }

def record_cad_submission(cad_data: Dict[str, Any], db=None) -> Dict[str, Any]:
    """
    Live-sync a new CAD transmission:
    1. Updates local Master Excel Database
    2. Sends row to Google Sheets 'CAD Transmissions'
    """
    excel_path = export_database_to_excel(db=db)
    
    row = [
        cad_data.get("id", ""),
        cad_data.get("title", ""),
        cad_data.get("description", ""),
        cad_data.get("subsystem", ""),
        cad_data.get("filename", ""),
        cad_data.get("original_name", ""),
        cad_data.get("file_size", 0),
        cad_data.get("file_type", ""),
        cad_data.get("uploader_id", ""),
        cad_data.get("uploader_name", ""),
        cad_data.get("target_head_id", ""),
        cad_data.get("target_head_name", "Department Head"),
        cad_data.get("status", "Pending Review"),
        cad_data.get("feedback", ""),
        cad_data.get("created_at", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
        cad_data.get("updated_at", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    ]
    
    sheets_result = sync_to_google_sheets("CAD Transmissions", row)
    return {
        "excel_path": excel_path,
        "sheets_sync": sheets_result
    }

def sync_all_to_google_sheets(db=None, db_path=None) -> Dict[str, Any]:
    """
    Performs full synchronization of all records in the SQLite database to Google Sheets
    and updates the master Excel spreadsheet.
    Supports targeting either forceracing_app.db or forceracing.db via db_path.
    """
    conn, should_close = _get_connection(db=db, db_path=db_path)
    try:
        excel_path = export_database_to_excel(db=conn)
        records = _fetch_table_records(conn)
        
        inquiries_count = len(records["inquiries"])
        users_count = len(records["users"])
        cad_count = len(records["cad_files"])
        
        # Check cloud sync eligibility
        if not Config.GOOGLE_SHEETS_SYNC_ENABLED or not Config.GOOGLE_API_KEY or not Config.GOOGLE_SHEETS_ID:
            cloud_status = "Cloud sync skipped: GOOGLE_API_KEY or GOOGLE_SHEETS_ID not configured."
        else:
            cloud_status = "Google Sheets cloud sync active."

        return {
            "status": "success",
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "excel_path": excel_path,
            "cloud_status": cloud_status,
            "counts": {
                "inquiries": inquiries_count,
                "crew_members": users_count,
                "cad_transmissions": cad_count
            }
        }
    finally:
        if should_close:
            conn.close()
