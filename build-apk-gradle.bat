@echo off
echo ========================================
echo    GENERANDO APK CON GRADLE
echo ========================================
echo.

echo [1/4] Construyendo aplicación para APK...
call ionic build --configuration=apk
if %errorlevel% neq 0 (
    echo ❌ Error en el build de la aplicación
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

echo [3/4] Configurando variables de entorno...
set ANDROID_HOME=C:\Users\Asus\AppData\Local\Android\Sdk
set PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools

echo [4/4] Generando APK con Gradle...
cd android
call gradlew assembleDebug
if %errorlevel% neq 0 (
    echo ❌ Error generando APK
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo    APK GENERADO EXITOSAMENTE
echo ========================================
echo.
echo El APK está en: android\app\build\outputs\apk\debug\
echo.
echo Para instalar en tu celular:
echo 1. Conecta tu celular por USB
echo 2. Habilita depuración USB
echo 3. Ejecuta: adb install android\app\build\outputs\apk\debug\app-debug.apk
echo.
pause
