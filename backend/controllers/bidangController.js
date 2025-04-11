const pool = require('../config/database');

const bidangController = {
    // Ambil semua data bidang (diurutkan berdasarkan nama)
    getAll: async (req, res) => {
        try {
            const [rows] = await pool.execute(`
                SELECT id_bidang, nama_bidang
                FROM bidang
                ORDER BY nama_bidang ASC
            `);
            
            res.json({
                status: 'success',
                data: rows
            });
        } catch (error) {
            console.error('Error getting bidang:', error);
            res.status(500).json({ 
                status: 'error',
                message: 'Terjadi kesalahan server' 
            });
        }
    }
};

module.exports = bidangController;