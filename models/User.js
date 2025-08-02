const { getDatabase } = require('../config/database');

class User {
  static async create(userData) {
    const db = getDatabase();
    const { 
      name, 
      email, 
      password, 
      role = 'user', 
      isAdmin = false, 
      firebaseUid,
      displayName,
      phone,
      location,
      bio,
      skills,
      experience
    } = userData;
    
    const result = await db.execute({
      sql: `INSERT INTO users (name, email, password, role, isAdmin, firebaseUid, displayName, phone, location, bio, skills, experience) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [name, email, password || '', role, isAdmin ? 1 : 0, firebaseUid, displayName, phone, location, bio, skills, experience]
    });
    
    return await this.findById(result.lastInsertRowid);
  }

  static async findById(id) {
    const db = getDatabase();
    const result = await db.execute({
      sql: `SELECT * FROM users WHERE id = ?`,
      args: [id]
    });
    
    if (result.rows.length === 0) return null;
    
    const user = result.rows[0];
    return {
      ...user,
      isAdmin: Boolean(user.isAdmin),
      createdAt: new Date(user.createdAt)
    };
  }

  static async findOne(filter) {
    const db = getDatabase();
    let sql = `SELECT * FROM users WHERE `;
    const args = [];
    
    if (filter.email) {
      sql += `email = ?`;
      args.push(filter.email);
    } else if (filter.firebaseUid) {
      sql += `firebaseUid = ?`;
      args.push(filter.firebaseUid);
    } else {
      throw new Error('Invalid filter for findOne');
    }
    
    const result = await db.execute({ sql, args });
    
    if (result.rows.length === 0) return null;
    
    const user = result.rows[0];
    return {
      ...user,
      isAdmin: Boolean(user.isAdmin),
      createdAt: new Date(user.createdAt)
    };
  }

  static async findByEmail(email) {
    return await this.findOne({ email });
  }

  static async find() {
    const db = getDatabase();
    const result = await db.execute(`SELECT * FROM users ORDER BY createdAt DESC`);
    
    return result.rows.map(user => ({
      ...user,
      isAdmin: Boolean(user.isAdmin),
      createdAt: new Date(user.createdAt)
    }));
  }

  static async findByIdAndUpdate(id, updateData) {
    const db = getDatabase();
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    
    // Convert boolean isAdmin to integer
    if (updateData.isAdmin !== undefined) {
      updateData.isAdmin = updateData.isAdmin ? 1 : 0;
    }
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    await db.execute({
      sql: `UPDATE users SET ${setClause} WHERE id = ?`,
      args: [...values, id]
    });
    
    return await this.findById(id);
  }

  static async findOneAndUpdate(filter, updateData, options = {}) {
    const db = getDatabase();
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    
    // Convert boolean isAdmin to integer
    if (updateData.isAdmin !== undefined) {
      updateData.isAdmin = updateData.isAdmin ? 1 : 0;
    }
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    let whereClause = '';
    let whereArgs = [];
    
    if (filter.email) {
      whereClause = 'email = ?';
      whereArgs.push(filter.email);
    } else if (filter.firebaseUid) {
      whereClause = 'firebaseUid = ?';
      whereArgs.push(filter.firebaseUid);
    } else {
      throw new Error('Invalid filter for findOneAndUpdate');
    }
    
    await db.execute({
      sql: `UPDATE users SET ${setClause} WHERE ${whereClause}`,
      args: [...values, ...whereArgs]
    });
    
    if (options.new) {
      return await this.findOne(filter);
    }
    
    return true;
  }

  static async findByIdAndDelete(id) {
    const db = getDatabase();
    const user = await this.findById(id);
    
    if (!user) return null;
    
    await db.execute({
      sql: `DELETE FROM users WHERE id = ?`,
      args: [id]
    });
    
    return user;
  }

  static async count() {
    const db = getDatabase();
    const result = await db.execute(`SELECT COUNT(*) as count FROM users`);
    return result.rows[0].count;
  }
}

module.exports = User;
