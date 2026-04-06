# Login Data Files Directory

This directory is for **copied** browser Login Data files used by the Login Data Viewer tool.

## Setup Instructions

### 1. Copy Chrome Login Data

**Windows:**
```bash
copy "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Login Data" "data\chrome-login-data\Login Data"
```

**macOS/Linux:**
```bash
cp ~/Library/Application\ Support/Google/Chrome/Default/Login\ Data data/chrome-login-data/Login\ Data
```

### 2. Copy Edge Login Data

**Windows:**
```bash
copy "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Login Data" "data\edge-login-data\Login Data"
```

**macOS/Linux:**
```bash
cp ~/Library/Application\ Support/Microsoft\ Edge/Default/Login\ Data data/edge-login-data/Login\ Data
```

## Important Notes

⚠️ **Close your browser before copying** - The Login Data file is locked while the browser is running

🔒 **Security** - These files contain encrypted passwords. Never commit them to version control (already in .gitignore)

🔄 **Updates** - Re-copy the files whenever you want to view the latest passwords

## Directory Structure

```
data/
├── chrome-login-data/
│   └── Login Data          # Copied Chrome SQLite database
├── edge-login-data/
│   └── Login Data          # Copied Edge SQLite database
└── README.md               # This file
```

## What the Tool Does

1. Reads the copied Login Data files (SQLite databases)
2. Decrypts passwords using OS APIs (DPAPI on Windows)
3. Displays all passwords with last updated timestamps
4. Allows merging Chrome and Edge passwords
5. Exports merged results as CSV/JSON

## Privacy

- All decryption happens in memory only
- No plaintext passwords are ever written to disk
- Original browser files remain untouched
- Copied files are ignored by git
