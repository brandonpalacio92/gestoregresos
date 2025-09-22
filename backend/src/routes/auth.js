const express = require('express');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');

module.exports = (sql) => {
  const router = express.Router();

const {
  generateToken,
  generateRefreshToken,
  authenticateToken,
  verifyRefreshToken
} = require('../middleware/auth')(sql);

  // Rate limiting para endpoints de autenticación
  const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: {
      success: false,
      message: 'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: {
      success: false,
      message: 'Demasiados intentos de registro. Intenta de nuevo en 1 hora.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // POST /api/auth/register
  router.post('/register', registerLimiter, async (req, res) => {
    try {
      const { email, password, nombre, apellido, telefono, fecha_nacimiento } = req.body;

      const validation = User.validateUserData({ email, password, nombre, apellido, telefono, fecha_nacimiento });
      if (!validation.isValid) {
        return res.status(400).json({ success: false, message: 'Datos inválidos', errors: validation.errors });
      }

      const existingUser = await User.findByEmail(sql, email);
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'El email ya está registrado' });
      }

      const newUser = await User.create(sql, { email, password, nombre, apellido, telefono, fecha_nacimiento });
      const accessToken = generateToken(newUser.id);
      const refreshToken = generateRefreshToken(newUser.id);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: newUser.toPublicJSON(),
          accessToken,
          refreshToken
        }
      });

    } catch (error) {
      console.error('Error en registro:', error);
      if (error.code === '23505') {
        return res.status(409).json({ success: false, message: 'El email ya está registrado' });
      }
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  });

  // POST /api/auth/login
  router.post('/login', authLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' });
      }
  
      const user = await User.findByEmail(sql, email);
      console.log('Resultado de findByEmail:', user);           
      console.log('Contraseña enviada:', password);
      console.log('Contraseña en BD:', user.password);

      if (!user) {
        return res.status(401).json({ success: false, message: 'Usuario no encontrado o inactivo' });
      }


  
      const isMatch = await User.verifyPassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
      }
  
      const accessToken = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);
  
      res.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          user: user.toPublicJSON(),
          accessToken,
          refreshToken
        }
      });
  
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  })    ;



  // POST /api/auth/refresh
  router.post('/refresh', verifyRefreshToken, async (req, res) => {
    try {
      const newAccessToken = generateToken(req.user.id);
      const newRefreshToken = generateRefreshToken(req.user.id);
      res.json({
        success: true,
        message: 'Token renovado exitosamente',
        data: { accessToken: newAccessToken, refreshToken: newRefreshToken }
      });
    } catch (error) {
      console.error('Error renovando token:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  });

  // GET /api/auth/me
  router.get('/me', authenticateToken, async (req, res) => {
    try {
      res.json({ success: true, data: { user: req.user.toPublicJSON() } });
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  });

  // PUT /api/auth/profile
  router.put('/profile', authenticateToken, async (req, res) => {
    try {
      const { nombre, apellido, telefono, fecha_nacimiento } = req.body;
      const userId = req.user.id;

      const updateData = {};
      if (nombre) updateData.nombre = nombre;
      if (apellido) updateData.apellido = apellido;
      if (telefono) updateData.telefono = telefono;
      if (fecha_nacimiento) updateData.fecha_nacimiento = fecha_nacimiento;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ success: false, message: 'No hay datos para actualizar' });
      }

      if (updateData.telefono && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(updateData.telefono)) {
        return res.status(400).json({ success: false, message: 'Formato de teléfono inválido' });
      }

      const updatedUser = await User.update(sql, userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: { user: updatedUser.toPublicJSON() }
      });

    } catch (error) {
      console.error('Error actualizando perfil:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  });

  // POST /api/auth/change-password
  router.post('/change-password', authenticateToken, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Contraseña actual y nueva contraseña son requeridas' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'La nueva contraseña debe tener al menos 6 caracteres' });
      }

      const user = await User.findByEmail(sql, req.user.email);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      const isValidPassword = await User.verifyPassword(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ success: false, message: 'Contraseña actual incorrecta' });
      }

      const hashedNewPassword = await User.hashPassword(newPassword);
      const updatedUser = await User.update(sql, userId, { password: hashedNewPassword });

      if (!updatedUser) {
        return res.status(500).json({ success: false, message: 'Error al actualizar la contraseña' });
      }

      res.json({ success: true, message: 'Contraseña actualizada exitosamente' });

    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  });

  // POST /api/auth/logout
  router.post('/logout', authenticateToken, async (req, res) => {
    try {
      res.json({ success: true, message: 'Sesión cerrada exitosamente' });
    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  });

  return router;
};
