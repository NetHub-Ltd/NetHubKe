@echo off
echo Killing all Python processes...

REM Kill all python processes forcefully
taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM pythonw.exe >nul 2>&1

REM Optional: kill uvicorn specifically (if running as module)
taskkill /F /IM uvicorn.exe >nul 2>&1

echo Done.
pause