# 🚀 Despliegue en Railway - GestorEgresos

## 📋 Pasos para desplegar en Railway

### 1. **Crear cuenta en Railway**
- Ve a [railway.app](https://railway.app)
- Regístrate con GitHub
- Conecta tu repositorio

### 2. **Configurar el proyecto**

#### A. Crear railway.json
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd backend && npm run prod",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### B. Actualizar package.json del backend
```json
{
  "scripts": {
    "start": "node start-production.js",
    "prod": "node start-production.js"
  }
}
```

### 3. **Variables de entorno en Railway**
- `NODE_ENV=production`
- `PORT=3000`
- `DATABASE_URL=tu_url_de_neon_tech`
- `JWT_SECRET=tu_clave_segura`
- `CORS_ORIGIN=https://tu-app.railway.app,capacitor://localhost`

### 4. **Actualizar la app móvil**
```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://tu-app.railway.app/api',
};
```

### 5. **Reconstruir y desplegar**
```bash
ionic build --prod
npx cap sync
npx cap open android
```

## 🌐 URLs resultantes:
- **Backend:** `https://tu-app.railway.app`
- **API:** `https://tu-app.railway.app/api`
- **Health Check:** `https://tu-app.railway.app/health`

## 📱 Configuración final:
- La app móvil se conectará a la API en la nube
- Funcionará desde cualquier lugar con internet
- Base de datos Neon.tech ya está en la nube
