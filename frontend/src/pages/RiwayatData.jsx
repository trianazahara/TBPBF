// riwayat data

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  Tooltip
} from '@mui/material';
import { Assessment as AssessmentIcon, Info as InfoIcon, Check as CheckIcon } from '@mui/icons-material';
import axios from 'axios';


const calculateWorkingDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let workingDays = 0;
  let current = new Date(start);

  while (current <= end) {
    if (current.getDay() !== 0 && current.getDay() !== 6) {
      workingDays++;
    }
    current.setDate(current.getDate() + 1);
  }

  return workingDays;
};

// Dialog Component
const ScoreDialog = ({ open, onClose, selectedIntern, scoreForm, setScoreForm, onSubmit }) => {
  const workingDays = selectedIntern ? 
    calculateWorkingDays(selectedIntern.tanggal_masuk, selectedIntern.tanggal_keluar) : 0;

    useEffect(() => {
      console.log('Current scoreForm:', scoreForm);
      console.log('Current jumlah_hadir:', scoreForm.jumlah_hadir);
    }, [scoreForm]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {`Edit Nilai - ${selectedIntern?.nama}`}
      </DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            {/* Attendance field */}
            <Grid item xs={12}>
              <TextField
              fullWidth
              label="JUMLAH KEHADIRAN"
              type="number"
              value={scoreForm.jumlah_hadir}
              onChange={(e) => {
                const val = e.target.value;
                console.log('Input jumlah_hadir:', val);
                if (val === '' || (Number(val) >= 0 && Number(val) <= workingDays)) {
                  setScoreForm(prev => {
                    const newForm = {
                      ...prev,
                      jumlah_hadir: val
                    };
                    console.log('Updated scoreForm:', newForm);
                    return newForm;
                  });
                }
              }}
              helperText={`Total hari kerja: ${workingDays} hari`}
              required
              error={Number(scoreForm.jumlah_hadir) > workingDays}
              inputProps={{ 
                min: 0,
                max: workingDays,
                step: 1
              }}
            />
            </Grid>

            {/* Score fields */}
            {Object.entries(scoreForm).map(([key, value]) => {
              if (key === 'jumlah_hadir') return null;
              return (
                <Grid item xs={12} md={6} key={key}>
                  <TextField
                    fullWidth
                    label={key.split('_').slice(1).join(' ').toUpperCase()}
                    type="number"
                    value={value}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || (Number(val) >= 0 && Number(val) <= 100)) {
                        setScoreForm(prev => ({
                          ...prev,
                          [key]: val
                        }));
                      }
                    }}
                    inputProps={{ 
                      min: 0, 
                      max: 100,
                      step: "1"
                    }}
                    required
                    error={Number(value) < 0 || Number(value) > 100}
                    helperText={
                      Number(value) < 0 || Number(value) > 100 
                        ? 'Nilai harus antara 0-100' 
                        : ''
                    }
                  />
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Batal</Button>
          <Button type="submit" variant="contained">Simpan</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// Main Component
const RiwayatData = () => {
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0
  });
  const [search, setSearch] = useState('');
  const [bidang, setBidang] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [data, setData] = useState([]);
  const [bidangList, setBidangList] = useState([]);
  const [scoreForm, setScoreForm] = useState({
    nilai_teamwork: 0,
    nilai_komunikasi: 0,
    nilai_pengambilan_keputusan: 0,
    nilai_kualitas_kerja: 0,
    nilai_teknologi: 0,
    nilai_disiplin: 0,
    nilai_tanggungjawab: 0,
    nilai_kerjasama: 0,
    nilai_kejujuran: 0,
    nilai_kebersihan: 0,
    jumlah_hadir: 0
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch functions
  const fetchBidangList = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/bidang', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBidangList(response.data.data || []);
    } catch (error) {
      console.error('Error fetching bidang:', error);
      showSnackbar('Gagal mengambil data bidang', 'error');
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const userRole = decodedToken.role;
  
      const params = {
        page: pagination.page + 1,
        limit: pagination.limit,
        bidang,
        search,
        search_type: 'nama_institusi',
        status: statusFilter ? statusFilter : ['selesai', 'missing', 'almost'].join(',') 
      };
  
      if (userRole === 'admin') {
        params.mentor_id = decodedToken.userId;
      }
  
      const response = await axios.get('/api/intern/riwayat-data', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      console.log('Response data:', response.data);
      setData(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Error mengambil data', 'error');
    }
  };

  // Effects
  useEffect(() => {
    fetchBidangList();
  }, []);

  useEffect(() => {
    fetchData();
  }, [pagination.page, pagination.limit, bidang, search, statusFilter]);

  // Helper functions
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusLabel = (status) => {
    const labels = {
      'selesai': 'Selesai',
      'completed': 'Selesai',
      'missing': 'Missing',
      'almost': 'Hampir Selesai'
    };
    return labels[status?.toLowerCase()] || status;
  };

  const getStatusStyle = (status) => {
    const styles = {
        'selesai': {
            bg: '#dbeafe',
            color: '#1e40af',
            border: '#1e40af'
        },
        'missing': {
            bg: '#fee2e2', 
            color: '#991b1b', 
            border: '#991b1b'
        },
        'almost': {            
            bg: '#fef9c3',      
            color: '#854d0e',   
            border: '#854d0e'   
        }
    };

    return styles[status?.toLowerCase()] || styles['selesai'];
};

  // Handlers
  const handleOpenScoreDialog = (intern) => {
    console.log('Selected intern:', intern);
    setSelectedIntern(intern);
    setScoreForm({
      nilai_teamwork: 0,
      nilai_komunikasi: 0,
      nilai_pengambilan_keputusan: 0,
      nilai_kualitas_kerja: 0,
      nilai_teknologi: 0,
      nilai_disiplin: 0,
      nilai_tanggungjawab: 0,
      nilai_kerjasama: 0,
      nilai_kejujuran: 0,
      nilai_kebersihan: 0,
      jumlah_hadir: 0
    });
    setOpenDialog(true);
  };

  const handleSubmitScore = async (e) => {
    e.preventDefault();
    try {
      const scoreData = {
        id_magang: selectedIntern?.id_magang,
        ...scoreForm,
        nilai_teamwork: Number(scoreForm.nilai_teamwork),
        nilai_komunikasi: Number(scoreForm.nilai_komunikasi),
        nilai_pengambilan_keputusan: Number(scoreForm.nilai_pengambilan_keputusan),
        nilai_kualitas_kerja: Number(scoreForm.nilai_kualitas_kerja),
        nilai_teknologi: Number(scoreForm.nilai_teknologi),
        nilai_disiplin: Number(scoreForm.nilai_disiplin),
        nilai_tanggungjawab: Number(scoreForm.nilai_tanggungjawab),
        nilai_kerjasama: Number(scoreForm.nilai_kerjasama),
        nilai_kejujuran: Number(scoreForm.nilai_kejujuran),
        nilai_kebersihan: Number(scoreForm.nilai_kebersihan),
        jumlah_hadir: Number(scoreForm.jumlah_hadir)
      };

      console.log('Final score data being sent:', scoreData);
      console.log('jumlah_hadir value:', scoreData.jumlah_hadir);

      const response = await axios.post(
        `/api/intern/add-score/${selectedIntern.id_magang}`,
        scoreData,
        {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Response dari server:', response.data);
      
      if (response.status === 201) {
        showSnackbar('Nilai berhasil disimpan');
        setOpenDialog(false);
        fetchData();
      }

      if (response.status === 201) {
        showSnackbar('Nilai berhasil disimpan');
        setOpenDialog(false);

        setData(prevData => 
          prevData.map(item => 
            item.id_magang === selectedIntern.id_magang 
              ? { ...item, has_score: true }
              : item
          )
        );
      }
    } catch (error) {
      console.error('Submit error:', error);
      showSnackbar(error.response?.data?.message || 'Error menyimpan nilai', 'error');
    }
  };

  const getRowStyle = (intern) => {
    if (intern.has_scores) {
      return 'bg-blue-50'; 
    }
    return ''; 
  };

  const style = document.createElement('style');
style.textContent = `
  @keyframes gradient {
    0% {
      background-position: 0% 50%;
      background-size: 100% 100%;
    }
    25% {
      background-size: 200% 200%;
    }
    50% {
      background-position: 100% 50%;
      background-size: 100% 100%;
    }
    75% {
      background-size: 200% 200%;
    }
    100% {
      background-position: 0% 50%;
      background-size: 100% 100%;
    }
  }

  .animated-bg {
    background: linear-gradient(
      90deg, 
      #BCFB69 0%,
      #26BBAC 33%,
      #20A4F3 66%,
      #BCFB69 100%
    );
    background-size: 300% 100%;
    animation: gradient 8s ease-in-out infinite;
    transition: all 0.3s ease;
  }

  .animated-bg:hover {
    transform: scale(1.005);
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  }
`;
document.head.appendChild(style);

  // Render
  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      {/* Header */}
      <Box sx={{
  width: '100%',
  borderRadius: '12px',
  mb: 4,
  p: 3,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
}}
className="animated-bg"
>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
          Riwayat Data Anak Magang
        </Typography>
      </Box>

      {/* Filter Section */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search nama/institusi" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '0.375rem',
                }
              }}
            />
          </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Bidang</InputLabel>
            <Select
              value={bidang}
              label="Bidang"
              onChange={(e) => setBidang(e.target.value)}
              sx={{
                borderRadius: '0.375rem',
              }}
            >
              <MenuItem value="">Semua Bidang</MenuItem>
              {bidangList.map((bidang) => (
                <MenuItem key={bidang.id_bidang} value={bidang.id_bidang}>
                  {bidang.nama_bidang}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        {/* Add this new Grid item */}
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{
                borderRadius: '0.375rem',
              }}
            >
              <MenuItem value="">Semua Status</MenuItem>
              <MenuItem value="selesai">Selesai</MenuItem>
              <MenuItem value="almost">Hampir Selesai</MenuItem>
              <MenuItem value="missing">Missing</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow overflow-x-auto" style={{ maxWidth: '950px' }}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
            <th className="w-[20%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
            <th className="w-[20%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institusi</th>
            <th className="w-[15%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bidang</th>
            <th className="w-[15%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Masuk</th>
            <th className="w-[15%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Keluar</th>
            <th className="w-[10%] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="w-[10%] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((intern) => (
                <tr key={intern.id_magang} 
                className={`hover:bg-gray-100 transition-colors duration-200 ${getRowStyle(intern)}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 relative group">
                  {String(intern.nama)} 
                  {Boolean(intern.has_scores) && ( 
                    <Tooltip title="Sudah memiliki penilaian" placement="top">
                      <CheckIcon
                        className="text-blue-500 ml-2 h-4 w-4 inline-block" 
                        fontSize="small"
                      />
                    </Tooltip>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {intern.nama_institusi}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {intern.nama_bidang}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(intern.tanggal_masuk).toLocaleDateString('id-ID')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(intern.tanggal_keluar).toLocaleDateString('id-ID')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span 
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{
                            backgroundColor: getStatusStyle(intern.status).bg,
                            color: getStatusStyle(intern.status).color,
                            borderColor: getStatusStyle(intern.status).border,
                            borderWidth: '1px'
                        }}
                    >
                        {getStatusLabel(intern.status)}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {intern.status?.toLowerCase() !== 'missing' && (
                    intern.has_scores ? (
                      <Tooltip title="Sudah dinilai">
                        <span>  {/* Wrap dalam span agar tooltip tetap muncul tapi tidak bisa diklik */}
                          <IconButton 
                            sx={{ 
                              color: 'success.main',
                              '&:hover': {
                                bgcolor: 'rgba(76, 175, 80, 0.08)'
                              },
                              cursor: 'default'  
                            }}
                            size="small"
                            disableRipple  
                            disabled  
                          >
                            <AssessmentIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Tambah penilaian">
                        <IconButton 
                          onClick={() => handleOpenScoreDialog(intern)}
                          sx={{ 
                            color: 'info.main',
                            '&:hover': {
                              bgcolor: 'rgba(33, 150, 243, 0.08)'
                            }
                          }}
                          size="small"
                        >
                          <AssessmentIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )

                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Updated Pagination Section */}
      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-b-lg">
        <div className="flex items-center gap-2">
          <select
            value={pagination.limit}
            onChange={(e) => {
              setPagination(prev => ({
                ...prev,
                limit: Number(e.target.value),
                page: 0
              }));
            }}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            {[5, 10, 25, 50].map(size => (
              <option key={size} value={size}>{size} items</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPagination(prev => ({
              ...prev,
              page: Math.max(0, prev.page - 1)
            }))}
            disabled={pagination.page === 0}
            className={`px-4 py-2 text-sm font-medium rounded-md 
              ${pagination.page === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
          >
            Previous
          </button>
          <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md">
            {pagination.page + 1}
          </span>
          <button
            onClick={() => setPagination(prev => ({
              ...prev,
              page: prev.page + 1
            }))}
            disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit) - 1}
            className={`px-4 py-2 text-sm font-medium rounded-md
              ${pagination.page >= Math.ceil(pagination.total / pagination.limit) - 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Score Input Dialog */}
      <ScoreDialog 
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        selectedIntern={selectedIntern}
        scoreForm={scoreForm}
        setScoreForm={setScoreForm}
        onSubmit={handleSubmitScore}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RiwayatData;