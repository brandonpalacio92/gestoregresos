@echo off
echo ========================================
echo    LIMPIEZA AUTOMATICA DEL PROYECTO
echo ========================================
echo.

echo [1/6] Limpiando archivos de build...
if exist www rmdir /s /q www
if exist .angular rmdir /s /q .angular
if exist dist rmdir /s /q dist
if exist out-tsc rmdir /s /q out-tsc
echo ✅ Archivos de build eliminados

echo [2/6] Limpiando node_modules...
if exist node_modules rmdir /s /q node_modules
if exist backend\node_modules rmdir /s /q backend\node_modules
echo ✅ node_modules eliminados

echo [3/6] Limpiando archivos temporales...
del /q *.log 2>nul
del /q backend\*.log 2>nul
del /q .cache 2>nul
del /q .parcel-cache 2>nul
echo ✅ Archivos temporales eliminados

echo [4/6] Limpiando archivos de Android...
if exist android\app\build rmdir /s /q android\app\build
if exist android\build rmdir /s /q android\build
if exist android\.gradle rmdir /s /q android\.gradle
echo ✅ Archivos de Android eliminados

echo [5/6] Limpiando archivos de Capacitor...
if exist android\app\src\main\assets\capacitor.config.json del /q android\app\src\main\assets\capacitor.config.json
if exist android\app\src\main\assets\capacitor.plugins.json del /q android\app\src\main\assets\capacitor.plugins.json
echo ✅ Archivos de Capacitor eliminados

echo [6/6] Reinstalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias del frontend
    pause
    exit /b 1
)

cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias del backend
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo    LIMPIEZA COMPLETADA EXITOSAMENTE
echo ========================================
echo.
echo El proyecto ha sido limpiado y las dependencias reinstaladas.
echo Puedes ejecutar 'npm start' para iniciar el desarrollo.
echo.
pause
