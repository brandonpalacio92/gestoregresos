@echo off
echo ========================================
echo    CONFIGURANDO ANDROID SDK
echo ========================================
echo.

echo [1/3] Configurando variable ANDROID_HOME...
setx ANDROID_HOME "C:\Users\Asus\AppData\Local\Android\Sdk" /M
echo ✅ ANDROID_HOME configurado

echo [2/3] Agregando Android SDK al PATH...
setx PATH "%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools" /M
echo ✅ PATH actualizado

echo [3/3] Verificando configuración...
echo ANDROID_HOME: %ANDROID_HOME%
echo.

echo ========================================
echo    CONFIGURACION COMPLETADA
echo ========================================
echo.
echo IMPORTANTE: Reinicia tu terminal o PowerShell
echo para que los cambios surtan efecto.
echo.
echo Luego ejecuta: npx cap open android
echo.
pause
