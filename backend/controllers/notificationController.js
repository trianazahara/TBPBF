const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const notificationController = {
    // Buat notifikasi baru
    createNotification: async (conn, {
        userId,
        judul,
        pesan,
        createdBy
    }) => {
        const query = `
            INSERT INTO notifikasi (
                id_notifikasi,
                user_id,
                judul,
                pesan,
                dibaca,
                created_at
            ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;

        const values = [
            uuidv4(),
            userId,
            judul,
            pesan,
            0  // Status belum dibaca
        ];

        await conn.execute(query, values);
    },

    // Ambil daftar notifikasi dengan paginasi
    getNotifications: async (req, res) => {
        try {
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;
            const userId = req.user.userId;

            // Query notifikasi dengan urutan terbaru
            const query = `
                SELECT 
                    n.*
                FROM notifikasi n
                WHERE n.user_id = ?
                ORDER BY n.created_at DESC
                LIMIT ? OFFSET ?
            `;

            const [notifications] = await pool.execute(query, [
                userId,
                Number(limit),
                Number(offset)
            ]);

            // Hitung total notifikasi untuk paginasi
            const [countResult] = await pool.execute(
                'SELECT COUNT(*) as total FROM notifikasi WHERE user_id = ?',
                [userId]
            );

            res.json({
                status: 'success',
                data: notifications,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(countResult[0].total / limit),
                    totalItems: countResult[0].total,
                    limit: Number(limit)
                }
            });

        } catch (error) {
            console.error('Error getting notifications:', error);
            res.status(500).json({
                status: 'error',
                message: 'Terjadi kesalahan saat mengambil notifikasi'
            });
        }
    },

    // Hitung jumlah notifikasi yang belum dibaca
    getUnreadCount: async (req, res) => {
        try {
            const userId = req.user.userId;
            const [result] = await pool.execute(
                'SELECT COUNT(*) as count FROM notifikasi WHERE user_id = ? AND dibaca = 0',
                [userId]
            );

            res.json({
                status: 'success',
                count: result[0].count
            });

        } catch (error) {
            console.error('Error getting unread count:', error);
            res.status(500).json({
                status: 'error',
                message: 'Terjadi kesalahan saat mengambil jumlah notifikasi belum dibaca'
            });
        }
    },

    // Tandai satu notifikasi sebagai sudah dibaca
    markAsRead: async (req, res) => {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
            const { id } = req.params;
            const userId = req.user.userId;

            // Update status dibaca
            const [result] = await conn.execute(
                'UPDATE notifikasi SET dibaca = 1 WHERE id_notifikasi = ? AND user_id = ?',
                [id, userId]
            );

            if (result.affectedRows === 0) {
                throw new Error('Notifikasi tidak ditemukan');
            }

            await conn.commit();
            res.json({
                status: 'success',
                message: 'Notifikasi telah ditandai sebagai dibaca'
            });

        } catch (error) {
            await conn.rollback();
            console.error('Error marking notification as read:', error);
            res.status(500).json({
                status: 'error',
                message: error.message || 'Terjadi kesalahan saat menandai notifikasi'
            });
        } finally {
            conn.release();
        }
    },

    // Tandai semua notifikasi sebagai sudah dibaca
    markAllAsRead: async (req, res) => {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
            const userId = req.user.userId;

            // Update semua notifikasi user
            await conn.execute(
                'UPDATE notifikasi SET dibaca = 1 WHERE user_id = ?',
                [userId]
            );

            await conn.commit();
            res.json({
                status: 'success',
                message: 'Semua notifikasi telah ditandai sebagai dibaca'
            });

        } catch (error) {
            await conn.rollback();
            console.error('Error marking all notifications as read:', error);
            res.status(500).json({
                status: 'error',
                message: 'Terjadi kesalahan saat menandai semua notifikasi'
            });
        } finally {
            conn.release();
        }
    }
};

module.exports = notificationController;