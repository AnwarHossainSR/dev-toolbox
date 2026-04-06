# Password Merge Tool - Enhancement Summary

## Current Status
✅ Backend API fully supports Login Data SQLite files (route.ts)
✅ Timestamp-based conflict resolution implemented
✅ Chrome epoch time conversion working
✅ Security: Files processed in memory only
✅ Automatic cleanup of temp SQLite files

## What Needs UI Updates

### 1. Add Login Data Upload Slots
**File**: `components/tools/password-merge.tsx`
**Lines to add after line 308**:
```typescript
const [loginDataA, setLoginDataA] = useState<LoginDataSlot>(null);
const [loginDataB, setLoginDataB] = useState<LoginDataSlot>(null);
```

### 2. Change Default Conflict Resolution
**Line 311**: Change from `"b"` to `"timestamp"`
```typescript
const [preferNewer, setPreferNewer] = useState<"a" | "b" | "timestamp">("timestamp");
```

### 3. Update doMerge Function
**Line 323**: Add Login Data files to FormData
```typescript
if (loginDataA) form.append("loginDataA", loginDataA.file);
if (loginDataB) form.append("loginDataB", loginDataB.file);
```

### 4. Add Login Data Upload UI
**After line 360** (after CSV upload section), add:
- Two new FileDrop components for Login Data
- File path instructions for Windows/macOS
- Accept `.db,.sqlite,.sqlite3` files

### 5. Update Conflict Resolution Options
**Line 370**: Add "timestamp" option as first choice
- Icon: ⏱️
- Label: "Auto (Use Timestamps)"
- Description: "Keep password with latest date_password_modified"
- Mark as RECOMMENDED when Login Data files present

## Backend Already Handles

✅ SQLite parsing with better-sqlite3
✅ Chrome timestamp conversion (microseconds since 1601)
✅ Automatic timestamp enrichment
✅ Conflict resolution based on date_password_modified
✅ Fallback to date_created if modified date missing
✅ Secure temp file cleanup

## Testing Checklist

- [ ] Upload Chrome CSV + Chrome Login Data
- [ ] Upload Edge CSV + Edge Login Data  
- [ ] Verify timestamp-based resolution works
- [ ] Check conflicts show which password is newer
- [ ] Confirm temp files are deleted
- [ ] Test without Login Data (fallback mode)

## File Locations

**Chrome Login Data**:
- Windows: `%LOCALAPPDATA%\Google\Chrome\User Data\Default\Login Data`
- macOS: `~/Library/Application Support/Google/Chrome/Default/Login Data`

**Edge Login Data**:
- Windows: `%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Login Data`
- macOS: `~/Library/Application Support/Microsoft Edge/Default/Login Data`

## Notes

- Browser must be closed to copy Login Data file (file is locked when browser is open)
- Login Data is SQLite database, not CSV
- Contains encrypted passwords (decrypted server-side with DPAPI on Windows)
- Timestamps are in Chrome epoch format (microseconds since Jan 1, 1601)
