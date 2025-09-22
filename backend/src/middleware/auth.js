const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = (sql) => {
  // Middleware para verificar JWT
  const authenticateToken = async (req, res, next) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({ success: false, message: 'Token de acceso requerido' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
      const user = await User.findById(sql, decoded.userId);

      if (!user) {
        return res.status(401).json({ success: false, message: 'Usuario no encontrado o inactivo' });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Token inválido' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expirado' });
      }
      console.error('Error en middleware de autenticación:', error);
      return res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  };

  // Middleware opcional
  const optionalAuth = async (req, res, next) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
        const user = await User.findById(sql, decoded.userId);
        if (user) req.user = user;
      }

      next();
    } catch {
      next();
    }
  };

  // Generar tokens
  const generateToken = (userId) => jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const generateRefreshToken = (userId) => jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );

  // Verificar refresh token
  const verifyRefreshToken = async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(401).json({ success: false, message: 'Refresh token requerido' });
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key');
      if (decoded.type !== 'refresh') {
        return res.status(401).json({ success: false, message: 'Token de tipo inválido' });
      }

      const user = await User.findById(sql, decoded.userId);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Refresh token inválido' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Refresh token expirado' });
      }
      console.error('Error verificando refresh token:', error);
      return res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  };

  return {
    authenticateToken,
    optionalAuth,
    generateToken,
    generateRefreshToken,
    verifyRefreshToken
  };
};
