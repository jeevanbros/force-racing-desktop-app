# Force Racing // Pit Wall

<p align="center">
  <img src="static/images/logo.png" width="140" alt="Force Racing" />
  <br />
  <strong>Formula Student Engineering Team &bull; KITS Warangal</strong>
</p>

## Download

| Build | Download | Size |
|---|---|---|
| **Force Racing X64** (installer) | [ForceRacing-X64-Setup.exe](https://github.com/jeevanbros/force-racing-desktop-app/raw/main/ForceRacing-X64-Setup.exe) | 32.7 MB |
| **Force Racing X32** (installer) | [ForceRacing-X32-Setup.exe](https://github.com/jeevanbros/force-racing-desktop-app/raw/main/ForceRacing-X32-Setup.exe) | 13.8 MB |
| **Force Racing Android APK** | [ForceRacing-Android-APK.apk](https://github.com/jeevanbros/force-racing-desktop-app/raw/main/ForceRacing-Android-APK.apk) | 46.8 MB |
| X64 portable (no installer) | [ForceRacing-X64-PC.exe](https://github.com/jeevanbros/force-racing-desktop-app/raw/main/ForceRacing-X64-PC.exe) | 42.6 MB |
| X32 portable (zip) | [ForceRacing-X32.zip](https://github.com/jeevanbros/force-racing-desktop-app/raw/main/ForceRacing-X32.zip) | 17.6 MB |

## Windows

1. Run `ForceRacing-X64-Setup.exe` (or `ForceRacing-X32-Setup.exe` on 32-bit machines).
2. The installer creates a **Force Racing** shortcut on the desktop and in the Start Menu, with the Force Racing icon.
3. Launch it. The Pit Wall server starts locally and the app window opens to the sign-in screen.

Installs to `%LOCALAPPDATA%\Force Racing` — no administrator rights required.
Windows may show "Unknown publisher" because the build is not code-signed: choose **More info → Run anyway**.

## Android

1. Copy `ForceRacing-Android-APK.apk` to the phone and open it.
2. Allow "Install unknown apps" for the browser/file manager you used.
3. Install and launch **Force Racing**.
4. Allow the notification / photo prompts on first launch (used for alerts and uploads).

The APK embeds Python 3.11 and the Flask application itself (Chaquopy). It does **not** load the website — the
templates, styles, database and server all run on the phone. Works offline; no account or network is needed to open
the app.

## Sign in

- Member demo: `member_navya` / `Member@2026`
- Leadership demo: `captain` / `Captain@2026`

New members can create an account from the sign-in screen. Signup stores name, username, email, phone,
year of study, subsystem, role, password hash and consent in the app database.

## Notes

- Desktop builds bundle their own Python runtime and SQLite database; user data stays on the machine.
- Android data is stored in the app's private storage and survives restarts.
- The app follows the operating system's light/dark preference.
- Android build includes haptic feedback on taps, form submits and connection changes.
- Version: 2.5.1
