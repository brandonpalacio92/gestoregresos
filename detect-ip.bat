@echo off
echo ========================================
echo    DETECTANDO IP LOCAL
echo ========================================
echo.

echo [1/2] Detectando IP local...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        echo IP detectada: %%b
        set LOCAL_IP=%%b
    )
)

echo.
echo ========================================
echo    CONFIGURACION ACTUAL
echo ========================================
echo IP en environment.apk.ts: 192.168.1.7
echo IP detectada: %LOCAL_IP%
echo.

if "%LOCAL_IP%"=="192.168.1.7" (
    echo ✅ Las IPs coinciden
) else (
    echo ⚠️  Las IPs NO coinciden
    echo.
    echo Para solucionarlo:
    echo 1. Actualiza src/environments/environment.apk.ts
    echo 2. Cambia 192.168.1.7 por %LOCAL_IP%
    echo 3. Reconstruye el APK
)

echo.
pause
