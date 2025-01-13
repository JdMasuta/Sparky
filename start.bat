echo Starting PLC Web Application...
echo.

:: First, run the setup script to ensure environment variables are set
call setup.bat

:: Create a new directory for logs if it doesn't exist
if not exist "logs" mkdir logs

:: Check if backend directory exists
if not exist "backend" (
    echo Backend directory does not exist.
    exit /b 1
)

:: Start Backend Server
echo Starting backend server...
cd backend\src
if %errorlevel% neq 0 (
    echo Failed to change directory to backend.
    exit /b 1
)
start "Sparky Backend Server" cmd /k "npm run dev"
cd ..\..

:: Wait a moment for backend to initialize
timeout /t 5

:: Check if app directory exists
if not exist "app" (
    echo Frontend directory does not exist.
    exit /b 1
)

:: Start Frontend Development Server
echo Starting frontend development server...
cd app
if %errorlevel% neq 0 (
    echo Failed to change directory to app.
    exit /b 1
)
start "Sparky Frontend Server" cmd /k "npm run dev"
cd ..

echo.