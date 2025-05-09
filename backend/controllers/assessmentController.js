const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const notificationController = require('./notificationController');

// Fungsi untuk membuat notifikasi ke seluruh user saat ada perubahan nilai
const createInternNotification = async (conn, {userId, internName, action}) => {
    try {
        const [userData] = await conn.execute(
            'SELECT nama FROM users WHERE id_users = ?',
            [userId]
        );
        const nama = userData[0]?.nama || 'Unknown User';
       
        // Ambil semua user untuk notifikasi
        const [allUsers] = await conn.execute('SELECT id_users FROM users');
       
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
       
        // Kirim notifikasi ke setiap user
        for (const user of allUsers) {
            const values = [
                uuidv4(),
                user.id_users,
                'Aktivitas Penilaian',
                `${nama} telah ${action} nilai untuk peserta magang: ${internName}`,
                0
            ];
           
            await conn.execute(query, values);
        }
       
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

const assessmentController = {
    // Tambah nilai baru untuk peserta magang
    addScore: async (req, res) => {
        const conn = await pool.getConnection();
        try {
            // Cek autentikasi user
            if (!req.user || !req.user.userId) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Unauthorized: User authentication required'
                });
            }

            await conn.beginTransaction();

            const {
                id_magang,
                nilai_teamwork,
                nilai_komunikasi,
                nilai_pengambilan_keputusan,
                nilai_kualitas_kerja,
                nilai_teknologi,
                nilai_disiplin,
                nilai_tanggungjawab,
                nilai_kerjasama,
                nilai_kejujuran,
                nilai_kebersihan,
                jumlah_hadir     
            } = req.body;
            
            // Validasi kelengkapan nilai
            const isEmpty = (val) => val === undefined || val === null || val === '';
            if (
                !id_magang ||
                [nilai_teamwork, nilai_komunikasi, nilai_pengambilan_keputusan, 
                nilai_kualitas_kerja, nilai_teknologi, nilai_disiplin, 
                nilai_tanggungjawab, nilai_kerjasama, 
                nilai_kejujuran, nilai_kebersihan, jumlah_hadir] 
                    .some((val) => val === undefined)
            ) {
                return res.status(400).json({ message: 'Semua nilai harus diisi.' });
            }

            // Validasi user
            if (!req.user || !req.user.userId) {
                return res.status(403).json({ message: 'User tidak valid.' });
            }

            if (!id_magang) {
                return res.status(400).json({
                    status: 'error',
                    message: 'ID Magang harus diisi'
                });
            }

            // Cek keberadaan peserta
            const [pesertaExists] = await conn.execute(
                'SELECT nama FROM peserta_magang WHERE id_magang = ?',
                [id_magang]
            );

            if (pesertaExists.length === 0) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Data peserta magang tidak ditemukan'
                });
            }

            // Cek duplikasi penilaian
            const [existingScore] = await conn.execute(
                'SELECT id_penilaian FROM penilaian WHERE id_magang = ?',
                [id_magang]
            );

            if (existingScore.length > 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Penilaian untuk peserta ini sudah ada'
                });
            }

            const id_penilaian = uuidv4();

            const [existingPenilaian] = await conn.execute(`
                SELECT id_penilaian FROM penilaian WHERE id_magang = ?
            `, [id_magang]);

            if (existingPenilaian.length > 0) {
                return res.status(400).json({ 
                    message: 'Penilaian sudah ada untuk peserta magang ini.' 
                });
            }

            // Insert data penilaian baru
            await conn.execute(`
                INSERT INTO penilaian (
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
                nilai_kejujuran,
                nilai_kebersihan,
                jumlah_hadir,        
                created_by,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `, [
                id_penilaian,
                id_magang,
                req.user.userId,
                nilai_teamwork || 0,
                nilai_komunikasi || 0,
                nilai_pengambilan_keputusan || 0,
                nilai_kualitas_kerja || 0,
                nilai_teknologi || 0,
                nilai_disiplin || 0,
                nilai_tanggungjawab || 0,
                nilai_kerjasama || 0,
                nilai_kejujuran || 0,
                nilai_kebersihan || 0,
                req.body.jumlah_hadir || 0,  
                req.user.userId
            ]);

            // Update status peserta jadi selesai
            await conn.execute(`
                UPDATE peserta_magang
                SET status = 'selesai',
                    updated_by = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id_magang = ?
            `, [req.user.userId, id_magang]);

            const [userData] = await conn.execute(
                'SELECT username FROM users WHERE id_users = ?',
                [req.user.userId]
            );
        
            // Buat notifikasi penilaian baru
            await createInternNotification(conn, {
                userId: req.user.userId,
                internName: pesertaExists[0].nama,
                action: 'menambahkan'
            });

            await conn.commit();

            res.status(201).json({
                status: 'success',
                message: 'Penilaian berhasil disimpan',
                data: {
                    id_penilaian,
                    id_magang,
                    created_by: req.user.userId,
                    created_at: new Date().toISOString()
                }
            });

        } catch (error) {
            await conn.rollback();
            console.error('Error creating assessment:', error);
            res.status(500).json({
                status: 'error',
                message: 'Terjadi kesalahan server',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        } finally {
            conn.release();
        }
    },

    // Ambil rekap nilai dengan filter dan paginasi
    getRekapNilai: async (req, res) => {
        try {
            const {
                page = 1,
                limit = 10,
                bidang,
                search
            } = req.query;
    
            console.log('=== DEBUG INFO ===');
            console.log('Page:', page);
            console.log('Limit:', limit);
            console.log('Bidang:', bidang);
            console.log('Search:', search);
    
            const offset = (page - 1) * limit;
            const params = [];
            
            // Query dasar untuk rekap nilai
            let query = `
                SELECT 
                    pm.nama,
                    pm.nama_institusi,
                    b.nama_bidang,
                    pm.tanggal_masuk,
                    pm.tanggal_keluar,
                    p.*
                FROM penilaian p
                LEFT JOIN peserta_magang pm ON p.id_magang = pm.id_magang
                LEFT JOIN bidang b ON pm.id_bidang = b.id_bidang
                WHERE 1=1
            `;
    
            // Filter untuk admin
            if (req.user.role === 'admin') {
                query += ` AND pm.mentor_id = ?`;
                params.push(req.user.userId);
            }
              
            // Filter berdasarkan bidang
            if (bidang && bidang !== '') {
                query += ` AND pm.id_bidang = ?`;
                params.push(bidang);
            }
    
            // Filter pencarian
            if (search && search !== '') {
                query += ` AND (pm.nama LIKE ? OR pm.nama_institusi LIKE ?)`;
                params.push(`%${search}%`, `%${search}%`);
            }
    
            let debugQuery = `
                SELECT COUNT(*) as total
                FROM penilaian p
                LEFT JOIN peserta_magang pm ON p.id_magang = pm.id_magang
                LEFT JOIN bidang b ON pm.id_bidang = b.id_bidang
                WHERE 1=1
                ${req.user.role === 'admin' ? ' AND pm.mentor_id = ?' : ''}
            `;
            const debugParams = req.user.role === 'admin' ? [req.user.userId] : [];
            const [debugResult] = await pool.execute(debugQuery, debugParams);
            console.log('Debug Query Result:', debugResult);
    
            // Tambah paginasi ke query
            query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
            params.push(parseInt(limit), parseInt(offset));
    
            console.log('=== QUERY INFO ===');
            console.log('Final Query:', query);
            console.log('Parameters:', params);
    
            const [rows] = await pool.execute(query, params);
            console.log('=== RESULT INFO ===');
            console.log('Number of rows returned:', rows ? rows.length : 0);
            console.log('First row:', rows && rows.length > 0 ? rows[0] : 'No data');
    
            if (!rows || rows.length === 0) {
                console.log('No data found in query result');
                return res.status(200).json({
                    status: "success",
                    data: [],
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: 0,
                        totalData: 0,
                        limit: parseInt(limit),
                    },
                });
            }
    
            // Hitung total data untuk paginasi
            const countQuery = `
                SELECT COUNT(*) as total 
                FROM penilaian p
                LEFT JOIN peserta_magang pm ON p.id_magang = pm.id_magang
                LEFT JOIN bidang b ON pm.id_bidang = b.id_bidang
                WHERE 1=1
                ${req.user.role === 'admin' ? ' AND pm.mentor_id = ?' : ''}
                ${bidang && bidang !== '' ? ' AND pm.id_bidang = ?' : ''}
                ${search && search !== '' ? ' AND (pm.nama LIKE ? OR pm.nama_institusi LIKE ?)' : ''}
            `;
            const countParams = params.slice(0, -2); 
            
            const [countRows] = await pool.execute(countQuery, countParams);
            const totalData = countRows[0]?.total || 0;
            const totalPages = Math.ceil(totalData / limit);
    
            console.log('=== PAGINATION INFO ===');
            console.log('Total Data:', totalData);
            console.log('Total Pages:', totalPages);
    
            return res.status(200).json({
                status: "success",
                data: rows,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalData,
                    limit: parseInt(limit),
                },
            });
    
        } catch (error) {
            console.error('=== ERROR INFO ===');
            console.error('Error Message:', error.message);
            console.error('Error Stack:', error.stack);
            return res.status(500).json({
                status: "error",
                message: 'Terjadi kesalahan server',
                error: error.message,
            });
        }
    },

    // Update nilai peserta magang
    updateScore: async (req, res) => {
        const conn = await pool.getConnection();
        try {
            // Validasi user
            if (!req.user || !req.user.userId) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Unauthorized: User authentication required'
                });
            }
    
            await conn.beginTransaction();
            const { id } = req.params;
    
            // Cek data penilaian
            const [internData] = await conn.execute(`
                SELECT pm.nama 
                FROM penilaian p 
                JOIN peserta_magang pm ON p.id_magang = pm.id_magang 
                WHERE p.id_penilaian = ?
            `, [id]);
    
            if (!internData || internData.length === 0) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Data penilaian tidak ditemukan'
                });
            }
    
            const {
                nilai_teamwork,
                nilai_komunikasi,
                nilai_pengambilan_keputusan,
                nilai_kualitas_kerja,
                nilai_teknologi,
                nilai_disiplin,
                nilai_tanggungjawab,
                nilai_kerjasama,
                nilai_kejujuran,
                nilai_kebersihan,
                jumlah_hadir
            } = req.body;
    
            // Update nilai
            let updateQuery = `
                UPDATE penilaian 
                SET 
                    updated_at = CURRENT_TIMESTAMP,
                    updated_by = ?,
                    nilai_teamwork = ?,
                    nilai_komunikasi = ?,
                    nilai_pengambilan_keputusan = ?,
                    nilai_kualitas_kerja = ?,
                    nilai_teknologi = ?,
                    nilai_disiplin = ?,
                    nilai_tanggungjawab = ?,
                    nilai_kerjasama = ?,
                    nilai_kejujuran = ?,
                    nilai_kebersihan = ?,
                    jumlah_hadir = ?
                WHERE id_penilaian = ?
            `;
    
            const values = [
                req.user.userId,
                nilai_teamwork,
                nilai_komunikasi,
                nilai_pengambilan_keputusan,
                nilai_kualitas_kerja,
                nilai_teknologi,
                nilai_disiplin,
                nilai_tanggungjawab,
                nilai_kerjasama,
                nilai_kejujuran,
                nilai_kebersihan,
                jumlah_hadir,
                id
            ];
    
            await conn.execute(updateQuery, values);
    
            // Kirim notifikasi update nilai
            await createInternNotification(conn, {
                userId: req.user.userId,
                internName: internData[0].nama,
                action: 'memperbarui'
            });
    
            await conn.commit();
    
            return res.status(200).json({
                status: 'success',
                message: 'Nilai berhasil diupdate'
            });
    
        } catch (error) {
            await conn.rollback();
            console.error('Error updating nilai:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Terjadi kesalahan saat mengupdate nilai'
            });
        } finally {
            if (conn) conn.release();
        }
    },

    // Ambil detail nilai berdasarkan ID magang
    getByInternId: async (req, res) => {
        try {
            const { id_magang } = req.params;

            // Query untuk ambil detail nilai dan data peserta
            const [assessment] = await pool.execute(`
                SELECT p.*, pm.nama, pm.jenis_peserta,
                       i.nama_institusi, b.nama_bidang,
                       CASE 
                           WHEN pm.jenis_peserta = 'mahasiswa' THEN m.nim
                           ELSE s.nisn
                       END as nomor_induk,
                       m.fakultas, m.jurusan as jurusan_mahasiswa,
                       s.jurusan as jurusan_siswa, s.kelas
                FROM penilaian p
                JOIN peserta_magang pm ON p.id_magang = pm.id_magang
                LEFT JOIN institusi i ON pm.id_institusi = i.id_institusi
                LEFT JOIN bidang b ON pm.id_bidang = b.id_bidang
                LEFT JOIN data_mahasiswa m ON pm.id_magang = m.id_magang
                LEFT JOIN data_siswa s ON pm.id_magang = s.id_magang
                WHERE p.id_magang = ?
            `, [id_magang]);

            if (!assessment.length) {
                return res.status(404).json({
                    message: 'Penilaian tidak ditemukan'
                });
            }

            res.json(assessment[0]);
        } catch (error) {
            console.error('Error getting assessment:', error);
            res.status(500).json({ message: 'Terjadi kesalahan server' });
        }
    },

    // Generate sertifikat magang
    generateCertificate: async (req, res) => {
        try {
            const { id_magang } = req.params;
            
            // Ambil data lengkap peserta
            const [assessment] = await pool.execute(`
                SELECT p.*, pm.nama, pm.jenis_peserta,
                       i.nama_institusi, b.nama_bidang,
                       CASE 
                           WHEN pm.jenis_peserta = 'mahasiswa' THEN m.nim
                           ELSE s.nisn
                       END as nomor_induk,
                       m.fakultas, m.jurusan as jurusan_mahasiswa,
                       s.jurusan as jurusan_siswa, s.kelas,
                       pm.tanggal_masuk, pm.tanggal_keluar
                FROM penilaian p
                JOIN peserta_magang pm ON p.id_magang = pm.id_magang
                LEFT JOIN institusi i ON pm.id_institusi = i.id_institusi
                LEFT JOIN bidang b ON pm.id_bidang = b.id_bidang
                LEFT JOIN data_mahasiswa m ON pm.id_magang = m.id_magang
                LEFT JOIN data_siswa s ON pm.id_magang = s.id_magang
                WHERE p.id_magang = ?
            `, [id_magang]);

            if (!assessment.length) {
                return res.status(404).json({
                    message: 'Data tidak ditemukan'
                });
            }

            // Ambil template sertifikat aktif
            const [template] = await pool.execute(`
                SELECT file_path
                FROM dokumen_template
                WHERE jenis = 'sertifikat'
                AND active = true
                LIMIT 1
            `);

            if (!template.length) {
                return res.status(404).json({
                    message: 'Template sertifikat tidak ditemukan'
                });
            }

            // Generate PDF sertifikat
            const templatePath = path.join(__dirname, '..', template[0].file_path);
            const templateBytes = await fs.readFile(templatePath);
            const pdfDoc = await PDFDocument.load(templateBytes);
            const pages = pdfDoc.getPages();
            const firstPage = pages[0];
            const data = assessment[0];
            const { width, height } = firstPage.getSize();

            firstPage.drawText(data.nama, {
                x: width / 2,
                y: height - 200,
                size: 24,
                font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
                color: rgb(0, 0, 0)
            });

            const pdfBytes = await pdfDoc.save();
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=sertifikat.pdf');
            res.send(Buffer.from(pdfBytes));
        } catch (error) {
            console.error('Error generating certificate:', error);
            res.status(500).json({ message: 'Terjadi kesalahan server' });
        }
    },
};

// Hapus notifikasi lama setiap hari jam 00:00
const cron = require('node-cron');
const Notification = require('../models/Notification');

cron.schedule('0 0 * * *', async () => {
    await Notification.deleteOldNotifications();
});

module.exports = assessmentController;