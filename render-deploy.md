# 🚀 Despliegue en Render - GestorEgresos

## 📋 Pasos para desplegar en Render

### 1. **Crear cuenta en Render**
- Ve a [render.com](https://render.com)
- Regístrate con GitHub
- Conecta tu repositorio

### 2. **Crear Web Service**
- **Build Command:** `cd backend && npm install`
- **Start Command:** `cd backend && npm run prod`
- **Environment:** Node

### 3. **Variables de entorno**
- `NODE_ENV=production`
- `PORT=3000`
- `DATABASE_URL=postgresql://neondb_owner:npg_iqUIK2WoBeC3@ep-mute-mode-adye8fyz-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
- `JWT_SECRET=la_clave_segura_del_proyecto`
- `CORS_ORIGIN=https://tu-app.onrender.com,capacitor://localhost`

### 4. **Desplegar**
- Render se encarga automáticamente
- La URL será: `https://tu-app.onrender.com`

## 🌐 URL resultante:
- **App:** `https://tu-app.onrender.com`
- **API:** `https://tu-app.onrender.com/api`
