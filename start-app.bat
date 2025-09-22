@echo off
echo ========================================
echo    INICIANDO GESTOR EGRESOS
echo ========================================
echo.

echo [1/2] Iniciando Backend...
start "Backend" cmd /k "cd backend && node server.js"

echo [2/2] Esperando 3 segundos para que el backend inicie...
timeout /t 3 /nobreak > nul

echo [2/2] Iniciando Frontend...
start "Frontend" cmd /k "ionic serve"

echo.
echo ========================================
echo    APLICACION INICIADA
echo ========================================
echo Backend: http://localhost:3000
echo Frontend: http://localhost:8100
echo.
echo Presiona cualquier tecla para cerrar...
pause > nul
