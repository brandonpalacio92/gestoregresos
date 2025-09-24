@echo off
echo ========================================
echo    CONFIGURANDO FIREWALL PARA NODE.JS
echo ========================================
echo.

echo IMPORTANTE: Este script debe ejecutarse como Administrador
echo.
echo Configurando reglas de firewall para permitir conexiones...
echo.

echo [1/2] Configurando regla para puerto 3000 (Backend)...
netsh advfirewall firewall add rule name="Node.js Backend" dir=in action=allow protocol=TCP localport=3000

echo [2/2] Configurando regla para puerto 8101 (Frontend)...
netsh advfirewall firewall add rule name="Node.js Frontend" dir=in action=allow protocol=TCP localport=8101

echo.
echo ========================================
echo    FIREWALL CONFIGURADO
echo ========================================
echo.
echo Ahora puedes:
echo 1. Ejecutar: start-production.bat
echo 2. Probar desde tu celular: http://192.168.1.7:8101
echo.
echo Presiona cualquier tecla para cerrar...
pause > nul
