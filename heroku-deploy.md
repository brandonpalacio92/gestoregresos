# 🚀 Despliegue en Heroku - GestorEgresos

## 📋 Pasos para desplegar en Heroku

### 1. **Instalar Heroku CLI**
- Descarga desde [devcenter.heroku.com](https://devcenter.heroku.com/articles/heroku-cli)
- Instala y reinicia la terminal

### 2. **Login en Heroku**
```bash
heroku login
```

### 3. **Crear aplicación**
```bash
heroku create gestoregresos-app
```

### 4. **Configurar variables de entorno**
```bash
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=postgresql://neondb_owner:npg_iqUIK2WoBeC3@ep-mute-mode-adye8fyz-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
heroku config:set JWT_SECRET=la_clave_segura_del_proyecto
heroku config:set CORS_ORIGIN=https://gestoregresos-app.herokuapp.com,capacitor://localhost
```

### 5. **Desplegar**
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### 6. **Verificar despliegue**
```bash
heroku open
```

## 🌐 URL resultante:
- **App:** `https://gestoregresos-app.herokuapp.com`
- **API:** `https://gestoregresos-app.herokuapp.com/api`
