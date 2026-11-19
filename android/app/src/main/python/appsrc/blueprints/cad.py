"""
Force Racing Operations - CAD & Engineering Blueprints Hub
Supports CAD submission, transmission to subsystem leads, status reviews,
and automated synchronization with ForceRacing_Master_Database.xlsx & Google Sheets.
"""

import os
import datetime
from flask import (
    Blueprint, render_template, request, redirect, url_for,
    flash, g, session, current_app, send_from_directory, abort, jsonify
)
from werkzeug.utils import secure_filename
from config import Config
from database import get_db
from decorators import login_required
from utils.sheets_sync import record_cad_submission

cad_bp = Blueprint('cad', __name__)

def process_cad_upload(request_obj, user, db):
    """
    Common CAD upload processor used across blueprint routes.
    Saves file, inserts record in SQLite, and triggers Excel & Google Sheets sync.
    """
    title = request_obj.form.get('title', '').strip()
    description = request_obj.form.get('description', '').strip()
    subsystem = request_obj.form.get('subsystem', '').strip()
    target_head_id = request_obj.form.get('target_head_id', type=int)
    uploaded_file = request_obj.files.get('cad_file')

    if not title:
        return False, "Please provide a title or revision code for the CAD assembly."

    if not subsystem:
        return False, "Please specify the target subsystem (e.g. Chassis, Aerodynamics, Suspension)."

    if not uploaded_file or uploaded_file.filename == '':
        return False, "Please attach a CAD model, technical drawing, or telemetry archive."

    orig_filename = secure_filename(uploaded_file.filename)
    file_ext = orig_filename.rsplit('.', 1)[-1].lower() if '.' in orig_filename else ''

    if file_ext not in Config.ALLOWED_EXTENSIONS:
        allowed_str = ", ".join(sorted(list(Config.ALLOWED_EXTENSIONS)))
        return False, f"Invalid file format '.{file_ext}'. Supported formats: {allowed_str}"

    now = datetime.datetime.now()
    timestamp = now.strftime('%Y%m%d_%H%M%S')
    unique_filename = f"{timestamp}_{user['username']}_{orig_filename}"

    upload_dir = Config.UPLOAD_FOLDER
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, unique_filename)
    uploaded_file.save(file_path)

    file_size = os.path.getsize(file_path)
    now_str = now.strftime('%Y-%m-%d %H:%M:%S')

    target_head_name = "Department Head"
    if target_head_id:
        head_row = db.execute("SELECT full_name FROM users WHERE id = ?", (target_head_id,)).fetchone()
        if head_row:
            target_head_name = head_row['full_name']

    cursor = db.execute('''
        INSERT INTO cad_files (title, description, subsystem, filename, original_name, file_size, file_type, uploader_id, target_head_id, status, feedback, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Review', '', ?, ?)
    ''', (title, description, subsystem, unique_filename, orig_filename, file_size, file_ext.upper(), user['id'], target_head_id, now_str, now_str))
    db.commit()

    cad_id = cursor.lastrowid

    # Trigger Excel & Google Sheets Live Sync
    try:
        record_cad_submission({
            'id': cad_id,
            'title': title,
            'description': description,
            'subsystem': subsystem,
            'filename': unique_filename,
            'original_name': orig_filename,
            'file_size': file_size,
            'file_type': file_ext.upper(),
            'uploader_id': user['id'],
            'uploader_name': user['full_name'],
            'target_head_id': target_head_id,
            'target_head_name': target_head_name,
            'status': 'Pending Review',
            'feedback': '',
            'created_at': now_str,
            'updated_at': now_str
        }, db=db)
    except Exception as e:
        current_app.logger.error(f"Error syncing CAD file to Excel/Google Sheets: {e}")

    return True, f"CAD package '{title}' successfully transmitted to {target_head_name} ({subsystem}). Status: Pending Review."

@cad_bp.route('/cad-hub', methods=['GET', 'POST'])
@cad_bp.route('/hub', methods=['GET', 'POST'])
@cad_bp.route('/submit', methods=['GET', 'POST'])
def cad_hub():
    """CAD Hub route in cad blueprint."""
    db = get_db()
    
    if request.method == 'POST':
        if not g.user:
            flash("Please sign in to transmit CAD data to department heads.", "warning")
            return redirect(url_for('auth.login', next=request.path))

        success, message = process_cad_upload(request, g.user, db)
        flash(message, "success" if success else "danger")
        return redirect(url_for('main.cad_hub'))

    # Load department heads
    dept_heads_raw = db.execute('''
        SELECT id, full_name, subsystem, role, email 
        FROM users 
        WHERE role = 'Subsystem Lead' OR role IN ('Captain', 'Vice Captain', 'Manager')
        ORDER BY subsystem ASC, role ASC, id ASC
    ''').fetchall()

    sub_leads_count = {}
    for h in dept_heads_raw:
        if h['role'] == 'Subsystem Lead':
            sub_leads_count.setdefault(h['subsystem'], []).append(h['id'])

    dept_heads = []
    for h in dept_heads_raw:
        h_dict = dict(h)
        sub = h['subsystem']
        if h['role'] == 'Subsystem Lead':
            leads = sub_leads_count.get(sub, [])
            if len(leads) > 1:
                idx = leads.index(h['id']) + 1
                h_dict['role_display'] = f"Head {idx}"
                h_dict['full_role_display'] = f"Head {idx}"
            else:
                h_dict['role_display'] = "Head"
                h_dict['full_role_display'] = "Head"
        else:
            h_dict['role_display'] = h['role']
            h_dict['full_role_display'] = h['role']
        dept_heads.append(h_dict)

    cad_files = db.execute('''
        SELECT cf.*, 
               u.full_name as uploader_name, u.role as uploader_role,
               th.full_name as target_head_name, th.role as target_head_role
        FROM cad_files cf
        JOIN users u ON cf.uploader_id = u.id
        LEFT JOIN users th ON cf.target_head_id = th.id
        ORDER BY cf.id DESC
    ''').fetchall()

    return render_template(
        'cad_hub.html',
        dept_heads=dept_heads,
        subsystems=Config.SUBSYSTEMS,
        cad_files=cad_files
    )

@cad_bp.route('/download/<int:file_id>')
@login_required
def download_file(file_id):
    """Download CAD file from cad blueprint."""
    return redirect(url_for('main.download_cad_file', file_id=file_id))
