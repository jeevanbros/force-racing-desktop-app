# Force Racing Desktop Applications // Pit Wall Suite

[![Release](https://img.shields.io/badge/Release-v2.1.0-red?style=for-the-badge&logo=github)](https://github.com/jeevanbros/force-racing-desktop-app/releases/tag/v2.1.0)
[![Architecture](https://img.shields.io/badge/Architecture-x64%20%7C%20x86-blue?style=for-the-badge)](https://github.com/jeevanbros/force-racing-desktop-app)
[![Platform](https://img.shields.io/badge/Platform-Windows%2010%20%2F%2011%20%2F%207%20SP1-green?style=for-the-badge&logo=windows)](https://github.com/jeevanbros/force-racing-desktop-app)
[![Team](https://img.shields.io/badge/Formula%20Student-KITS%20Warangal-orange?style=for-the-badge)](https://github.com/jeevanbros/force-racing-desktop-app)

Official native desktop application suite for **Force Racing**, the premier Formula Student engineering team at **Kakatiya Institute of Technology & Science (KITS), Warangal**.

Designed for real-time race telemetry management, pit-wall operations, inventory auditing, subteam roster workflows, and offline mission control at racetracks and engineering bays.

---

## 🏎️ Overview & Architecture

The Force Racing desktop suite is engineered to guarantee operational continuity under high-pressure motorsport environments, where trackside internet connectivity is intermittent or non-existent.

```
+-----------------------------------------------------------------------------------+
|                        FORCE RACING DESKTOP PLATFORM                              |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ 64-bit High-Performance Edition ]           [ 32-bit Legacy / Workshop Edition ]|
|  - ForceRacing-x64.exe (Standalone)            - ForceRacing-x86.exe (Launcher)   |
|  - Full PyInstaller bundle                     - Embedded Python 3.10 Runtime     |
|  - Modern Windows 10/11 x64 systems            - Windows 7 SP1 / 8 / 10 / 11 x86  |
|  - Dedicated AppUserModelID                    - Low-resource garage laptops      |
|  - Per-Monitor High-DPI v2                     - Instant lightweight execution    |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|                               SHARED CORE RUNTIME                                 |
+-----------------------------------------------------------------------------------+
|  * Embedded Flask Pit Wall Engine              * Local SQLite Database Store      |
|  * Auto-Failover Dynamic Port Allocation       * System Dark/Light Theme Tracking |
|  * In-Memory Session & Cache Security          * Zero External Network Required   |
+-----------------------------------------------------------------------------------+
```

---

## ⚡ Key Highlights

### 1. 64-bit Standalone Executable (`ForceRacing-x64.exe`)
- **Single-File Zero-Dependency Binary**: Compiled with PyInstaller 6.x to encapsulate Python 3, UI templates, static stylesheets, JavaScript engines, and SQLite drivers into one standalone file.
- **High-DPI Awareness**: Utilizes Windows Per-Monitor DPI Awareness v2 for razor-sharp rendering on 4K race bay monitors and high-resolution telemetry displays.
- **Dedicated Taskbar Identity**: Custom `AppUserModelID` (`ForceRacing.Operations.PitWall.2026`) ensuring proper window grouping, branding, and tray notification docking.
- **Automated Lifecycle Management**: Launches the background pit-wall daemon, performs health checks against localhost socket allocations, and launches your default browser or webview window seamlessly.

### 2. 32-bit Workshop Compatibility Build (`ForceRacing-x86.exe` / `ForceRacing-x86.zip`)
- **Hardware Agnostic**: Specifically engineered for legacy 32-bit diagnostic laptops, trackside garage rugged machines, and portable telemetry stations running Windows 7 SP1, Windows 8, or 32-bit Windows 10.
- **Embedded Python Runtime**: Bundled with a lightweight, sandboxed Python 3.10 32-bit embedded environment (~17.5 MB compressed).
- **Rapid Port Failover**: Gracefully checks port availability (default `5000`), automatically binding to fallback sockets if port conflicts occur.

### 3. Trackside Offline Reliability
- **100% Air-Gapped Operation**: Run all features—member management, component tracking, lap telemetry logging, task kanbans—without requiring cellular signal or WiFi.
- **Persistent Local Database**: Automatically manages SQLite schemas (`forceracing_app.db`) with transactional integrity and auto-backup capabilities.

### 4. Dynamic Theme Tracking
- **Formula 1 Pit Wall Aesthetic**: Sleek carbon dark theme designed for race control visibility alongside crisp high-contrast light theme support.
- **Persistent State**: User preferences are preserved across sessions and synchronized with OS-level color scheme preferences.

---

## 📦 Downloads & Checksums

| Package | Architecture | Size | Target Environment | Download |
| :--- | :---: | :---: | :--- | :---: |
| **ForceRacing-x64.exe** | 64-bit (x64) | ~377 MB | Modern Windows 10 & 11 PCs | [Download v2.1.0](https://github.com/jeevanbros/force-racing-desktop-app/releases/download/v2.1.0/ForceRacing-x64.exe) |
| **ForceRacing-x86.zip** | 32-bit (x86) | ~17.5 MB | Portable zip with embedded 32-bit runtime | [Download v2.1.0](https://github.com/jeevanbros/force-racing-desktop-app/releases/download/v2.1.0/ForceRacing-x86.zip) |
| **ForceRacing-x86.exe** | 32-bit (x86) | 27 KB | Fast 32-bit native launcher binary | [Download v2.1.0](https://github.com/jeevanbros/force-racing-desktop-app/releases/download/v2.1.0/ForceRacing-x86.exe) |

### Cryptographic Verification (SHA-256)

Verify the integrity of downloaded binaries via PowerShell (`Get-FileHash -Algorithm SHA256 <filename>`):

```text
ForceRacing-x64.exe
SHA256: 5ADB7BC7F9C1385564B9F2BDA20FAE8DC00E3506CE7E4352A2B0949BF2CC53A0

ForceRacing-x86.exe
SHA256: 7FBF67723D8A39C45F15AD33A51209C57A0633BB87D74B9BCDF902D32C8B8991

ForceRacing-x86.zip
SHA256: 236B3E120D01FD16D937BC3CD551304C9FC8919535784445EBC80870F97B37F5
```

---

## 🚀 Quick Start Guide

### Launching the 64-bit App
1. Download `ForceRacing-x64.exe` from [Releases](https://github.com/jeevanbros/force-racing-desktop-app/releases/tag/v2.1.0).
2. Double-click `ForceRacing-x64.exe`.
3. The launcher will automatically boot the server and open your desktop browser at `http://localhost:5000`.

### Launching the 32-bit App
1. Download `ForceRacing-x86.zip` and extract to any folder (e.g., `C:\ForceRacing-x86`).
2. Run `Start-ForceRacing-x86.bat` or double-click `ForceRacing-PC-x86.exe`.
3. For first-time environment validation, run `ForceRacing-x86-Setup.bat`.

---

## 🛠️ Repository Structure

```
force-racing-desktop-app/
├── binaries/
│   └── ForceRacing-x86.zip         # 32-bit portable package with embedded runtime
├── static/
│   └── images/
│       └── icon.ico                # Official Force Racing vector app icon
├── .gitignore                      # Git exclusion rules for large binaries (>100MB)
├── desktop_launcher.py             # Native 64-bit / multi-arch launcher orchestrator
├── ForceRacing-PC-x86.exe          # Compiled 32-bit native launcher
├── ForceRacing-x86.exe             # 32-bit launcher alias
├── ForceRacing-x64.spec            # PyInstaller build specification file
├── ForceRacing-x86-Setup.bat       # Setup & integrity check utility for x86 systems
├── Start-ForceRacing-x86.bat       # One-click start script for 32-bit runtime
├── run.bat                         # Quick developer launch batch file
├── requirements.txt                # Python build dependencies
└── README.md                       # Documentation & release specifications
```

---

## 🔧 Building from Source

To compile your own standalone 64-bit executable using PyInstaller:

### Prerequisites
- Python 3.10+ (64-bit)
- PyInstaller (`pip install pyinstaller`)

### Build Steps
```bash
# 1. Clone repository
git clone https://github.com/jeevanbros/force-racing-desktop-app.git
cd force-racing-desktop-app

# 2. Install dependencies
pip install -r requirements.txt
pip install pyinstaller

# 3. Build standalone executable
pyinstaller ForceRacing-x64.spec --clean
```

The compiled binary will be placed inside the `dist/` directory as `ForceRacing-x64.exe`.

---

## 👥 Contributors & Credits

- **Force Racing Team** — Formula Student, KITS Warangal
- **Engineering Lead**: Jeevan Kumar ([@jeevanbros](https://github.com/jeevanbros))
- Built with passion for motorsports engineering, telemetry excellence, and automotive innovation.

---
*Force Racing Pit Wall Suite © 2026 Kakatiya Institute of Technology & Science, Warangal.*
