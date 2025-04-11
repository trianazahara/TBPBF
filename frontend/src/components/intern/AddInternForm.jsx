import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const AddInternForm = () => {
  const navigate = useNavigate();
  // Form fields state
  const [fields, setFields] = useState({
    nama: '',
    jenis_peserta: 'mahasiswa',
    nama_institusi: '',
    jenis_institusi: '',
    email: '',
    no_hp: '',
    bidang_id: '',
    tanggal_masuk: '',
    tanggal_keluar: '',
    detail_peserta: {
      nim: '',
      nisn: '',
      fakultas: '',
      jurusan: '',
      semester: '',
      kelas: ''
    }
  });

  const [error, setError] = useState(null);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (!checkAuth()) return;
    fetchBidangList();
  }, []);

  // Bidang state
  const [bidangList, setBidangList] = useState([]);
  const [bidangLoading, setBidangLoading] = useState(true);
  const [bidangError, setBidangError] = useState(null);
  const [loading, setLoading] = useState(false);


  // Fetch bidang data on component mount
  useEffect(() => {
    fetchBidangList();
  }, []);

  const fetchBidangList = async () => {
    try {
      setBidangLoading(true);
      setBidangError(null);

      const token = localStorage.getItem('token');

        const response = await fetch('/api/bidang', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch bidang data');
      }

      const result = await response.json();
      if (result.status === 'success') {
        setBidangList(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch bidang data');
      }
    } catch (error) {
      console.error('Error fetching bidang:', error);
      setBidangError('Gagal mengambil data bidang. Silakan coba lagi.');
    } finally {
      setBidangLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFields(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFields(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!checkAuth()) return;
    
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/intern/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(fields)
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      const data = await response.json();

      if (data.status === 'success') {
        alert('Data peserta magang berhasil ditambahkan');
        navigate('/intern/management');
      } else {
        throw new Error(data.message || 'Gagal menambahkan data');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.message || "Gagal menambahkan data peserta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-4 px-6 sm:ml-64">
    <div className="max-w-3xl mx-auto mb-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-blue-600"
      >
        <svg 
          className="w-5 h-5 mr-2" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Kembali
      </button>
    </div>
  

   <div className="max-w-4xl mx-auto w-full bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Tambah Peserta Magang</h2>
        </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="nama"
                value={fields.nama}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Jenis Peserta
              </label>
              <select
                name="jenis_peserta"
                value={fields.jenis_peserta}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="mahasiswa">Mahasiswa</option>
                <option value="siswa">Siswa</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Nama Institusi
              </label>
              <input
                type="text"
                name="nama_institusi"
                value={fields.nama_institusi}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Jenis Institusi
              </label>
              <select
                name="jenis_institusi"
                value={fields.jenis_institusi}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Pilih Jenis Institusi</option>
                <option value="universitas">Universitas</option>
                <option value="sekolah">Sekolah</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={fields.email}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                No. HP
              </label>
              <input
                type="tel"
                name="no_hp"
                value={fields.no_hp}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Bidang
                {bidangLoading && <span className="ml-2 text-gray-500">(Loading...)</span>}
              </label>
              <select
                name="bidang_id"
                value={fields.bidang_id}
                onChange={handleInputChange}
                required
                disabled={bidangLoading}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Pilih Bidang</option>
                {bidangList.map(bidang => (
                  <option 
                    key={bidang.id_bidang} 
                    value={bidang.id_bidang}
                  >
                    {bidang.nama_bidang}
                    {bidang.available_slots > 0 && ` (${bidang.available_slots} slot tersedia)`}
                  </option>
                ))}
              </select>
              {bidangError && (
                <p className="mt-1 text-sm text-red-600">{bidangError}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Tanggal Masuk
              </label>
              <input
                type="date"
                name="tanggal_masuk"
                value={fields.tanggal_masuk}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Tanggal Keluar
              </label>
              <input
                type="date"
                name="tanggal_keluar"
                value={fields.tanggal_keluar}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Detail Peserta Section */}
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-medium mb-4">Detail Peserta</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.jenis_peserta === 'mahasiswa' ? (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      NIM
                    </label>
                    <input
                      type="text"
                      name="detail_peserta.nim"
                      value={fields.detail_peserta.nim}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Fakultas
                    </label>
                    <input
                      type="text"
                      name="detail_peserta.fakultas"
                      value={fields.detail_peserta.fakultas}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Jurusan
                    </label>
                    <input
                      type="text"
                      name="detail_peserta.jurusan"
                      value={fields.detail_peserta.jurusan}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Semester
                    </label>
                    <input
                      type="number"
                      name="detail_peserta.semester"
                      value={fields.detail_peserta.semester}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      NISN
                    </label>
                    <input
                      type="text"
                      name="detail_peserta.nisn"
                      value={fields.detail_peserta.nisn}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Jurusan
                    </label>
                    <input
                      type="text"
                      name="detail_peserta.jurusan"
                      value={fields.detail_peserta.jurusan}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Kelas
                    </label>
                    <input
                      type="text"
                      name="detail_peserta.kelas"
                      value={fields.detail_peserta.kelas}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={loading || bidangLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
};

export default AddInternForm;