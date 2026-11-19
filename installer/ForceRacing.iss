; Force Racing - Windows installer (Inno Setup)
#define AppName "Force Racing"
#define AppVersion "2.5.0"
#define AppExe "ForceRacing.exe"

[Setup]
AppId={{9C1E4B62-7A5D-4F0A-9E3B-FR2026PITWALL}}
AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} {#AppVersion}
AppPublisher=Force Racing
AppPublisherURL=https://github.com/jeevanbros/force-racing-desktop-app
AppSupportURL=https://github.com/jeevanbros/force-racing-desktop-app
DefaultDirName={localappdata}\Force Racing
DefaultGroupName={#AppName}
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
OutputDir=output
OutputBaseFilename=Force-Racing-Setup-{#AppVersion}
SetupIconFile=..\app-icon.ico
UninstallDisplayIcon={app}\{#AppExe}
Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
MinVersion=10.0
CloseApplications=yes
RestartApplications=no

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a &desktop shortcut"; GroupDescription: "Shortcuts:"

[Files]
Source: "..\..\forceracing-app\dist\ForceRacing\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\{#AppName}"; Filename: "{app}\{#AppExe}"; IconFilename: "{app}\{#AppExe}"; Comment: "Force Racing Pit Wall"
Name: "{autodesktop}\{#AppName}"; Filename: "{app}\{#AppExe}"; IconFilename: "{app}\{#AppExe}"; Tasks: desktopicon; Comment: "Force Racing Pit Wall"

[Run]
Filename: "{app}\{#AppExe}"; Description: "Launch {#AppName}"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
Type: filesandordirs; Name: "{app}\data"
Type: filesandordirs; Name: "{app}\uploads"
