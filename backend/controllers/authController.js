const pool = require('../config/database');
const bcrypt = require('bcrypt');
const { generateToken } = require('../config/auth');
const nodemailer = require('nodemailer');

// Konfigurasi email sender
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});

// Generate 6 digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const authController = {
    // Proses login user
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            console.log('Login attempt:', { username }); 

            // Cek username di database
            const [users] = await pool.execute(
                'SELECT * FROM users WHERE username = ?',
                [username]
            );
            console.log('Users found:', users.length); 

            if (users.length === 0) {
                return res.status(401).json({ message: 'Username atau password salah' });
            }

            // Verifikasi password
            const user = users[0];
            console.log('Comparing passwords...'); 
            const validPassword = await bcrypt.compare(password, user.password);
            console.log('Password valid:', validPassword); 

            if (!validPassword) {
                return res.status(401).json({ message: 'Username atau password salah' });
            }

            // Generate token JWT
            const token = generateToken(user.id_users, user.role);
            res.json({ 
                token, 
                user: { 
                    id: user.id_users,
                    username: user.username,
                    email: user.email,
                    nama: user.nama,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Terjadi kesalahan server' });
        }
    },

    // Ambil data user yang sedang login
    getMe: async (req, res) => {
        try {
            const [users] = await pool.execute(
                'SELECT id_users, username, email, nama, role FROM users WHERE id_users = ?',
                [req.user.userId]
            );
    
            if (users.length === 0) {
                return res.status(404).json({ message: 'User tidak ditemukan' });
            }
    
            res.json(users[0]);
        } catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({ message: 'Terjadi kesalahan server' });
        }
    },

    // Cek keberadaan username untuk reset password
    checkUsername: async (req, res) => {
        try {
            const { username } = req.body;
            
            if (!username) {
                return res.status(400).json({ 
                    exists: false,
                    message: 'Username harus diisi' 
                });
            }

            console.log('Checking username:', username);

            // Cek username di database
            const [users] = await pool.execute(
                'SELECT email FROM users WHERE username = ?',
                [username]
            );

            if (users.length === 0) {
                return res.status(404).json({ 
                    exists: false,
                    message: 'Username tidak ditemukan' 
                });
            }

            // Masking email untuk keamanan
            const email = users[0].email;
            const maskedEmail = email.replace(/(.{3})(.*)(@.*)/, '$1***$3');

            const otp = generateOTP();
            
            // Simpan OTP ke database
            await pool.execute(
                'UPDATE users SET otp = ?, otp_expires_at = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE username = ?',
                [otp, username]
            );

            // Kirim OTP ke email
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Reset Password OTP',
                html: `
                    <h2>Reset Password</h2>
                    <p>Berikut adalah kode OTP untuk reset password Anda:</p>
                    <h3>${otp}</h3>
                    <p>Kode ini akan kadaluarsa dalam 15 menit.</p>
                `
            });

            res.json({
                exists: true,
                maskedEmail,
                message: `OTP telah dikirim ke ${maskedEmail}`
            });

        } catch (error) {
            console.error('Check username error:', error);
            res.status(500).json({ 
                exists: false,
                message: 'Terjadi kesalahan server' 
            });
        }
    },

    // Proses lupa password
    forgotPassword: async (req, res) => {
        try {
            const { username } = req.body;
            console.log('Step 1: Received username:', username);

            // Cek username
            const [users] = await pool.execute(
                'SELECT * FROM users WHERE username = ?',
                [username]
            );
            console.log('Step 2: Database query result:', users.length);

            if (users.length === 0) {
                return res.status(404).json({ message: 'Username tidak ditemukan' });
            }

            // Generate dan simpan OTP
            const user = users[0];
            const otp = generateOTP();
            console.log('Step 3: Generated OTP:', otp);

            await pool.execute(
                'UPDATE users SET otp = ?, otp_expires_at = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE username = ?',
                [otp, username]
            );
            console.log('Step 4: OTP saved to database');

            console.log('Step 5: Email configuration:', {
                host: process.env.EMAIL_USER,
                hasPassword: !!process.env.EMAIL_PASS
            });

            try {
                // Kirim email OTP
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: user.email,
                    subject: 'Reset Password OTP',
                    html: `
                        <h2>Reset Password</h2>
                        <p>Berikut adalah kode OTP untuk reset password Anda:</p>
                        <h3>${otp}</h3>
                        <p>Kode ini akan kadaluarsa dalam 15 menit.</p>
                    `
                });
                console.log('Step 6: Email sent successfully');

                const maskedEmail = user.email.replace(/(.{3})(.*)(@.*)/, '$1***$3');
                
                res.json({ 
                    status: 'success',
                    message: `OTP telah dikirim ke ${maskedEmail}`,
                    maskedEmail
                });

            } catch (emailError) {
                console.error('Email sending error:', emailError);
                throw emailError;
            }

        } catch (error) {
            console.error('Detailed error:', error);
            console.error('Error stack:', error.stack);
            res.status(500).json({ 
                message: 'Terjadi kesalahan server',
                error: error.message 
            });
        }
    },

    // Reset password dengan OTP
    resetPassword: async (req, res) => {
        try {
            const { username, otp, newPassword } = req.body;
            console.log('Reset password attempt:', { username });

            // Validasi OTP
            const [users] = await pool.execute(
                'SELECT * FROM users WHERE username = ? AND otp = ? AND otp_expires_at > NOW()',
                [username, otp]
            );

            if (users.length === 0) {
                return res.status(400).json({ message: 'OTP tidak valid atau sudah expired' });
            }

            // Hash password baru
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // Update password dan hapus OTP
            await pool.execute(
                'UPDATE users SET password = ?, otp = NULL, otp_expires_at = NULL WHERE username = ?',
                [hashedPassword, username]
            );
            console.log('Password reset successful');

            res.json({ 
                status: 'success',
                message: 'Password berhasil direset' 
            });

        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({ message: 'Terjadi kesalahan server' });
        }
    }
};

module.exports = authController;