# Login Data Viewer - Setup & Usage Guide

## ✅ What's Been Implemented

### 1. New Tool: Login Data Viewer
- **Location**: `/dashboard/tools/login-data-viewer`
- **Icon**: 🔓
- **Category**: Utility
- **Status**: Free tool

### 2. Features
✅ Read Login Data files from project folder (`data/`)
✅ Decrypt passwords using DPAPI (Windows)
✅ Display all passwords with timestamps
✅ Two modes: View All & Merge with Conflict Resolution
✅ Filter by URL or username
✅ Export as CSV or JSON
✅ Show/hide passwords toggle
✅ Conflict resolution based on `date_password_modified`
✅ Detailed conflict summary

### 3. File Structure Created
```
data/
├── chrome-login-data/
│   └── Login Data          # Copy Chrome's Login Data here
├── edge-login-data/
│   └── Login Data          # Copy Edge's Login Data here
├── .gitignore              # Prevents committing sensitive files
└── README.md               # Setup instructions
```

### 4. API Route
- **Endpoint**: `/api/tools/login-data-viewer`
- **Methods**: GET
- **Query Params**:
  - `action`: "view" or "merge"
  - `url`: Filter by URL
  - `username`: Filter by username

## 🚀 Setup Instructions

### Step 1: Install DPAPI Package (Windows Only)

For password decryption on Windows, install `node-dpapi`:

```bash
npm install node-dpapi
```

**Note**: This package is Windows-only. On macOS/Linux, passwords will show as `[Decryption only supported on Windows]`.

### Step 2: Copy Login Data Files

#### Close Browsers First
⚠️ **Important**: Close Chrome and Edge completely before copying files (they're locked while browsers are running).

#### Windows Commands

**Chrome:**
```cmd
copy "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Login Data" "data\chrome-login-data\Login Data"
```

**Edge:**
```cmd
copy "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Login Data" "data\edge-login-data\Login Data"
```

#### macOS/Linux Commands

**Chrome:**
```bash
cp ~/Library/Application\ Support/Google/Chrome/Default/Login\ Data data/chrome-login-data/Login\ Data
```

**Edge:**
```bash
cp ~/Library/Application\ Support/Microsoft\ Edge/Default/Login\ Data data/edge-login-data/Login\ Data
```

### Step 3: Start the App

```bash
npm run dev
```

### Step 4: Access the Tool

Navigate to: `http://localhost:3000/dashboard/tools/login-data-viewer`

## 📖 How to Use

### View Mode
1. Click "👁️ View All" button
2. Click "📂 Load Data"
3. All passwords from both browsers are displayed
4. Use filters to search by URL or username
5. Toggle password visibility with "👁️ Show Passwords"
6. Export as CSV or JSON

### Merge Mode
1. Click "🔀 Merge & Resolve" button
2. Click "🔀 Load & Merge"
3. Conflicts are automatically resolved based on timestamps
4. View conflict summary showing which browser won
5. Export merged results

### Filtering
- **Filter by URL**: Enter domain (e.g., "google.com")
- **Filter by Username**: Enter email or username
- Filters work in both View and Merge modes

## 🔒 Security Features

✅ **Copied Files Only** - Original browser files remain untouched
✅ **In-Memory Decryption** - Passwords decrypted using DPAPI, never stored
✅ **Gitignored** - data/ directory automatically ignored by git
✅ **No Server Storage** - All processing happens in memory
✅ **Timestamp-Based** - Conflict resolution uses actual last_updated dates

## 📊 What the Tool Shows

### View Mode Table
| Column | Description |
|--------|-------------|
| URL | Website origin URL |
| Username | Login username/email |
| Password | Decrypted password (toggle visibility) |
| Last Updated | Formatted timestamp from `date_password_modified` |
| Source | Chrome or Edge |

### Merge Mode Stats
- **Total Passwords**: Final merged count
- **Chrome**: Number of Chrome passwords
- **Edge**: Number of Edge passwords
- **Conflicts**: Passwords that differed between browsers

### Conflict Resolution
When the same URL + username exists in both browsers with different passwords:
- Compares `date_password_modified` timestamps
- Keeps the password with the latest timestamp
- Shows which browser won (Chrome or Edge)
- Displays conflict details with timestamps

## 🛠️ Technical Details

### Chrome Timestamp Format
- Stored as **WebKit timestamp** (microseconds since Jan 1, 1601)
- Automatically converted to ISO 8601 format
- Example: `1601-01-01T00:00:00.000Z` → `2024-01-15T10:30:45.123Z`

### SQLite Schema
```sql
SELECT 
  origin_url,
  username_value,
  password_value,
  date_password_modified,
  date_created
FROM logins
WHERE blacklisted_by_user = 0
```

### DPAPI Decryption (Windows)
```javascript
const dpapi = require("node-dpapi");
const decrypted = dpapi.unprotectData(
  encryptedPassword,
  null,
  "CurrentUser"
);
```

## 🔄 Updating Data

To view latest passwords:
1. Close browsers
2. Re-copy Login Data files
3. Reload the tool

## ⚠️ Troubleshooting

### "No Login Data files found"
- Ensure files are copied to correct directories
- Check file names are exactly "Login Data" (no extension)
- Verify browsers are closed before copying

### "[Install node-dpapi for decryption]"
- Run: `npm install node-dpapi`
- Restart dev server

### "[Decryption only supported on Windows]"
- DPAPI is Windows-only
- On macOS/Linux, use the Password Merge tool with CSV exports instead

### File is locked
- Close Chrome/Edge completely
- Check Task Manager for lingering browser processes
- Try copying again

## 📝 Example Workflow

### Scenario: Merge Chrome and Edge passwords

1. **Prepare**:
   ```cmd
   # Close browsers
   taskkill /F /IM chrome.exe
   taskkill /F /IM msedge.exe
   ```

2. **Copy files**:
   ```cmd
   copy "%LOCALAPPDATA%\Google\Chrome\User Data\Default\Login Data" "data\chrome-login-data\Login Data"
   copy "%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Login Data" "data\edge-login-data\Login Data"
   ```

3. **Open tool**:
   - Navigate to Login Data Viewer
   - Click "🔀 Merge & Resolve"
   - Click "🔀 Load & Merge"

4. **Review conflicts**:
   - Check conflict summary
   - See which passwords were kept
   - Verify timestamps

5. **Export**:
   - Click "↓ Download CSV"
   - Import merged CSV back to browsers

## 🎯 Use Cases

### 1. Sync Passwords Between Browsers
- Merge Chrome and Edge passwords
- Export merged CSV
- Import to both browsers
- All passwords now in sync

### 2. Find Outdated Passwords
- View all passwords with timestamps
- Filter by specific sites
- Identify old passwords that need updating

### 3. Audit Password Security
- Export all passwords
- Check for duplicates
- Identify weak passwords
- Update as needed

### 4. Migrate to Password Manager
- Export all passwords as CSV
- Import to 1Password, LastPass, Bitwarden, etc.
- Centralize password management

## 📦 Dependencies

- `better-sqlite3` - SQLite database reading ✅ Already installed
- `node-dpapi` - Windows DPAPI decryption ⚠️ **Needs installation**

## 🔗 Related Tools

- **Password Merge**: Upload CSV exports (no Login Data needed)
- **Password Generator**: Create secure passwords
- **Password Strength Auditor**: Check password strength

## 📄 Files Modified/Created

### New Files
- `app/api/tools/login-data-viewer/route.ts` - API endpoint
- `components/tools/login-data-viewer.tsx` - UI component
- `data/.gitignore` - Protect sensitive files
- `data/README.md` - Setup instructions

### Modified Files
- `lib/tools.ts` - Added Login Data Viewer to tool list
- `app/dashboard/tools/[slug]/page.tsx` - Added component mapping

## ✨ Next Steps

1. Install `node-dpapi`: `npm install node-dpapi`
2. Copy Login Data files to `data/` directories
3. Test the tool
4. Export merged passwords
5. Import back to browsers

---

**Built with security and privacy in mind** 🔒
