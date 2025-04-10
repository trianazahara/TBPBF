// backend/models/Siswa.js
const pool = require('../config/database');

class Siswa {
  static async findAll() {
    const [siswa] = await pool.execute(`
      SELECT * FROM data_siswa
    `);
    return siswa;
  }

  static async findById(id) {
    const [siswa] = await pool.execute(`
      SELECT * FROM data_siswa
      WHERE id_siswa = ?
      LIMIT 1
    `, [id]);
    
    return siswa[0];
  }

  static async findByMagang(id_magang) {
    const [siswa] = await pool.execute(`
      SELECT * FROM data_siswa
      WHERE id_magang = ?
    `, [id_magang]);
    
    return siswa;
  }
  
  static async findByJurusan(jurusan) {
    const [siswa] = await pool.execute(`
      SELECT * FROM data_siswa
      WHERE jurusan = ?
    `, [jurusan]);
    
    return siswa;
  }

  static async create(data) {
    const { id_siswa, id_magang, nisn, jurusan, kelas } = data;
    
    const [result] = await pool.execute(`
      INSERT INTO data_siswa 
      (id_siswa, id_magang, nisn, jurusan, kelas) 
      VALUES (?, ?, ?, ?, ?)
    `, [id_siswa, id_magang, nisn, jurusan, kelas]);
    
    return result.insertId;
  }
  
  static async update(id, data) {
    const { id_magang, nisn, jurusan, kelas } = data;
    
    const [result] = await pool.execute(`
      UPDATE data_siswa 
      SET id_magang = ?, nisn = ?, jurusan = ?, kelas = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id_siswa = ?
    `, [id_magang, nisn, jurusan, kelas, id]);
    
    return result.affectedRows > 0;
  }
  
  static async delete(id) {
    const [result] = await pool.execute(`
      DELETE FROM data_siswa 
      WHERE id_siswa = ?
    `, [id]);
    
    return result.affectedRows > 0;
  }
}

module.exports = Siswa;