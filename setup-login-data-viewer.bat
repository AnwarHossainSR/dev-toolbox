@echo off
echo ========================================
echo Login Data Viewer - Setup Script
echo ========================================
echo.

echo Step 1: Installing node-dpapi package...
call npm install node-dpapi
if %errorlevel% neq 0 (
    echo ERROR: Failed to install node-dpapi
    pause
    exit /b 1
)
echo ✓ node-dpapi installed successfully
echo.

echo Step 2: Checking data directories...
if not exist "data\chrome-login-data" mkdir "data\chrome-login-data"
if not exist "data\edge-login-data" mkdir "data\edge-login-data"
echo ✓ Data directories ready
echo.

echo Step 3: Copying Login Data files...
echo.
echo IMPORTANT: Close Chrome and Edge browsers before continuing!
echo Press any key when browsers are closed...
pause >nul
echo.

echo Copying Chrome Login Data...
set CHROME_SOURCE=%LOCALAPPDATA%\Google\Chrome\User Data\Default\Login Data
set CHROME_DEST=data\chrome-login-data\Login Data

if exist "%CHROME_SOURCE%" (
    copy "%CHROME_SOURCE%" "%CHROME_DEST%" >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✓ Chrome Login Data copied successfully
    ) else (
        echo ✗ Failed to copy Chrome Login Data
        echo   Make sure Chrome is closed
    )
) else (
    echo ✗ Chrome Login Data not found at: %CHROME_SOURCE%
)
echo.

echo Copying Edge Login Data...
set EDGE_SOURCE=%LOCALAPPDATA%\Microsoft\Edge\User Data\Default\Login Data
set EDGE_DEST=data\edge-login-data\Login Data

if exist "%EDGE_SOURCE%" (
    copy "%EDGE_SOURCE%" "%EDGE_DEST%" >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✓ Edge Login Data copied successfully
    ) else (
        echo ✗ Failed to copy Edge Login Data
        echo   Make sure Edge is closed
    )
) else (
    echo ✗ Edge Login Data not found at: %EDGE_SOURCE%
)
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start the dev server: npm run dev
echo 2. Navigate to: http://localhost:3000/dashboard/tools/login-data-viewer
echo 3. Click "Load Data" to view your passwords
echo.
echo To update passwords later:
echo - Close browsers
echo - Run this script again
echo.
pause
