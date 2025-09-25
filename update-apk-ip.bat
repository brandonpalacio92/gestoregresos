@echo off
echo ========================================
echo    ACTUALIZANDO IP PARA APK
echo ========================================
echo.

echo [1/3] Detectando IP local...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        set LOCAL_IP=%%b
        goto :found_ip
    )
)

:found_ip
echo IP detectada: %LOCAL_IP%

echo [2/3] Actualizando environment.apk.ts...
powershell -Command "(Get-Content 'src/environments/environment.apk.ts') -replace '192\.168\.1\.7', '%LOCAL_IP%' | Set-Content 'src/environments/environment.apk.ts'"
echo ✅ Archivo actualizado

echo [3/3] Reconstruyendo APK...
call ionic build --configuration=apk
if %errorlevel% neq 0 (
    echo ❌ Error en el build
    pause
    exit /b 1
)

call npx cap sync
if %errorlevel% neq 0 (
    echo ❌ Error sincronizando
    pause
    exit /b 1
)

echo.
echo ========================================
echo    APK ACTUALIZADO
echo ========================================
echo.
echo IP actualizada a: %LOCAL_IP%
echo.
echo Para generar el APK:
echo 1. Ejecuta: npx cap open android
echo 2. En Android Studio: Build → Build APK(s)
echo.
echo O ejecuta: build-apk-gradle.bat
echo.
pause
