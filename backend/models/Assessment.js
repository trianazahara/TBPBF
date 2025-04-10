// backend/models/Assessment.js
const pool = require('../config/database');

class Assessment {
    static async create(data) {
        const {
            id_penilaian,
            id_magang,
            id_users,
            nilai_teamwork,
            nilai_komunikasi,
            nilai_pengambilan_keputusan,
            nilai_kualitas_kerja,
            nilai_teknologi,
            nilai_disiplin,
            nilai_tanggungjawab,
            nilai_kerjasama,
            nilai_inisiatif,
            nilai_kejujuran,
            nilai_kebersihan,
            created_by
        } = data;

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // Insert penilaian
            await conn.execute(`
                INSERT INTO penilaian SET ?
            `, [data]);

            // Update status peserta magang
            await conn.execute(`
                UPDATE peserta_magang
                SET status = 'selesai'
                WHERE id_magang = ?
            `, [id_magang]);

            await conn.commit();
            return id_penilaian;
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }

    static async findByInternId(id_magang) {
        const [assessments] = await pool.execute(`
            SELECT * FROM penilaian
            WHERE id_magang = ?
        `, [id_magang]);

        return assessments[0];
    }
}

module.exports = Assessment;