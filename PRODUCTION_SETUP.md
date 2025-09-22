# 🚀 Configuración de Producción - GestorEgresos

## 📋 Pasos para configurar la base de datos de producción

### 1. **Configurar Base de Datos de Producción**

#### Opción A: Usar Neon.tech (Recomendado)
1. Ve a [Neon.tech](https://neon.tech) y crea una nueva base de datos
2. Copia la URL de conexión
3. Edita `backend/production.env` y actualiza:
   ```env
   DATABASE_URL=postgresql://usuario:password@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   JWT_SECRET=tu_clave_super_segura_para_produccion
   ```

#### Opción B: Usar tu propia base de datos PostgreSQL
1. Instala PostgreSQL en tu servidor
2. Crea una base de datos llamada `gestoregresos_prod`
3. Actualiza `backend/production.env` con tu configuración

### 2. **Replicar el Esquema de la Base de Datos**

```bash
# Navegar al directorio backend
cd backend

# Configurar la base de datos de producción
npm run setup-prod
```

### 3. **Configurar la Aplicación Móvil**

#### Opción A: Usar tu IP local (Para pruebas)
1. Encuentra tu IP local:
   ```bash
   ipconfig
   ```
2. Edita `src/environments/environment.prod.ts`:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'http://192.168.1.100:3000/api', // Tu IP local
   };
   ```

#### Opción B: Usar un servidor en la nube
1. Despliega tu backend en Heroku, Railway, o similar
2. Edita `src/environments/environment.prod.ts`:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://tu-app.herokuapp.com/api',
   };
   ```

### 4. **Reconstruir y Regenerar la APK**

```bash
# Reconstruir la aplicación
ionic build --prod

# Sincronizar con Capacitor
npx cap sync

# Abrir en Android Studio
npx cap open android
```

### 5. **Iniciar el Servidor de Producción**

```bash
# En el directorio backend
npm run prod
```

## 🔧 Configuración Avanzada

### Variables de Entorno de Producción

Archivo: `backend/production.env`
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://usuario:password@host:port/database?sslmode=require
JWT_SECRET=tu_clave_super_segura
CORS_ORIGIN=capacitor://localhost,http://localhost,https://tu-dominio.com
```

### Configuración de CORS para Móvil

Para que la aplicación móvil funcione, asegúrate de incluir:
- `capacitor://localhost` (para Android)
- `http://localhost` (para desarrollo)
- Tu IP local (para pruebas)

### Verificar Conexión

1. **Probar la API:**
   ```bash
   curl http://tu-servidor:3000/health
   ```

2. **Probar desde la app móvil:**
   - Abre la aplicación
   - Intenta hacer login
   - Verifica que los datos se carguen

## 🐛 Solución de Problemas

### Error: "No se puede conectar a la base de datos"
- Verifica que `DATABASE_URL` sea correcta
- Asegúrate de que la base de datos esté accesible
- Verifica que el firewall permita conexiones

### Error: "CORS policy"
- Actualiza `CORS_ORIGIN` en `production.env`
- Incluye `capacitor://localhost` para Android

### Error: "Ruta no encontrada" en la app móvil
- Verifica que `apiUrl` en `environment.prod.ts` sea correcta
- Asegúrate de que el servidor esté ejecutándose
- Verifica la conectividad de red

## 📱 Próximos Pasos

1. **Pruebas en dispositivo real**
2. **Optimización de rendimiento**
3. **Configuración de notificaciones push**
4. **Publicación en Google Play Store**

## 🎉 ¡Felicitaciones!

Tu aplicación móvil de gestión de egresos está lista para producción. Has creado una aplicación completa con:
- ✅ Backend robusto con Node.js y PostgreSQL
- ✅ Frontend móvil con Ionic y Angular
- ✅ Autenticación segura con JWT
- ✅ Gestión completa de egresos
- ✅ Reportes y análisis
- ✅ Interfaz responsive y moderna
