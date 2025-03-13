// backend/models/User.js
const pool = require('../config/database');

class User {
    static async findByUsername(username) {
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        return users[0];
    }

    static async findById(id) {
        const [users] = await pool.execute(
            'SELECT id_users, username, email, nama, role FROM users WHERE id_users = ?',
            [id]
        );
        return users[0];
    }

    static async updateLastLogin(id) {
        await pool.execute(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id_users = ?',
            [id]
        );
    }

    // Menambahkan method untuk mencari user berdasarkan email
    static async findByEmail(email) {
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return users[0];
    }

    // Menyimpan OTP ke database
    static async saveOTP(email, otp) {
        await pool.execute(
            'UPDATE users SET otp = ?, otp_expires_at = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE email = ?',
            [otp, email]
        );
    }

    // Verifikasi OTP
    static async verifyOTP(email, otp) {
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE email = ? AND otp = ? AND otp_expires_at > NOW()',
            [email, otp]
        );
        return users[0];
    }

    // Update password baru
    static async updatePassword(email, hashedPassword) {
        await pool.execute(
            'UPDATE users SET password = ?, otp = NULL, otp_expires_at = NULL WHERE email = ?',
            [hashedPassword, email]
        );
    }

    // Reset OTP (misal setelah digunakan atau expired)
    static async resetOTP(email) {
        await pool.execute(
            'UPDATE users SET otp = NULL, otp_expires_at = NULL WHERE email = ?',
            [email]
        );
    }
}

module.exports = User;