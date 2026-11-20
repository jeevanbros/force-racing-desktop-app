; Force Racing - Windows x86 (32-bit) installer
#define AppName "Force Racing"
#define AppVersion "2.5.1"

[Setup]
AppId={{9C1E4B62-7A5D-4F0A-9E3B-FR2026PITWALL}}
AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} {#AppVersion} (32-bit)
AppPublisher=Force Racing
AppPublisherURL=https://github.com/jeevanbros/force-racing-desktop-app
DefaultDirName={localappdata}\Force Racing
DefaultGroupName={#AppName}
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
OutputDir=output-x86
OutputBaseFilename=Force-Racing-X32-Setup-{#AppVersion}
SetupIconFile=..\app-icon.ico
UninstallDisplayIcon={app}\ForceRacing-PC-x86.exe
Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
ArchitecturesAllowed=x86compatible
MinVersion=10.0
CloseApplications=yes
RestartApplications=no
UsePreviousAppDir=no

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a &desktop shortcut"; GroupDescription: "Shortcuts:"

[Files]
Source: "..\..\AppData\Local\Temp\opencode\fr-x86-clean\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\{#AppName}"; Filename: "{app}\python\pythonw.exe"; Parameters: "desktop_launcher.py"; WorkingDir: "{app}"; IconFilename: "{app}\static\images\icon.ico"; Comment: "Force Racing Pit Wall"
Name: "{autodesktop}\{#AppName}"; Filename: "{app}\python\pythonw.exe"; Parameters: "desktop_launcher.py"; WorkingDir: "{app}"; IconFilename: "{app}\static\images\icon.ico"; Tasks: desktopicon; Comment: "Force Racing Pit Wall"

[Run]
Filename: "{app}\python\pythonw.exe"; Parameters: "desktop_launcher.py"; WorkingDir: "{app}"; Description: "Launch {#AppName}"; Flags: nowait postinstall skipifsilent
