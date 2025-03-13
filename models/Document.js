// backend/models/Document.js
const pool = require('../config/database');

class Document {
    static async findActiveTemplate(jenis) {
        const [templates] = await pool.execute(`
            SELECT * FROM dokumen_template
            WHERE jenis = ? AND active = true
            LIMIT 1
        `, [jenis]);

        return templates[0];
    }

    static async createTemplate(data) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // Deactivate current active template
            await conn.execute(`
                UPDATE dokumen_template
                SET active = false
                WHERE jenis = ? AND active = true
            `, [data.jenis]);

            // Insert new template
            await conn.execute(`
                INSERT INTO dokumen_template SET ?
            `, [data]);

            await conn.commit();
            return data.id_dokumen;
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }
}

module.exports = Document;