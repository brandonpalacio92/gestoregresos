# 💰 GestorEgresos - Aplicación Móvil de Gestión Financiera

Una aplicación móvil completa para gestionar egresos personales, desarrollada con Ionic/Angular y Node.js.

## 🚀 Características

- **Gestión de Egresos**: Registro y seguimiento de gastos
- **Presupuesto Mensual**: Control de presupuestos y ahorros
- **Pagos Parciales**: Sistema de pagos a plazos
- **Reportes Anuales**: Análisis detallado de gastos
- **Configuración Personalizable**: Temas de colores y preferencias
- **Autenticación Segura**: Sistema de login con JWT

## 🛠️ Tecnologías

### Frontend
- **Ionic 8** - Framework móvil
- **Angular 20** - Framework web
- **TypeScript** - Lenguaje de programación
- **Capacitor** - Puente nativo

### Backend
- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **PostgreSQL** - Base de datos (Neon.tech)
- **JWT** - Autenticación

## 📱 Instalación

### Prerrequisitos
- Node.js 18+
- Ionic CLI
- Android Studio (para APK)

### Desarrollo
```bash
# Instalar dependencias
npm install
cd backend && npm install

# Ejecutar en desarrollo
ionic serve
```

### Producción
```bash
# Construir aplicación
ionic build --prod

# Generar APK
npx cap sync
npx cap open android
```

## 🌐 Despliegue

La aplicación está configurada para desplegarse en Railway:

1. **Backend**: Automáticamente desplegado en Railway
2. **Base de datos**: Neon.tech (PostgreSQL en la nube)
3. **Frontend**: Compilado y empaquetado para Android

## 📊 Estructura del Proyecto

```
GestorEgresos/
├── src/                    # Código fuente Angular/Ionic
├── backend/               # API Node.js/Express
├── android/               # Proyecto Android nativo
├── www/                   # Build de producción
└── railway.json          # Configuración de Railway
```

## 🔧 Configuración

### Variables de Entorno
- `DATABASE_URL`: URL de la base de datos Neon.tech
- `JWT_SECRET`: Clave secreta para JWT
- `CORS_ORIGIN`: Orígenes permitidos para CORS

### Base de Datos
- **Tablas**: usuarios, categorias_egreso, tipo_egreso, egresos, presupuesto_mensual
- **Datos iniciales**: Categorías y tipos de egreso predefinidos

## 📱 Uso

1. **Registro/Login**: Crear cuenta o iniciar sesión
2. **Registrar Egresos**: Agregar gastos con categorías
3. **Gestión Mensual**: Ver resumen y presupuesto
4. **Reportes**: Análisis anual de gastos
5. **Configuración**: Personalizar colores y preferencias

## 🚀 Despliegue en Railway

1. Conectar repositorio en Railway
2. Configurar variables de entorno
3. Desplegar automáticamente
4. Actualizar URL en la app móvil

## 📄 Licencia

Este proyecto es de uso personal y educativo.

## 👨‍💻 Desarrollado con IA

Aplicación desarrollada con asistencia de IA, demostrando las capacidades de desarrollo colaborativo humano-IA.