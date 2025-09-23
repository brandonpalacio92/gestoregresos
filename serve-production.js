const express = require('express');
const path = require('path');
const app = express();
const PORT = 8101;

// Servir archivos estáticos desde www
app.use(express.static(path.join(__dirname, 'www')));

// Manejar rutas de Angular (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor de producción corriendo en puerto ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🌐 Frontend (Red Local): http://192.168.1.7:${PORT}`);
  console.log(`📁 Sirviendo archivos desde: ${path.join(__dirname, 'www')}`);
});
