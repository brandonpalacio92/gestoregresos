@echo off
echo ========================================
echo    LIMPIANDO PUERTOS
echo ========================================
echo.

echo [1/2] Cerrando procesos en puerto 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    if not "%%a"=="0" (
        echo Cerrando proceso %%a...
        taskkill /PID %%a /F > nul 2>&1
    )
)

echo [2/2] Cerrando procesos en puerto 8101...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8101') do (
    if not "%%a"=="0" (
        echo Cerrando proceso %%a...
        taskkill /PID %%a /F > nul 2>&1
    )
)

echo.
echo ========================================
echo    PUERTOS LIMPIADOS
echo ========================================
echo.
pause
