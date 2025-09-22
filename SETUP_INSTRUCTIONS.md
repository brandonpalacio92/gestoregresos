# 🚀 Instrucciones de Configuración - GestorEgresos

## ✅ Cambios Realizados

1. **Servidor minimal eliminado** - Se eliminó `backend/src/server-minimal.js`
2. **Driver actualizado** - Ahora usa `@neondatabase/serverless` (optimizado para Neon.tech)
3. **Package.json actualizado** - Ahora apunta al servidor completo
4. **Dependencias actualizadas** - Neon.tech serverless driver, Helmet, Morgan
5. **Base de datos simplificada** - Sin Sequelize, consultas SQL directas

## 🔧 Configuración para Pruebas

### 1. Crear archivo .env
Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```bash
# Configuración del servidor
PORT=3000
NODE_ENV=development

# Configuración de la base de datos PostgreSQL con Neon.tech Serverless
# Usar la URL de conexión de Neon.tech (Node.js driver)
DATABASE_URL=postgresql://neondb_owner:npg_VYwliQ8A6UrK@ep-icy-feather-adcjqp0b-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Configuración de JWT
JWT_SECRET=tu_jwt_secret_super_seguro_aqui_para_desarrollo
JWT_EXPIRES_IN=7d

# Configuración del frontend
FRONTEND_URL=http://localhost:4200

# Configuración de seguridad
BCRYPT_ROUNDS=12

# Configuración de logs
LOG_LEVEL=info
```

### 2. Instalar dependencias del backend
```bash
cd backend
npm install
```

### 3. Iniciar el servidor
```bash
# Desde la carpeta backend
npm run dev

# O desde la raíz del proyecto
node src/server.js
```

## 🗄️ Configuración de Base de Datos

### Neon.tech Serverless Driver
- **Driver**: `@neondatabase/serverless` (optimizado para Neon.tech)
- **Conexión**: Serverless, sin pool de conexiones
- **Consultas**: SQL directo con template literals
- **Ventajas**: Más rápido, menos overhead, optimizado para la nube

## 📡 Endpoints Disponibles

- `GET /` - Información de la API
- `GET /health` - Estado de la base de datos
- `GET /api` - Lista de endpoints disponibles
- `GET /api/categorias` - Gestión de categorías
- `GET /api/tipos-egreso` - Gestión de tipos de egreso

## 🔍 Verificación

El servidor mostrará:
```
🚀 Servidor corriendo en puerto 3000
📱 Frontend URL: http://localhost:4200
🔗 API URL: http://localhost:3000
🗄️ Base de datos: PostgreSQL (Neon.tech Serverless)
📡 API Endpoints: http://localhost:3000/api
✅ PostgreSQL conectado exitosamente
```

## 🚨 Notas Importantes

1. **Driver optimizado** - Usa `@neondatabase/serverless` específico para Neon.tech
2. **Consultas SQL directas** - Sin ORM, consultas más rápidas y eficientes
3. **Serverless** - Sin pool de conexiones, conexiones bajo demanda
4. **CORS configurado** - Para `http://localhost:4200` (Angular/Ionic)
5. **Tablas automáticas** - Se crean automáticamente al iniciar el servidor
