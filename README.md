# Force Racing Desktop Applications // Pit Wall Suite

<p align="center">
  <img src="static/images/logo.png" width="160" alt="Force Racing Logo" />
  <br />
  <strong>Formula Student Engineering Team &bull; Kakatiya Institute of Technology & Science (KITS), Warangal</strong>
  <br />
  <em>Next-Generation Real-Time Pit Wall Telemetry & Operations Desktop Suite</em>
</p>

<p align="center">
  <a href="https://github.com/jeevanbros/force-racing-desktop-app/releases/tag/v2.1.0"><img src="https://img.shields.io/badge/Release-v2.1.0-red?style=for-the-badge&logo=github" alt="Release v2.1.0" /></a>
  <a href="https://github.com/jeevanbros/force-racing-desktop-app"><img src="https://img.shields.io/badge/Architecture-x64%20%7C%20x86-blue?style=for-the-badge" alt="Architecture" /></a>
  <a href="https://github.com/jeevanbros/force-racing-desktop-app"><img src="https://img.shields.io/badge/Platform-Windows%2010%20%2F%2011%20%2F%207%20SP1-green?style=for-the-badge&logo=windows" alt="Platform" /></a>
  <a href="https://github.com/jeevanbros/force-racing-desktop-app"><img src="https://img.shields.io/badge/Display-Per--Monitor%20High--DPI%20v2-purple?style=for-the-badge" alt="High-DPI" /></a>
  <a href="https://github.com/jeevanbros/force-racing-desktop-app"><img src="https://img.shields.io/badge/Mode-100%25%20Offline%20Air--Gapped-orange?style=for-the-badge" alt="Offline Mode" /></a>
</p>

---

## 🏎️ Overview & Mission

The **Force Racing Desktop Application** is the mission-critical operations and pit-wall console built for **Force Racing**, the premier Formula Student combustion & electric racing team from **Kakatiya Institute of Technology & Science (KITS), Warangal**.

Operating trackside in racing conditions demands absolute resilience. High temperatures, electromagnetic interference, and total absence of cellular or Wi-Fi connectivity require software that runs entirely locally, caches high-frequency telemetry without dropped frames, and provides instant visual clarity on every screen from legacy garage laptops to 4K pit-wall monitors.

```
+-----------------------------------------------------------------------------------+
|                        FORCE RACING DESKTOP PLATFORM                              |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ 64-bit High-Performance Edition ]           [ 32-bit Legacy / Workshop Edition ]|
|  - ForceRacing-x64.exe (Standalone)            - ForceRacing-x86.exe (Launcher)   |
|  - Full PyInstaller single-file bundle         - Sandboxed Embedded Python 3.10   |
|  - Windows 10 & 11 (64-bit)                    - Windows 7 SP1 / 8 / 10 / 11 x86  |
|  - Per-Monitor High-DPI v2 Hardware Scaling    - Legacy garage diagnostic laptops |
|  - Dedicated AppUserModelID & System Tray      - Zero installation overhead       |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|                               SHARED ARCHITECTURE                                 |
+-----------------------------------------------------------------------------------+
|  * Embedded High-Speed Pit Wall Engine         * Offline Telemetry Cache Store    |
|  * Multi-Database Isolation Architecture       * Dynamic Port Failover Engine     |
|  * High-DPI Vector Branding & Custom Icons     * Zero External Network Required   |
+-----------------------------------------------------------------------------------+
```

---

## ⚡ Key Capabilities & Engineering Features

### 🖥️ Windows 64-bit High-Performance Edition (`ForceRacing-x64.exe`)
- **Single-File Zero-Dependency Executable**: Packaged using PyInstaller 6.x to bundle the entire Python runtime, web engine, telemetry pipelines, static assets, and database drivers into an autonomous binary.
- **Dedicated Taskbar Identity**: Registered with Windows Shell via `AppUserModelID` (`ForceRacing.Operations.PitWall.2026`), guaranteeing distinct taskbar grouping, pinned window pinning, and tray notification docking.
- **Embedded Lifecycle Management**: Orchestrates background service startup, runs loopback socket handshakes, binds fallback ports if default port `5000` is occupied, and launches the user interface seamlessly in standalone window or browser mode.

### 💻 Windows 32-bit Workshop Edition (`ForceRacing-x86.exe` / `ForceRacing-x86.zip`)
- **Hardware Agnostic**: Purpose-built for legacy trackside laptops, rugged workshop terminals, and older dyno workstations running 32-bit Windows 7 SP1, Windows 8, Windows 8.1, or Windows 10/11 x86.
- **Sandboxed Embedded Runtime**: Includes a portable 32-bit Python 3.10 runtime (~17.5 MB compressed) with pre-configured dependencies, eliminating any requirement for system-wide Python installations or administrative rights.
- **Automated Setup Validation**: Comes with `ForceRacing-x86-Setup.bat` and `Start-ForceRacing-x86.bat` for instant verification and one-click execution.

### 🎨 High-DPI Graphics & Force Racing Logo Branding
- **Per-Monitor High-DPI v2 Awareness**: Fully declares `PerMonitorV2` DPI awareness in application manifests. Whether rendered on standard 1080p pit displays or ultra-high-density 4K / 1440p high-refresh laptops, fonts, gauges, graphs, and UI controls remain pixel-perfect with zero Windows bitmap stretching.
- **Vector-Derived Multi-Mipmap Iconography**: Custom multi-resolution icon (`icon.ico`) embedded into binaries and static resources containing 16x16, 24x24, 32x32, 48x48, 64x64, 128x128, and 256x256 mipmaps.
- **Official Team Branding**: Integrates official Force Racing livery aesthetics, dark-mode carbon fiber themes, high-contrast pit-wall telemetry modes, and vector team logos (`static/images/logo.png`).

### 📡 Offline Telemetry Caching & Trackside Resiliency
- **100% Air-Gapped Operation**: Completely decoupled from cloud dependencies. Race engineers can monitor live telemetry, run lap simulations, calculate tire degradation, and record pit stop timing without an active internet connection.
- **High-Throughput Local Ingestion Buffer**: Telemetry packets received from CAN-bus loggers, wireless transceivers, or serial inputs are buffered in a dedicated in-memory queue and flushed to persistent local storage.
- **Offline Cache & Resilient Sync**: Telemetry logs are preserved in time-series caches. When internet or local pit network connectivity is restored, cached telemetry sessions can be batch-exported or synchronized upstream to the cloud analytics platform.

### 🗄️ Separate Database Support & Data Isolation
To prevent analytical telemetry ingestion from locking operational databases during live endurance runs, Force Racing Desktop features a decoupled multi-database architecture:
- **Operational Database (`forceracing_app.db`)**: Handles user profiles, subteam tasks, component inventories, vehicle technical specs, and event rosters.
- **Offline Telemetry Database (`telemetry_offline.db`)**: High-throughput SQLite database configured with Write-Ahead Logging (`PRAGMA journal_mode=WAL;`), synchronous normal mode, and memory-mapped I/O (`PRAGMA mmap_size=268435456;`) for ultra-low latency sensor ingestion.
- **Configurable Storage Paths**: Database storage locations can be redirected to external USB drives, secure SSD volumes, or custom directories via environment variables:
  ```powershell
  # Set custom database paths
  $env:DATABASE_URL = "sqlite:///D:/PitWallData/operational.db"
  $env:TELEMETRY_DB_PATH = "D:/PitWallData/telemetry_offline.db"
  ```

---

## 📦 Download Instructions & Binaries

Official binary releases are published on the GitHub Releases portal.

| Package Name | Architecture | Package Type | Target OS | Direct Download |
| :--- | :---: | :---: | :--- | :---: |
| **`ForceRacing-x64.exe`** | **64-bit (x64)** | Single-File Executable (~377 MB) | Windows 10 / 11 (64-bit) | [📥 Download v2.1.0 x64](https://github.com/jeevanbros/force-racing-desktop-app/releases/download/v2.1.0/ForceRacing-x64.exe) |
| **`ForceRacing-x86.zip`** | **32-bit (x86)** | Portable Archive (~17.5 MB) | Windows 7 SP1 / 8 / 10 / 11 (32-bit) | [📥 Download v2.1.0 x86 ZIP](https://github.com/jeevanbros/force-racing-desktop-app/releases/download/v2.1.0/ForceRacing-x86.zip) |
| **`ForceRacing-x86.exe`** | **32-bit (x86)** | Standalone Launcher (27 KB) | Windows x86 Launcher Alias | [📥 Download v2.1.0 x86 Launcher](https://github.com/jeevanbros/force-racing-desktop-app/releases/download/v2.1.0/ForceRacing-x86.exe) |

### 🔐 Cryptographic Checksums (SHA-256)

Always verify the integrity of downloaded binaries prior to trackside deployment:

```powershell
# Verify SHA256 in PowerShell
Get-FileHash -Algorithm SHA256 .\ForceRacing-x64.exe
Get-FileHash -Algorithm SHA256 .\ForceRacing-x86.zip
Get-FileHash -Algorithm SHA256 .\ForceRacing-x86.exe
```

| File | SHA-256 Checksum |
| :--- | :--- |
| `ForceRacing-x64.exe` | `5ADB7BC7F9C1385564B9F2BDA20FAE8DC00E3506CE7E4352A2B0949BF2CC53A0` |
| `ForceRacing-x86.zip` | `236B3E120D01FD16D937BC3CD551304C9FC8919535784445EBC80870F97B37F5` |
| `ForceRacing-x86.exe` | `7FBF67723D8A39C45F15AD33A51209C57A0633BB87D74B9BCDF902D32C8B8991` |

---

## 🚀 Installation & Quick Start

### Running the 64-bit Edition (Windows 10 / 11 x64)
1. Download `ForceRacing-x64.exe` from [Releases](https://github.com/jeevanbros/force-racing-desktop-app/releases/tag/v2.1.0).
2. Save it to your preferred folder (e.g. `C:\ForceRacing\` or Desktop).
3. Double-click `ForceRacing-x64.exe`.
4. The application boots the pit-wall server and launches your native desktop window at `http://127.0.0.1:5000`.
5. Access tray controls from the Windows taskbar notification area to open or close the application.

### Running the 32-bit Edition (Windows 7 SP1 / 8 / 10 / 11 x86)
1. Download `ForceRacing-x86.zip` from [Releases](https://github.com/jeevanbros/force-racing-desktop-app/releases/tag/v2.1.0).
2. Extract the archive contents into any folder (e.g. `C:\ForceRacing-x86\`).
3. *(Optional)* Run `ForceRacing-x86-Setup.bat` to verify runtime integrity.
4. Launch the application by running `Start-ForceRacing-x86.bat` or double-clicking `ForceRacing-PC-x86.exe`.

---

## 💻 Command-Line Parameters

Both the 64-bit binary and Python launcher support command-line arguments for advanced automation and headless test suites:

```text
usage: ForceRacing-x64.exe [-h] [--port PORT] [--no-browser] [--test] [--timeout TIMEOUT]

Force Racing Operations Desktop Launcher

options:
  -h, --help           Show help message and exit
  --port PORT          Specify custom preferred port (default: 5000 with auto-failover)
  --no-browser         Run pit-wall daemon without opening UI browser window
  --test, --check      Boot server, verify HTTP 200 health check, and exit cleanly (exit code 0)
  --timeout TIMEOUT    Execute server for N seconds and terminate cleanly
```

**Examples:**
```powershell
# Run automated headless diagnostics
.\ForceRacing-x64.exe --test

# Run on dedicated pit-wall port without auto-launching browser
.\ForceRacing-x64.exe --port 8080 --no-browser
```

---

## 📁 Repository Structure

```
force-racing-desktop-app/
├── binaries/
│   └── ForceRacing-x86.zip         # 32-bit portable runtime zip (~17.5 MB)
├── static/
│   └── images/
│       ├── icon.ico                # Official multi-resolution icon (16x16 to 256x256)
│       └── logo.png                # Official Force Racing high-DPI vector team logo
├── .gitignore                      # Excludes large binaries (>100MB) from git tracking
├── desktop_launcher.py             # Desktop orchestrator (Tray, DPI, Server, Failover)
├── ForceRacing-PC-x86.exe          # Compiled 32-bit native launcher binary
├── ForceRacing-x86.exe             # 32-bit launcher alias
├── ForceRacing-x64.spec            # PyInstaller build specification file
├── ForceRacing-x86-Setup.bat       # Setup & integrity check utility for x86 systems
├── Start-ForceRacing-x86.bat       # One-click start script for 32-bit runtime
├── run.bat                         # Quick developer launch batch file
├── requirements.txt                # Python build and desktop dependencies
└── README.md                       # Comprehensive documentation & release specifications
```

---

## 🛠️ Building from Source

To compile the standalone 64-bit binary manually from source code:

### Prerequisites
- Python 3.10+ (64-bit Windows)
- PyInstaller (`pip install pyinstaller`)
- Microsoft Visual C++ Redistributable 2015-2022

### Build Instructions
```bash
# 1. Clone the repository
git clone https://github.com/jeevanbros/force-racing-desktop-app.git
cd force-racing-desktop-app

# 2. Create and activate a virtual environment
python -m venv venv
.\venv\Scripts\activate

# 3. Install core dependencies
pip install -r requirements.txt
pip install pyinstaller

# 4. Compile the standalone 64-bit executable
pyinstaller ForceRacing-x64.spec --clean
```

The compiled binary will be generated in `dist/ForceRacing-x64.exe`.

---

## 🏁 About Force Racing

**Force Racing** is the student formula racing team of **Kakatiya Institute of Technology & Science (KITS), Warangal**. Founded by passionate undergraduate engineers, the team designs, manufactures, tests, and races Formula-style racecars to compete in national and international engineering competitions.

- **Institution**: Kakatiya Institute of Technology & Science, Warangal, Telangana, India
- **Repository Maintainer**: Jeevan Kumar ([@jeevanbros](https://github.com/jeevanbros))
- **Team**: Force Racing Formula Student Team

---
*Force Racing Pit Wall Suite &copy; 2026 Kakatiya Institute of Technology & Science, Warangal. All rights reserved.*
