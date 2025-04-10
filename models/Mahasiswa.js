// backend/models/Mahasiswa.js
const pool = require('../config/database');

class Mahasiswa {
  static async findAll() {
    const [mahasiswa] = await pool.execute(`
      SELECT * FROM data_mahasiswa
    `);
    return mahasiswa;
  }

  static async findById(id) {
    const [mahasiswa] = await pool.execute(`
      SELECT * FROM data_mahasiswa
      WHERE id_mahasiswa = ?
      LIMIT 1
    `, [id]);
    
    return mahasiswa[0];
  }

  static async findByMagang(id_magang) {
    const [mahasiswa] = await pool.execute(`
      SELECT * FROM data_mahasiswa
      WHERE id_magang = ?
    `, [id_magang]);
    
    return mahasiswa;
  }

  static async create(data) {
    const { id_mahasiswa, id_magang, nim, fakultas, jurusan, semester } = data;
    
    const [result] = await pool.execute(`
      INSERT INTO data_mahasiswa 
      (id_mahasiswa, id_magang, nim, fakultas, jurusan, semester) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id_mahasiswa, id_magang, nim, fakultas, jurusan, semester]);
    
    return result.insertId;
  }
  
  static async update(id, data) {
    const { id_magang, nim, fakultas, jurusan, semester } = data;
    
    const [result] = await pool.execute(`
      UPDATE data_mahasiswa 
      SET id_magang = ?, nim = ?, fakultas = ?, jurusan = ?, semester = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id_mahasiswa = ?
    `, [id_magang, nim, fakultas, jurusan, semester, id]);
    
    return result.affectedRows > 0;
  }
  
  static async delete(id) {
    const [result] = await pool.execute(`
      DELETE FROM data_mahasiswa 
      WHERE id_mahasiswa = ?
    `, [id]);
    
    return result.affectedRows > 0;
  }
}

module.exports = Mahasiswa;