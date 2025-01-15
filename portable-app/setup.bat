@echo off
:: setup.bat - Environment Setup Script for Portable Version

echo setup.bat: Setting up environment variables for PLC Web App...
echo.

:: Set paths relative to portable app directory
set BASE_DIR=%~dp0
set NODE_PATH=%BASE_DIR%runtime\node-portable
set PATH=%NODE_PATH%;%PATH%

:: Server Configuration
set PORT=3000
set CORS_ORIGIN=http://localhost:5173
::  For development
set NODE_ENV=development 
::  For production
::set NODE_ENV=production
::  For testing
::set NODE_ENV=test
set LOG_LEVEL=info
set LOG_FILE=server.log

:: RSLinx OPC DA Configuration
set RSLINX_TOPIC=ExcelLink
set OPCDA_PROG_ID=RSLinx OPC Server
set OPCDA_CLSID={A0C90780-444E-11D1-B2B4-00A0C9267818}
set OPCDA_GROUP_NAME=DefaultGroup
set OPCDA_UPDATE_RATE=1000
set OPCDA_DEADBAND=0
set OPCDA_MAX_RETRIES=3
set OPCDA_RETRY_INTERVAL=5000
set OPCDA_CACHE_ENABLED=true
set OPCDA_CACHE_UPDATE_RATE=1000

:: Security Configuration
set JWT_SECRET=your-secret-key
set SESSION_TIMEOUT=3600000

echo setup.bat: Environment variables set successfully!
echo.
echo Current Configuration:
echo ---------------------
echo PORT: %PORT%
echo CORS_ORIGIN: %CORS_ORIGIN%
echo NODE_ENV: %NODE_ENV%
echo LOG_LEVEL: %LOG_LEVEL%
echo RSLINX_TOPIC: %RSLINX_TOPIC%
echo OPCDA_PROG_ID: %OPCDA_PROG_ID%
echo.
:: To start the application, run 'start.bat'