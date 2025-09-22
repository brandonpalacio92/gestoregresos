@echo off
echo 🚀 Iniciando backend...
start cmd /k "cd /d C:\Users\Asus\GestorEgresos\backend && npm run dev"

timeout /t 2 >nul

echo 📱 Iniciando frontend...
start cmd /k "cd /d C:\Users\Asus\GestorEgresos && ionic serve --external"
