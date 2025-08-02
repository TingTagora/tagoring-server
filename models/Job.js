const { getDatabase } = require('../config/database');

class Job {
  static async create(jobData) {
    const db = getDatabase();
    const { title, description, requirements = [], isActive = true } = jobData;
    
    const result = await db.execute({
      sql: `INSERT INTO jobs (title, description, requirements, isActive) VALUES (?, ?, ?, ?)`,
      args: [title, description, JSON.stringify(requirements), isActive ? 1 : 0]
    });
    
    return await this.findById(result.lastInsertRowid);
  }

  static async findById(id) {
    const db = getDatabase();
    const result = await db.execute({
      sql: `SELECT * FROM jobs WHERE id = ?`,
      args: [id]
    });
    
    if (result.rows.length === 0) return null;
    
    const job = result.rows[0];
    return {
      ...job,
      requirements: job.requirements ? JSON.parse(job.requirements) : [],
      isActive: Boolean(job.isActive),
      createdAt: new Date(job.createdAt)
    };
  }

  static async find(filter = {}) {
    const db = getDatabase();
    let sql = `SELECT * FROM jobs`;
    const args = [];
    
    if (filter.isActive !== undefined) {
      sql += ` WHERE isActive = ?`;
      args.push(filter.isActive ? 1 : 0);
    }
    
    sql += ` ORDER BY createdAt DESC`;
    
    const result = await db.execute({ sql, args });
    
    return result.rows.map(job => ({
      ...job,
      requirements: job.requirements ? JSON.parse(job.requirements) : [],
      isActive: Boolean(job.isActive),
      createdAt: new Date(job.createdAt)
    }));
  }

  static async findActive() {
    return await this.find({ isActive: true });
  }

  static async findByIdAndUpdate(id, updateData) {
    const db = getDatabase();
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    
    // Convert requirements array to JSON string
    if (updateData.requirements !== undefined) {
      updateData.requirements = JSON.stringify(updateData.requirements);
    }
    
    // Convert boolean isActive to integer
    if (updateData.isActive !== undefined) {
      updateData.isActive = updateData.isActive ? 1 : 0;
    }
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    await db.execute({
      sql: `UPDATE jobs SET ${setClause} WHERE id = ?`,
      args: [...values, id]
    });
    
    return await this.findById(id);
  }

  static async findByIdAndDelete(id) {
    const db = getDatabase();
    const job = await this.findById(id);
    
    if (!job) return null;
    
    await db.execute({
      sql: `DELETE FROM jobs WHERE id = ?`,
      args: [id]
    });
    
    return job;
  }

  static async count() {
    const db = getDatabase();
    const result = await db.execute(`SELECT COUNT(*) as count FROM jobs`);
    return result.rows[0].count;
  }
}

module.exports = Job;
