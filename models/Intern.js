// backend/models/Intern.js
const pool = require('../config/database');

class Intern {
    static async findAll({ page = 1, limit = 10, status, bidang, search, endDate }) {
        let query = `
            SELECT 
                p.*,
                b.nama_bidang,
                u.nama as mentor_nama,
                u.nip as mentor_nip,
                CASE 
                    WHEN p.jenis_peserta = 'mahasiswa' THEN m.nim
                    ELSE s.nisn
                END as nomor_induk,
                CASE 
                    WHEN p.jenis_peserta = 'mahasiswa' THEN m.fakultas
                    ELSE s.kelas
                END as detail_pendidikan,
                CASE 
                    WHEN p.jenis_peserta = 'mahasiswa' THEN m.jurusan
                    ELSE s.jurusan
                END as jurusan,
                CASE
                    WHEN p.nama IS NULL OR p.nama = '' OR 
                         p.nama_institusi IS NULL OR p.nama_institusi = '' OR
                         p.email IS NULL OR p.email = '' OR
                         p.no_hp IS NULL OR p.no_hp = ''
                    THEN true
                    ELSE false
                END as is_incomplete
            FROM peserta_magang p
            LEFT JOIN bidang b ON p.id_bidang = b.id_bidang
            LEFT JOIN data_mahasiswa m ON p.id_magang = m.id_magang
            LEFT JOIN data_siswa s ON p.id_magang = s.id_magang
            LEFT JOIN users u ON p.mentor_id = u.id_users
            WHERE 1=1
        `;

        const params = [];

        if (status) {
            query += ` AND p.status = ?`;
            params.push(status);
        }

        if (bidang) {
            query += ` AND p.id_bidang = ?`;
            params.push(bidang);
        }

        if (search) {
            query += ` AND (p.nama LIKE ? OR p.nama_institusi LIKE ? OR 
                        CASE 
                            WHEN p.jenis_peserta = 'mahasiswa' THEN m.nim
                            ELSE s.nisn
                        END LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (endDate) {
            query += ` AND p.tanggal_selesai <= ?`;
            params.push(endDate);
        }

        // Get total count
        const [countResult] = await pool.execute(
            `SELECT COUNT(*) as total FROM (${query}) as count_query`,
            params
        );
        const total = countResult[0].total;

        // Get paginated data
        const offset = (page - 1) * limit;
        query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await pool.execute(query, params);

        return {
            data: rows,
            pagination: {
                total,
                page: Number(page),
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    static async findById(id) {
        const [interns] = await pool.execute(`
            SELECT 
                p.*,
                b.nama_bidang,
                u.nama as mentor_nama,
                u.nip as mentor_nip,
                u.email as mentor_email,
                CASE 
                    WHEN p.jenis_peserta = 'mahasiswa' THEN (
                        SELECT JSON_OBJECT(
                            'nim', m.nim,
                            'fakultas', m.fakultas,
                            'jurusan', m.jurusan,
                            'semester', m.semester
                        )
                    )
                    ELSE (
                        SELECT JSON_OBJECT(
                            'nisn', s.nisn,
                            'jurusan', s.jurusan,
                            'kelas', s.kelas
                        )
                    )
                END as detail_peserta
            FROM peserta_magang p
            LEFT JOIN bidang b ON p.id_bidang = b.id_bidang
            LEFT JOIN data_mahasiswa m ON p.id_magang = m.id_magang
            LEFT JOIN data_siswa s ON p.id_magang = s.id_magang
            LEFT JOIN users u ON p.mentor_id = u.id_users
            WHERE p.id_magang = ?
        `, [id]);

        if (interns[0]?.detail_peserta) {
            interns[0].detail_peserta = JSON.parse(interns[0].detail_peserta);
        }

        return interns[0];
    }

    static async getStats() {
        const [activeCount] = await pool.execute(`
            SELECT COUNT(*) as count FROM peserta_magang 
            WHERE status = 'aktif'
        `);

        const [completedCount] = await pool.execute(`
            SELECT COUNT(*) as count FROM peserta_magang 
            WHERE status = 'selesai'
        `);

        const [totalCount] = await pool.execute(`
            SELECT COUNT(*) as count FROM peserta_magang
        `);

        const [completingSoon] = await pool.execute(`
            SELECT COUNT(*) as count FROM peserta_magang 
            WHERE status = 'aktif' 
            AND tanggal_keluar <= DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY)
        `);

        return {
            activeInterns: activeCount[0].count,
            completedInterns: completedCount[0].count,
            totalInterns: totalCount[0].count,
            completingSoon: completingSoon[0].count
        };
    }
}

module.exports = Intern;