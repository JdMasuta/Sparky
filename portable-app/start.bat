@echo off
:: start.bat - Portable Application Launcher

:: Set base directory
set BASE_DIR=%~dp0

:: First, run the setup script to ensure environment variables are set
call setup.bat

:: Create a new directory for logs if it doesn't exist
if not exist "%BASE_DIR%logs" mkdir "%BASE_DIR%logs"

:: Check if backend directory exists
if not exist "%BASE_DIR%backend" (
    echo Backend directory does not exist.
    exit /b 1
)

:: Check if frontend directory exists
if not exist "%BASE_DIR%frontend" (
    echo Frontend directory does not exist.
    exit /b 1
)

:: Start Backend Server
echo Starting backend server...
cd "%BASE_DIR%backend"
start "Sparky Backend Server" cmd /k "..\runtime\node-portable\node.exe" "src\server.js"

:: Wait a moment for backend to initialize
timeout /t 5

:: Start Frontend Development Server
echo Starting frontend development server...
cd "%BASE_DIR%frontend"
start "Sparky Frontend Server" cmd /k "..\runtime\node-portable\node.exe" "..\runtime\node-portable\node_modules\npm\bin\npm-cli.js" "run" "dev"

echo Application servers started!
echo Backend running at http://localhost:3000
echo Frontend running at http://localhost:5173

:: For development
:: NODE_ENV=development node your-app.js

:: For production
:: NODE_ENV=production node your-app.js

:: For testing
:: NODE_ENV=test node your-app.js