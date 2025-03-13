const db = require('../config/database');

class Notification {
    static async getByUser(userId, { page = 1, limit = 10, status = 'all' }) {
        try {
            const offset = (page - 1) * limit;
            let statusCondition = '';
            
            if (status !== 'all') {
                statusCondition = status === 'unread' 
                    ? 'AND is_read = 0' 
                    : 'AND is_read = 1';
            }

            const [notifications] = await db.execute(`
                SELECT n.*, u.nama as user_name
                FROM notifikasi n
                JOIN users u ON n.user_id = u.id 
                WHERE n.user_id = ? ${statusCondition}
                ORDER BY n.created_at DESC 
                LIMIT ? OFFSET ?
            `, [userId, parseInt(limit), offset]);

            const [[{ total }]] = await db.execute(`
                SELECT COUNT(*) as total 
                FROM notifikasi 
                WHERE user_id = ? ${statusCondition}
            `, [userId]);

            return {
                data: notifications,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            console.error('Error in getByUser:', error);
            throw error;
        }
    }

    static async createNotification(userId, type, content, referenceId = null) {
        try {
            const [result] = await db.execute(
                'INSERT INTO notifikasi (user_id, type, content, reference_id, created_at) VALUES (?, ?, ?, ?, NOW())',
                [userId, type, content, referenceId]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error in createNotification:', error);
            throw error;
        }
    }

    static async markAsRead(notificationId, userId) {
        try {
            const [result] = await db.execute(
                'UPDATE notifikasi SET is_read = 1 WHERE id = ? AND user_id = ?',
                [notificationId, userId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error in markAsRead:', error);
            throw error;
        }
    }

    static async checkAndCreateInternshipNotifications(wsServer = null) {
        try {
            // Get admin IDs first
            const [admins] = await db.execute(
                'SELECT id FROM users WHERE role = "admin"'
            );
            const adminIds = admins.map(admin => admin.id);

            // 1. Check new interns (last 24 hours)
            const [newInterns] = await db.execute(`
                SELECT pm.*, u.nama 
                FROM peserta_magang pm 
                JOIN users u ON pm.user_id = u.id 
                WHERE pm.status = 'aktif' 
                AND pm.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            `);

            // 2. Check interns ending soon (next 7 days)
            const [endingSoonInterns] = await db.execute(`
                SELECT pm.*, u.nama 
                FROM peserta_magang pm 
                JOIN users u ON pm.user_id = u.id 
                WHERE pm.status = 'aktif' 
                AND pm.tanggal_selesai BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)
                AND NOT EXISTS (
                    SELECT 1 FROM notifikasi 
                    WHERE reference_id = pm.id 
                    AND type = 'ending_soon'
                    AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                )
            `);

            // 3. Check completed interns (last 24 hours)
            const [completedInterns] = await db.execute(`
                SELECT pm.*, u.nama 
                FROM peserta_magang pm 
                JOIN users u ON pm.user_id = u.id 
                WHERE pm.status = 'selesai' 
                AND pm.updated_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            `);

            // 4. Check completed evaluations (last 24 hours)
            const [completedEvaluations] = await db.execute(`
                SELECT e.*, 
                    pm.user_id as intern_id, 
                    u1.nama as intern_name, 
                    u2.nama as evaluator_name
                FROM evaluasi e
                JOIN peserta_magang pm ON e.peserta_magang_id = pm.id
                JOIN users u1 ON pm.user_id = u1.id
                JOIN users u2 ON e.evaluator_id = u2.id
                WHERE e.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            `);

            // Create notifications for each admin
            for (const adminId of adminIds) {
                // New interns notifications
                for (const intern of newInterns) {
                    const notification = {
                        type: 'new_intern',
                        content: `Peserta magang baru: ${intern.nama} telah bergabung`,
                        referenceId: intern.id
                    };

                    const notifId = await this.createNotification(
                        adminId,
                        notification.type,
                        notification.content,
                        notification.referenceId
                    );

                    if (wsServer) {
                        wsServer.sendNotification(adminId, {
                            ...notification,
                            id: notifId,
                            createdAt: new Date()
                        });
                    }
                }

                // Ending soon notifications
                for (const intern of endingSoonInterns) {
                    const daysRemaining = Math.ceil(
                        (new Date(intern.tanggal_selesai) - new Date()) / (1000 * 60 * 60 * 24)
                    );
                    
                    const notification = {
                        type: 'ending_soon',
                        content: `Peserta magang ${intern.nama} akan menyelesaikan magang dalam ${daysRemaining} hari`,
                        referenceId: intern.id
                    };

                    const notifId = await this.createNotification(
                        adminId,
                        notification.type,
                        notification.content,
                        notification.referenceId
                    );

                    if (wsServer) {
                        wsServer.sendNotification(adminId, {
                            ...notification,
                            id: notifId,
                            createdAt: new Date()
                        });
                    }
                }

                // Completed interns notifications
                for (const intern of completedInterns) {
                    const notification = {
                        type: 'completed_intern',
                        content: `Peserta magang ${intern.nama} telah menyelesaikan program magang`,
                        referenceId: intern.id
                    };

                    const notifId = await this.createNotification(
                        adminId,
                        notification.type,
                        notification.content,
                        notification.referenceId
                    );

                    if (wsServer) {
                        wsServer.sendNotification(adminId, {
                            ...notification,
                            id: notifId,
                            createdAt: new Date()
                        });
                    }
                }

                // Completed evaluations notifications
                for (const evaluation of completedEvaluations) {
                    const notification = {
                        type: 'evaluation_completed',
                        content: `${evaluation.evaluator_name} telah memberikan evaluasi untuk ${evaluation.intern_name}`,
                        referenceId: evaluation.id
                    };

                    const notifId = await this.createNotification(
                        adminId,
                        notification.type,
                        notification.content,
                        notification.referenceId
                    );

                    if (wsServer) {
                        wsServer.sendNotification(adminId, {
                            ...notification,
                            id: notifId,
                            createdAt: new Date()
                        });
                    }
                }
            }

            return true;
        } catch (error) {
            console.error('Error in checkAndCreateInternshipNotifications:', error);
            throw error;
        }
    }
}

module.exports = Notification;