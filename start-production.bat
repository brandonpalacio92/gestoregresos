@echo off
echo ========================================
echo    INICIANDO GESTOR EGRESOS - PRODUCCION
echo ========================================
echo.

echo [1/3] Construyendo aplicación para producción...
call ionic build --prod
if %errorlevel% neq 0 (
    echo ❌ Error en el build de producción
    pause
    exit /b 1
)

echo [2/3] Sincronizando con Capacitor...
call npx cap sync
if %errorlevel% neq 0 (
    echo ❌ Error sincronizando con Capacitor
    pause
    exit /b 1
)

echo [3/3] Limpiando puertos...
call clean-ports.bat

echo [3/3] Iniciando servidores de producción...
echo.
start "Backend Producción" cmd /k "cd backend && node start-production-direct.js"
timeout /t 3 /nobreak > nul
start "Frontend Producción" cmd /k "node serve-production.js"

echo.
echo ========================================
echo    APLICACION EN PRODUCCION
echo ========================================
//echo Backend: http://localhost:3000
//echo Frontend: http://localhost:8101
echo.
echo ========================================
echo    ACCESO DESDE RED LOCAL
echo ========================================
echo Backend: http://192.168.1.7:3000
echo Frontend: http://192.168.1.7:8101
echo.
echo ========================================
echo    PARA GENERAR APK
echo ========================================
echo Ejecuta: npx cap open android
echo.
echo Presiona cualquier tecla para cerrar...
pause > nul
