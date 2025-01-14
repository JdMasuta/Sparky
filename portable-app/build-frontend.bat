@echo off
set BASE_DIR=%~dp0
cd "%BASE_DIR%frontend"

:: Run build using portable node
echo Building frontend...
call ..\runtime\node-portable\node.exe ..\runtime\node-portable\node_modules\npm\bin\npm-cli.js run build

echo Frontend built successfully! Files are in frontend/dist directory
pause