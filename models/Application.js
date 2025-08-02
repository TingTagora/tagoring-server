const { getDatabase } = require('../config/database');

class Application {
  static async create(applicationData) {
    const db = getDatabase();
    const { 
      firebaseUid, 
      userEmail, 
      jobTitle, 
      fullName, 
      phone, 
      experience, 
      coverLetter, 
      portfolio, 
      availability, 
      status = 'pending' 
    } = applicationData;
    
    const result = await db.execute({
      sql: `INSERT INTO applications (firebaseUid, userEmail, jobTitle, fullName, phone, experience, coverLetter, portfolio, availability, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        firebaseUid || null, 
        userEmail || null, 
        jobTitle || null, 
        fullName || null, 
        phone || null, 
        experience || null, 
        coverLetter || null, 
        portfolio || null, 
        availability || null, 
        status || 'pending'
      ]
    });
    
    return await this.findById(result.lastInsertRowid);
  }

  static async findById(id) {
    const db = getDatabase();
    const result = await db.execute({
      sql: `SELECT * FROM applications WHERE id = ?`,
      args: [id]
    });
    
    if (result.rows.length === 0) return null;
    
    const application = result.rows[0];
    return {
      ...application,
      createdAt: new Date(application.createdAt)
    };
  }

  static async find() {
    const db = getDatabase();
    const result = await db.execute(`SELECT * FROM applications ORDER BY createdAt DESC`);
    
    return result.rows.map(application => ({
      ...application,
      createdAt: new Date(application.createdAt)
    }));
  }

  static async findByFirebaseUid(firebaseUid) {
    const db = getDatabase();
    const result = await db.execute({
      sql: `SELECT * FROM applications WHERE firebaseUid = ? ORDER BY createdAt DESC`,
      args: [firebaseUid]
    });
    
    return result.rows.map(application => ({
      ...application,
      createdAt: new Date(application.createdAt)
    }));
  }

  static async findByIdAndUpdate(id, updateData) {
    const db = getDatabase();
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    await db.execute({
      sql: `UPDATE applications SET ${setClause} WHERE id = ?`,
      args: [...values, id]
    });
    
    return await this.findById(id);
  }

  static async findByIdAndDelete(id) {
    const db = getDatabase();
    const application = await this.findById(id);
    
    if (!application) return null;
    
    await db.execute({
      sql: `DELETE FROM applications WHERE id = ?`,
      args: [id]
    });
    
    return application;
  }

  static async count() {
    const db = getDatabase();
    const result = await db.execute(`SELECT COUNT(*) as count FROM applications`);
    return result.rows[0].count;
  }

  static async countByStatus() {
    const db = getDatabase();
    const result = await db.execute(`
      SELECT status, COUNT(*) as count 
      FROM applications 
      GROUP BY status
    `);
    
    const statusCounts = {
      pending: 0,
      reviewed: 0,
      accepted: 0,
      rejected: 0
    };
    
    result.rows.forEach(row => {
      statusCounts[row.status] = row.count;
    });
    
    return statusCounts;
  }

  static async save(applicationData) {
    // For compatibility with existing code that uses .save()
    return await this.create(applicationData);
  }
}

module.exports = Application;
