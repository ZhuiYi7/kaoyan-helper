@echo off
setlocal
cd /d "%~dp0"

echo ---------------------------------------------------
echo  Study Helper Task Scheduler (Auto-Run on Boot)
echo ---------------------------------------------------
echo.
echo This script will help you set up a daily task in Windows Task Scheduler.
echo It will run 'node index.js' every morning at 07:00 AM.
echo [NEW] If your PC is off at 07:00, it will run ASAP when you turn it on.
echo.

set "NODE_PATH=node"
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in your PATH.
    echo Please install Node.js or add it to your PATH.
    pause
    exit /b 1
)

set "SCRIPT_PATH=%~dp0index.js"
set "TASK_NAME=StudyHelperDaily"

echo [INFO] Task Name: %TASK_NAME%
echo [INFO] Script Path: %SCRIPT_PATH%
echo.
echo Creating task with XML configuration for advanced settings...

:: Create a temporary XML file for advanced task settings
(
echo ^<?xml version="1.0" encoding="UTF-16"?^>
echo ^<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task"^>
echo   ^<RegistrationInfo^>
echo     ^<Date^>2024-01-01T00:00:00^</Date^>
echo     ^<Author^>StudyHelper^</Author^>
echo     ^<Description^>Daily Study Helper Reminder^</Description^>
echo   ^</RegistrationInfo^>
echo   ^<Triggers^>
echo     ^<CalendarTrigger^>
echo       ^<StartBoundary^>2024-01-01T07:00:00^</StartBoundary^>
echo       ^<Enabled^>true^</Enabled^>
echo       ^<ScheduleByDay^>
echo         ^<DaysInterval^>1^</DaysInterval^>
echo       ^</ScheduleByDay^>
echo     ^</CalendarTrigger^>
echo   ^</Triggers^>
echo   ^<Principals^>
echo     ^<Principal id="Author"^>
echo       ^<LogonType^>InteractiveToken^</LogonType^>
echo       ^<RunLevel^>LeastPrivilege^</RunLevel^>
echo     ^</Principal^>
echo   ^</Principals^>
echo   ^<Settings^>
echo     ^<MultipleInstancesPolicy^>IgnoreNew^</MultipleInstancesPolicy^>
echo     ^<DisallowStartIfOnBatteries^>false^</DisallowStartIfOnBatteries^>
echo     ^<StopIfGoingOnBatteries^>false^</StopIfGoingOnBatteries^>
echo     ^<AllowHardTerminate^>true^</AllowHardTerminate^>
echo     ^<StartWhenAvailable^>true^</StartWhenAvailable^>
echo     ^<RunOnlyIfNetworkAvailable^>true^</RunOnlyIfNetworkAvailable^>
echo     ^<IdleSettings^>
echo       ^<StopOnIdleEnd^>true^</StopOnIdleEnd^>
echo       ^<RestartOnIdle^>false^</RestartOnIdle^>
echo     ^</IdleSettings^>
echo     ^<AllowStartOnDemand^>true^</AllowStartOnDemand^>
echo     ^<Enabled^>true^</Enabled^>
echo     ^<Hidden^>false^</Hidden^>
echo     ^<RunOnlyIfIdle^>false^</RunOnlyIfIdle^>
echo     ^<WakeToRun^>false^</WakeToRun^>
echo     ^<ExecutionTimeLimit^>PT1H^</ExecutionTimeLimit^>
echo     ^<Priority^>7^</Priority^>
echo   ^</Settings^>
echo   ^<Actions Context="Author"^>
echo     ^<Exec^>
echo       ^<Command^>cmd^</Command^>
echo       ^<Arguments^>/c cd /d "%~dp0" ^&amp; node index.js ^&gt;^&gt; output.log 2^&gt;^&amp;1^</Arguments^>
echo     ^</Exec^>
echo   ^</Actions^>
echo ^</Task^>
) > task_config.xml

schtasks /create /tn "%TASK_NAME%" /xml task_config.xml /f

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Task created successfully!
    echo The helper will run automatically every day at 07:00 AM.
    echo [NOTE] If you missed 07:00, it will run automatically when you turn on your PC.
    echo.
) else (
    echo.
    echo [ERROR] Failed to create task. Please try running this script as Administrator.
)

del task_config.xml
pause
