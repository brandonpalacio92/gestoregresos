# Configuración del Sistema de Autenticación - GestorEgresos

## 📋 Resumen

Se ha implementado un sistema completo de autenticación para la aplicación GestorEgresos que incluye:

- **Backend**: API REST con JWT, bcrypt, rate limiting
- **Frontend**: Páginas de login/registro, guards, interceptors
- **Base de datos**: Tabla de usuarios con migraciones
- **Seguridad**: Tokens de acceso y refresh, validaciones

## 🚀 Instalación y Configuración

### 1. Backend

#### Instalar dependencias adicionales:
```bash
cd backend
npm install bcryptjs jsonwebtoken express-rate-limit
```

#### Configurar variables de entorno:
Crear archivo `.env` en la carpeta `backend/`:
```env
# Base de datos
DATABASE_URL=postgresql://username:password@host:port/database

# JWT
JWT_SECRET=tu-clave-secreta-muy-segura-aqui
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=tu-clave-refresh-muy-segura-aqui
JWT_REFRESH_EXPIRES_IN=30d

# Servidor
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:4200
```

#### Ejecutar migraciones:
```bash
# Verificar estado de migraciones
npm run migrate:status

# Ejecutar migraciones
npm run migrate
```

#### Iniciar el servidor:
```bash
npm run dev
```

### 2. Frontend

#### Instalar dependencias adicionales:
```bash
npm install @ionic/storage-angular --legacy-peer-deps
```

#### Iniciar la aplicación:
```bash
npm start
```

## 📁 Estructura de Archivos Creados

### Backend
```
backend/
├── src/
│   ├── models/
│   │   └── User.js                 # Modelo de usuario con validaciones
│   ├── middleware/
│   │   └── auth.js                 # Middleware de autenticación JWT
│   ├── routes/
│   │   └── auth.js                 # Rutas de autenticación
│   ├── migrations/
│   │   └── 001_create_users_table.sql  # Migración de tabla usuarios
│   └── scripts/
│       └── migrate.js              # Script para ejecutar migraciones
└── package.json                    # Actualizado con scripts de migración
```

### Frontend
```
src/app/
├── services/
│   └── auth.service.ts             # Servicio de autenticación
├── core/
│   ├── guards/
│   │   ├── auth.guard.ts           # Guard para rutas protegidas
│   │   └── guest.guard.ts          # Guard para rutas de invitados
│   └── interceptors/
│       └── auth.interceptor.ts     # Interceptor HTTP para tokens
├── pages/
│   ├── login/                      # Página de login
│   │   ├── login.page.ts
│   │   ├── login.page.html
│   │   ├── login.page.scss
│   │   ├── login.module.ts
│   │   └── login-routing.module.ts
│   └── register/                   # Página de registro
│       ├── register.page.ts
│       ├── register.page.html
│       ├── register.page.scss
│       ├── register.module.ts
│       └── register-routing.module.ts
├── environments/
│   └── environment.auth.ts         # Configuración de autenticación
├── app.module.ts                   # Actualizado con storage e interceptor
└── app-routing.module.ts           # Actualizado con guards
```

## 🔐 Endpoints de la API

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/me` - Obtener usuario actual
- `PUT /api/auth/profile` - Actualizar perfil
- `POST /api/auth/change-password` - Cambiar contraseña
- `POST /api/auth/logout` - Cerrar sesión

### Ejemplo de uso:
```typescript
// Login
const response = await this.authService.login('usuario@email.com', 'password123').toPromise();

// Registro
const newUser = await this.authService.register({
  email: 'nuevo@email.com',
  password: 'password123',
  nombre: 'Juan',
  apellido: 'Pérez'
}).toPromise();
```

## 🛡️ Características de Seguridad

### Backend
- **Rate Limiting**: Máximo 5 intentos de login por IP cada 15 minutos
- **Bcrypt**: Contraseñas hasheadas con salt rounds 12
- **JWT**: Tokens de acceso (7 días) y refresh (30 días)
- **Validaciones**: Email, contraseña, datos de usuario
- **Soft Delete**: Usuarios desactivados en lugar de eliminados

### Frontend
- **Guards**: Protección de rutas automática
- **Interceptors**: Tokens agregados automáticamente a las peticiones
- **Storage**: Tokens almacenados de forma segura
- **Validaciones**: Formularios con validación en tiempo real
- **Refresh Token**: Renovación automática de tokens

## 🔄 Flujo de Autenticación

1. **Registro/Login**: Usuario se registra o inicia sesión
2. **Tokens**: Se reciben access token y refresh token
3. **Storage**: Tokens se almacenan localmente
4. **Peticiones**: Interceptor agrega token a todas las peticiones API
5. **Expiración**: Si el token expira, se renueva automáticamente
6. **Logout**: Se limpian los tokens y se redirige al login

## 🧪 Pruebas

### Probar el backend:
```bash
# Verificar que el servidor esté corriendo
curl http://localhost:3000/health

# Probar registro
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","nombre":"Test","apellido":"User"}'
```

### Probar el frontend:
1. Navegar a `http://localhost:8100`
2. Debería redirigir automáticamente a `/login`
3. Crear una cuenta nueva o iniciar sesión
4. Verificar que las rutas protegidas funcionen

## 🚨 Solución de Problemas

### Error de conexión a la base de datos:
- Verificar que `DATABASE_URL` esté configurado correctamente
- Ejecutar las migraciones: `npm run migrate`

### Error de CORS:
- Verificar que `FRONTEND_URL` en el backend coincida con la URL del frontend

### Tokens no se renuevan:
- Verificar que `JWT_REFRESH_SECRET` esté configurado
- Revisar los logs del interceptor en el navegador

### Páginas no se cargan:
- Verificar que los guards estén configurados correctamente
- Revisar la consola del navegador para errores

## 📝 Notas Adicionales

- El sistema está configurado para desarrollo. Para producción, cambiar las URLs y configuraciones de seguridad.
- Los tokens se almacenan en el storage local del navegador.
- El sistema incluye validaciones tanto en frontend como backend.
- Se implementó rate limiting para prevenir ataques de fuerza bruta.
- La base de datos incluye índices para optimizar las consultas.

## 🎯 Próximos Pasos

1. **Configurar HTTPS** para producción
2. **Implementar recuperación de contraseña** por email
3. **Agregar autenticación de dos factores** (2FA)
4. **Implementar roles y permisos** de usuario
5. **Agregar logs de auditoría** para seguridad
