# GestorEgresos 📱

Aplicación móvil para gestión de egresos personales desarrollada con Angular, Ionic y Node.js.

## 🚀 Características

- ✅ Gestión de egresos periódicos y ocasionales
- ✅ Categorización de gastos
- ✅ Reportes mensuales y anuales
- ✅ Presupuesto personalizado
- ✅ Autenticación segura
- ✅ Base de datos PostgreSQL (Neon.tech)

## 🛠️ Tecnologías

- **Frontend:** Angular 20 + Ionic 8
- **Backend:** Node.js + Express
- **Base de datos:** PostgreSQL (Neon.tech)
- **Autenticación:** JWT
- **Plataforma:** Android (Capacitor)

## 📦 Instalación

### Prerrequisitos
- Node.js 20.19.1+
- npm 10.0.0+
- Android Studio (para APK)

### Desarrollo

1. **Clonar el repositorio:**
```bash
git clone https://github.com/brandonpalacio92/gestoregresos.git
cd gestoregresos
```

2. **Instalar dependencias:**
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

3. **Configurar base de datos:**
```bash
#  archivo .env en backend/
DATABASE_URL=postgresql://usuario:password@host:port/database
PORT=3000
JWT_SECRET=tu-clave-secreta
```

4. **Iniciar aplicación:**
```bash
# Opción 1: Script automático
start-app.bat

# Opción 2: Manual
# Terminal 1 - Backend
cd backend && node server.js

# Terminal 2 - Frontend
ionic serve --port=8101
```

## 📱 URLs de acceso

### Local (mismo PC)
- **Frontend:** http://localhost:8101
- **Backend:** http://localhost:3000
- **API:** http://localhost:3000/api

### Red Local (desde otros dispositivos)
- **Frontend:** http://192.168.1.7:8101
- **Backend:** http://192.168.1.7:3000
- **API:** http://192.168.1.7:3000/api

## 🔨 Generar APK

```bash
# Build de producción
ionic build --prod

# Sincronizar con Capacitor
npx cap sync

# Abrir en Android Studio
npx cap open android
```

## 📁 Estructura del proyecto

```
gestoregresos/
├── src/                    # Frontend Angular
├── backend/               # API Node.js
├── android/              # Proyecto Android
├── start-app.bat         # Script de inicio
└── README.md
```

## 🔧 Scripts disponibles
- `start-app.bat` - Iniciar aplicación en modo DESARROLLO
- `start-production.bat` - Iniciar aplicación en modo PRODUCCIÓN
- `build-apk.bat` - Generar APK para Android

### Diferencias
- **Desarrollo:** Usa base de datos de desarrollo (backend/.env)
- **Producción:** Usa base de datos de producción (backend/production-config.js)

## 📄 Licencia

ISC

## 👨‍💻 Autor

Brandon Palacio