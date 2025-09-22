#!/bin/bash
set -e

echo "🔧 Verificando versión de Node.js..."
node --version
npm --version

echo "📦 Instalando dependencias..."
npm ci

echo "🏗️ Construyendo aplicación Angular..."
npm run build:prod

echo "✅ Build completado exitosamente!"
