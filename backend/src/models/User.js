const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.password = data.password;
    this.nombre = data.nombre;
    this.apellido = data.apellido;
    this.telefono = data.telefono;
    this.fecha_nacimiento = data.fecha_nacimiento;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.is_active = data.is_active;
  }
  // Método para retornar solo los campos públicos
    toPublicJSON() {
      const { id, nombre, apellido, email, telefono } = this;
      return { id, nombre, apellido, email, telefono };
    }

    
  // Método para hashear contraseñas
  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Método para crear un usuario
  static async create(sql, userData) {
    try {
      const hashedPassword = await this.hashPassword(userData.password);
      
      const result = await sql`
        INSERT INTO usuarios (
          email, password, nombre, apellido, telefono, fecha_nacimiento
        ) VALUES (${userData.email}, ${hashedPassword}, ${userData.nombre}, ${userData.apellido}, ${userData.telefono}, ${userData.fecha_nacimiento})
        RETURNING id, email, nombre, apellido, telefono, fecha_nacimiento, created_at
      `;
      
      console.log('Resultado de create:', result);
      return new User(result[0]);
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  // Método para buscar usuario por email
  static async findByEmail(sql, email) {
    try {
      const result = await sql`
        SELECT * FROM usuarios
        WHERE email = ${email} 
        AND is_active = true
        LIMIT 1
      `;
  
      console.log('Resultado SQL:', result);
  
      if (result && result.length > 0) {
        return new User(result[0]);
      } else {
        console.warn('Usuario no encontrado o inactivo');
        return null;
      }
  
    } catch (error) {
      console.error('Error en findByEmail:', error);
      throw error;
    }
  }
  

    // Método para verificar contraseñas
    static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
    }

  // Método para buscar usuario por ID
  static async findById(sql, id) {
    try {
      const result = await sql`
        SELECT *
        FROM usuarios 
        WHERE id = ${id}
      `;
      
      return result.length > 0 ? new User(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Método para actualizar usuario
  static async update(sql, id, updateData) {
    try {
      const fields = [];
      const values = [];

      // Construir query dinámicamente
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined && key !== 'id') {
          fields.push(`${key} = ${updateData[key]}`);
        }
      });

      if (fields.length === 0) {
        throw new Error('No hay campos para actualizar');
      }

      fields.push(`updated_at = ${new Date()}`);

      // Usar query tradicional para UPDATE dinámico
      const query = `
        UPDATE usuarios 
        SET ${fields.join(', ')}
        WHERE id = ${id} AND is_active = true
        RETURNING id, email, nombre, apellido, telefono, fecha_nacimiento, 
                  created_at, updated_at, is_active
      `;

      const result = await sql.unsafe(query);
      return result.length > 0 ? new User(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Método para desactivar usuario (soft delete)
  static async deactivate(sql, id) {
    try {
      const result = await sql`
        UPDATE usuarios 
        SET is_active = false, updated_at = ${new Date()}
        WHERE id = ${id}
        RETURNING id, email, nombre, apellido
      `;
      
      return result.length > 0 ? new User(result[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // Método para obtener datos públicos del usuario (sin password)
  toPublicJSON() {
    return {
      id: this.id,
      email: this.email,
      nombre: this.nombre,
      apellido: this.apellido,
      telefono: this.telefono,
      fecha_nacimiento: this.fecha_nacimiento,
      created_at: this.created_at,
      updated_at: this.updated_at,
      is_active: this.is_active
    };
  }

  // Método para validar datos de usuario
  static validateUserData(userData) {
    const errors = [];

    if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push('Email inválido');
    }

    if (!userData.password || userData.password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (!userData.nombre || userData.nombre.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }

    if (!userData.apellido || userData.apellido.trim().length < 2) {
      errors.push('El apellido debe tener al menos 2 caracteres');
    }

    if (userData.telefono && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(userData.telefono)) {
      errors.push('Formato de teléfono inválido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = User;
