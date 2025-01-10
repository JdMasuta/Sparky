@echo off
:: setup.bat - Environment Setup Script

echo Setting up environment variables for PLC Web App...

:: Server Configuration
set PORT=3000
set CORS_ORIGIN=http://localhost:5173
set NODE_ENV=development
set LOG_LEVEL=info
set LOG_FILE=server.log

:: RSLinx Configuration
set RSLINX_TOPIC=ExcelLink
set RSLINX_POLL_INTERVAL=1000

:: Security Configuration
set JWT_SECRET=your-secret-key
set SESSION_TIMEOUT=3600000

echo Environment variables set successfully!
echo.
echo Current Configuration:
echo ---------------------
echo PORT: %PORT%
echo CORS_ORIGIN: %CORS_ORIGIN%
echo NODE_ENV: %NODE_ENV%
echo LOG_LEVEL: %LOG_LEVEL%
echo.
echo To start the application, run 'start.bat'

pause