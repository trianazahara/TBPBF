// backend/models/Bidang.js
const pool = require('../config/database');

class Bidang {
  static async findAll() {
    const [bidang] = await pool.execute(`
      SELECT * FROM bidang
      ORDER BY nama_bidang ASC
    `);
    return bidang;
  }

  static async findById(id) {
    const [bidang] = await pool.execute(`
      SELECT * FROM bidang
      WHERE id_bidang = ?
      LIMIT 1
    `, [id]);
    
    return bidang[0];
  }

  static async findByName(nama) {
    const [bidang] = await pool.execute(`
      SELECT * FROM bidang
      WHERE nama_bidang LIKE ?
      LIMIT 1
    `, [`%${nama}%`]);
    
    return bidang[0];
  }

  static async create(data) {
    const { id_bidang, nama_bidang } = data;
    
    const [result] = await pool.execute(`
      INSERT INTO bidang 
      (id_bidang, nama_bidang) 
      VALUES (?, ?)
    `, [id_bidang, nama_bidang]);
    
    return result.insertId;
  }
  
  static async update(id, data) {
    const { nama_bidang } = data;
    
    const [result] = await pool.execute(`
      UPDATE bidang 
      SET nama_bidang = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id_bidang = ?
    `, [nama_bidang, id]);
    
    return result.affectedRows > 0;
  }
  
  static async delete(id) {
    const [result] = await pool.execute(`
      DELETE FROM bidang 
      WHERE id_bidang = ?
    `, [id]);
    
    return result.affectedRows > 0;
  }
}

module.exports = Bidang;