@echo off
echo ========================================
echo    GENERANDO APK PARA ANDROID
echo ========================================
echo.

echo [1/4] Construyendo aplicación para producción...
call ionic build --prod
if %errorlevel% neq 0 (
    echo ❌ Error en el build de producción
    pause
    exit /b 1
)

echo [2/4] Sincronizando con Capacitor...
call npx cap sync
if %errorlevel% neq 0 (
    echo ❌ Error sincronizando con Capacitor
    pause
    exit /b 1
)

echo [3/4] Abriendo Android Studio...
call npx cap open android
if %errorlevel% neq 0 (
    echo ❌ Error abriendo Android Studio
    pause
    exit /b 1
)

echo.
echo ========================================
echo    APK LISTO PARA GENERAR
echo ========================================
echo 1. Android Studio se está abriendo...
echo 2. Conecta tu celular por USB
echo 3. Haz clic en el botón verde "Run" (▶️)
echo 4. El APK se instalará automáticamente
echo.
echo ========================================
echo    ALTERNATIVA: APK MANUAL
echo ========================================
echo Si prefieres generar APK manualmente:
echo 1. En Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
echo 2. El APK estará en: android\app\build\outputs\apk\debug\
echo.
echo Presiona cualquier tecla para cerrar...
pause > nul
