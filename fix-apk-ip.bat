@echo off
echo ========================================
echo    SOLUCIONANDO IP DEL APK
echo ========================================
echo.

echo [1/2] Detectando IP local...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        echo IP detectada: %%b
        set LOCAL_IP=%%b
        goto :found_ip
    )
)

:found_ip
echo.
echo ========================================
echo    INSTRUCCIONES
echo ========================================
echo.
echo 1. Abre el archivo: src/environments/environment.apk.ts
echo 2. Cambia todas las ocurrencias de "192.168.1.7" por "%LOCAL_IP%"
echo 3. Guarda el archivo
echo 4. Ejecuta: ionic build --configuration=apk
echo 5. Ejecuta: npx cap sync
echo 6. Ejecuta: npx cap open android
echo.
echo O ejecuta: build-apk-gradle.bat
echo.
pause
