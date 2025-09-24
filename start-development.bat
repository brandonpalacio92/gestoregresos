@echo off
echo ========================================
echo    INICIANDO GESTOR EGRESOS - DESARROLLO
echo ========================================
echo.

echo [1/2] Iniciando Backend en modo desarrollo...
start "Backend Desarrollo" cmd /k "cd backend && set NODE_ENV=development && node server.js"

echo [2/2] Esperando 3 segundos para que el backend inicie...
timeout /t 3 /nobreak > nul

echo [2/2] Iniciando Frontend en modo desarrollo...
start "Frontend Desarrollo" cmd /k "ionic serve --host=192.168.1.7 --port=8101 --open=false"

echo.
echo ========================================
echo    APLICACION EN DESARROLLO
echo ========================================
echo Backend: http://192.168.1.7:3000
echo Frontend: http://192.168.1.7:8101
echo.
echo ========================================
echo    ACCESO DESDE RED LOCAL
echo ========================================
echo Backend: http://192.168.1.7:3000
echo Frontend: http://192.168.1.7:8101
echo.
echo ========================================
echo    NOTA IMPORTANTE
echo ========================================
echo Si el navegador se abre en localhost:8101:
echo 1. Cierra esa pestaña
echo 2. Abre manualmente: http://192.168.1.7:8101
echo 3. O usa el enlace de arriba
echo.
echo Presiona cualquier tecla para cerrar...
pause > nul
