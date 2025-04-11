import React, { useEffect, useState } from 'react';
import { Users, CheckCircle, Package, GraduationCap, Briefcase } from 'lucide-react';


const Dashboard = () => {
    const [stats, setStats] = useState({
        activeInterns: {
            total: 0,
            students: {
                siswa: 0,
                mahasiswa: 0
            },
            byDepartment: {}
        },
        completedInterns: 0,
        totalInterns: 0,
        completingSoon: {
            count: 0,
            interns: []
        }
    });


    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:5000/api/intern/detailed-stats', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });


                if (!response.ok) {
                    throw new Error('Failed to fetch dashboard data');
                }


                const data = await response.json();
                setStats(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Gagal mengambil data dashboard');
            } finally {
                setLoading(false);
            }
        };


        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 60000);


        return () => clearInterval(interval);
    }, []);


    if (loading) {
        return <div className="p-6 text-center">Loading...</div>;
    }


    if (error) {
        return <div className="p-6 text-center text-red-500">{error}</div>;
    }


    return (
        <div className="p-6 animate-fadeIn">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Anak Magang Aktif Card */}
                <div className="group perspective">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100
                        transform transition-all duration-500 hover:scale-110 hover:rotate-2
                        animate-slideRight hover:shadow-xl hover:shadow-emerald-200/50
                        group-hover:z-10">
                        <div className="flex justify-between items-start">
                            <div className="transform transition-all duration-500 group-hover:translate-x-2">
                                <p className="text-emerald-500 text-lg font-medium mb-2">Total Peserta Magang Aktif</p>
                                <h3 className="text-4xl font-bold text-emerald-500">{stats.activeInterns.total}</h3>
                            </div>
                            <div className="bg-emerald-100 p-3 rounded-lg transform transition-all duration-500
                                group-hover:rotate-12 group-hover:scale-110">
                                <Users className="w-6 h-6 text-emerald-500" />
                            </div>
                        </div>
                    </div>
                </div>


                {/* Total Selesai Card */}
                <div className="group perspective">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100
                        transform transition-all duration-500 hover:scale-110 hover:rotate-2
                        animate-slideUp delay-100 hover:shadow-xl hover:shadow-rose-200/50
                        group-hover:z-10">
                        <div className="flex justify-between items-start">
                            <div className="transform transition-all duration-500 group-hover:translate-x-2">
                                <p className="text-emerald-500 text-lg font-medium mb-2">Total Peserta Magang Selesai</p>
                                <h3 className="text-4xl font-bold text-emerald-500">{stats.completedInterns}</h3>
                            </div>
                            <div className="bg-rose-100 p-3 rounded-lg transform transition-all duration-500
                                group-hover:rotate-12 group-hover:scale-110">
                                <CheckCircle className="w-6 h-6 text-rose-500" />
                            </div>
                        </div>
                    </div>
                </div>


                {/* Total Keseluruhan Card */}
                <div className="group perspective">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100
                        transform transition-all duration-500 hover:scale-110 hover:rotate-2
                        animate-slideLeft delay-200 hover:shadow-xl hover:shadow-amber-200/50
                        group-hover:z-10">
                        <div className="flex justify-between items-start">
                            <div className="transform transition-all duration-500 group-hover:translate-x-2">
                                <p className="text-emerald-500 text-lg font-medium mb-2">Total Peserta Magang</p>
                                <h3 className="text-4xl font-bold text-emerald-500">{stats.totalInterns}</h3>
                            </div>
                            <div className="bg-amber-100 p-3 rounded-lg transform transition-all duration-500
                                group-hover:rotate-12 group-hover:scale-110">
                                <Package className="w-6 h-6 text-amber-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Detail Cards with Enhanced Animations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* Card Berdasarkan Jenis Peserta */}
                <div className="group perspective">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100
                        transform transition-all duration-500 hover:scale-105 hover:rotate-1
                        animate-slideRight delay-300 hover:shadow-xl hover:shadow-blue-200/50">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-emerald-500 text-xl font-medium transform transition-all duration-500
                                group-hover:translate-x-2">Peserta Magang Aktif Berdasarkan Jenis</p>
                            <div className="bg-blue-100 p-3 rounded-lg transform transition-all duration-500
                                group-hover:rotate-12 group-hover:scale-110">
                                <GraduationCap className="w-6 h-6 text-blue-500" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-2 rounded-lg
                                transform transition-all duration-300 hover:bg-blue-50 hover:translate-x-2">
                                <span className="text-gray-600">Mahasiswa</span>
                                <span className="text-lg font-semibold">{stats.activeInterns.students.mahasiswa}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg
                                transform transition-all duration-300 hover:bg-blue-50 hover:translate-x-2">
                                <span className="text-gray-600">Siswa</span>
                                <span className="text-lg font-semibold">{stats.activeInterns.students.siswa}</span>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Card Berdasarkan Bidang */}
                <div className="group perspective">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100
                        transform transition-all duration-500 hover:scale-105 hover:rotate-1
                        animate-slideLeft delay-300 hover:shadow-xl hover:shadow-purple-200/50">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-emerald-500 text-xl font-medium transform transition-all duration-500
                                group-hover:translate-x-2">Peserta Magang Aktif Per Bidang</p>
                            <div className="bg-purple-100 p-3 rounded-lg transform transition-all duration-500
                                group-hover:rotate-12 group-hover:scale-110">
                                <Briefcase className="w-6 h-6 text-purple-500" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            {Object.entries(stats.activeInterns.byDepartment).map(([bidang, jumlah]) => (
                                <div key={bidang} className="flex justify-between items-center p-2 rounded-lg
                                    transform transition-all duration-300 hover:bg-purple-50 hover:translate-x-2">
                                    <span className="text-gray-600 capitalize">{bidang}</span>
                                    <span className="text-lg font-semibold">{jumlah}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>


            {/* Tabel Section */}
            <div className="mt-8 animate-slideUp delay-400">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Peserta Magang yang Akan Selesai dalam 7 Hari
                    </h2>
                    <div className="bg-yellow-100 px-3 py-1 rounded-lg transform transition-all duration-300
                        hover:scale-105">
                        <span className="text-yellow-700 font-medium">
                            {stats.completingSoon.interns.length} Orang
                        </span>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4
                    transform transition-all duration-300 hover:shadow-lg">
                    {stats.completingSoon.interns.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500
                                            uppercase tracking-wider">Nama</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500
                                            uppercase tracking-wider">Bidang</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500
                                            uppercase tracking-wider">Tanggal Selesai</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {stats.completingSoon.interns.map((intern) => (
                                        <tr key={intern.id_magang || intern.nama}
                                            className="hover:bg-gray-50 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap">{intern.nama}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{intern.nama_bidang}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {new Date(intern.tanggal_keluar).toLocaleDateString('id-ID')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-500">
                            Tidak ada Peserta magang yang akan selesai dalam 7 hari ke depan
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


export default Dashboard;