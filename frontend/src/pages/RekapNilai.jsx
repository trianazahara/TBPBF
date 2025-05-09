
//rekap nilai
import React, { useState, useEffect } from 'react';
import { LoadingButton } from '@mui/lab';
import { Close as CloseIcon } from '@mui/icons-material';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Snackbar,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  FormControlLabel,
  Radio,
  RadioGroup,
  CircularProgress,
  Stack
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axios from 'axios';
import { Edit as EditIcon, FileDownload as FileDownloadIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { BookIcon } from 'lucide-react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';



const FormTextField = ({ field, form: { touched, errors }, ...props }) => (
  <TextField
    {...field}
    {...props}
    error={touched[field.name] && Boolean(errors[field.name])}
    helperText={touched[field.name] && errors[field.name]}
  />
);


const RekapNilai = () => {
  const [mentorList, setMentorList] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [data, setData] = useState([]);
  const [bidangList, setBidangList] = useState([]);
  const [detailDialog, setDetailDialog] = useState({
    open: false,
    loading: false,
    data: null,
    error: null
  });
  const [filters, setFilters] = useState({
    bidang: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0
  });
  const [editDialog, setEditDialog] = useState({
    open: false,
    loading: false,
    data: null,
    error: null
  });
  const [scoreForm, setScoreForm] = useState({
    nilai_teamwork: '',
    nilai_komunikasi: '',
    nilai_pengambilan_keputusan: '',
    nilai_kualitas_kerja: '',
    nilai_teknologi: '',
    nilai_disiplin: '',
    nilai_tanggungjawab: '',
    nilai_kerjasama: '',
    nilai_kejujuran: '',
    nilai_kebersihan: '',
    jumlah_hadir: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [exportDialog, setExportDialog] = useState({
    open: false,
    loading: false,
    exportType: 'all',
    dateRange: {
      startDate: null,
      endDate: null
    }
  });



  const adjustDateForTimezone = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };
  
  const [editDataDialog, setEditDataDialog] = useState({
    open: false,
    loading: false,
    data: null,
    error: null
  });

const handleEditDataClick = async (id) => {
  try {

    setDetailDialog(prev => ({ ...prev, open: false }));
    setEditDataDialog(prev => ({
      ...prev,
      loading: true,
      open: true
    }));

    const response = await axios.get(`/api/intern/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    if (response.data.status === 'success') {
      setEditDataDialog(prev => ({
        ...prev,
        loading: false,
        data: response.data.data,
        error: null
      }));
    } else {
      throw new Error(response.data.message || 'Failed to fetch intern data');
    }
  } catch (error) {
    console.error('Error fetching intern data:', error);
    setEditDataDialog(prev => ({
      ...prev,
      loading: false,
      error: error.response?.data?.message || 'Gagal mengambil data peserta magang'
    }));
    showSnackbar(error.response?.data?.message || 'Gagal mengambil data peserta magang', 'error');
  }
};

const handleEditSubmit = async (values, { setSubmitting }) => {
  try {
    const response = await axios.put(
      `/api/intern/${editDataDialog.data.id_magang}`,
      values,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status === 'success') {
      showSnackbar('Data berhasil diperbarui', 'success');
      setEditDataDialog({ open: false, loading: false, data: null, error: null });
      fetchData(); 
    } else {
      throw new Error(response.data.message || 'Gagal memperbarui data');
    }
  } catch (error) {
    console.error('Error updating intern data:', error);
    showSnackbar(
      error.response?.data?.message || 'Gagal memperbarui data. Silakan coba lagi.',
      'error'
    );
    setEditDataDialog(prev => ({
      ...prev,
      error: error.response?.data?.message || 'Gagal memperbarui data'
    }));
  } finally {
    setSubmitting(false);
  }
};


  


  const handleDetailClick = async (id) => {
    setDetailDialog(prev => ({ ...prev, open: true, loading: true }));
    try {
      const response = await axios.get(`/api/intern/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.status === 'success') {
        setDetailDialog(prev => ({
          ...prev,
          data: response.data.data,
          loading: false

        }));
      } else {
        throw new Error(response.data.message || 'Failed to fetch detail data');
      }
    } catch (error) {
      console.error('Error fetching intern detail:', error);
      setDetailDialog(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
    }
  };


  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

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
      console.log('Current filters:', filters);
      console.log('Current pagination:', pagination);
  
      const response = await axios.get('/api/intern/rekap-nilai', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: {
          page: pagination.page + 1,
          limit: pagination.limit,
          bidang: filters.bidang,
          search: filters.search,
          status: ['selesai', 'almost'].join(',') 
        }
      });

    console.log('Request config:', {
      url: '/api/intern/rekap-nilai',
      params: {
        page: pagination.page + 1,
        limit: pagination.limit,
        bidang: filters.bidang,
        search: filters.search
      }
    });
    console.log('Raw response:', response);
    console.log('Response data structure:', {
      status: response.data.status,
      dataLength: response.data.data?.length,
      pagination: response.data.pagination
    });

    setData(response.data.data);
    setPagination(prev => ({
      ...prev,
      total: response.data.pagination.total
    }));
  } catch (error) {
    console.error('Error fetching data:', error.response || error);
    showSnackbar('Error mengambil data', 'error');
  }
};

  useEffect(() => {
    fetchBidangList();
  }, []);




  useEffect(() => {
    fetchData();
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.role);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    fetchUserRole();
  }, []);

  // Add useEffect for fetching mentors (only for superadmin)
  useEffect(() => {
    const fetchMentors = async () => {
      if (userRole !== 'superadmin') return;
      
      try {
        const response = await fetch('/api/admin/mentors', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setMentorList(data);
        }
      } catch (error) {
        console.error('Error fetching mentors:', error);
      }
    };

    fetchMentors();
  }, [userRole]);


  const handleFilter = (key, value) => {
    console.log(`Handling filter change: ${key} = ${value}`); 
    
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [key]: value
      };
      console.log('New filters state:', newFilters); 
      return newFilters;
    });
    
    setPagination(prev => ({
      ...prev,
      page: 0
    }));
  };




  const handleGenerateClick = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/document/generate-sertifikat/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });




      const downloadResponse = await axios.get(
        `http://localhost:5000/api/document/download-sertifikat/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          responseType: 'blob'
        }
      );




      const url = window.URL.createObjectURL(new Blob([downloadResponse.data]));
      const link = document.createElement('a');
      link.href = url;
      const internName = data.find(intern => intern.id_magang === id)?.nama || 'unknown';
      link.download = `sertifikat_${internName}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);




      showSnackbar('Sertifikat berhasil di-generate dan diunduh');
    } catch (error) {
      console.error('Error:', error);
      showSnackbar(error.response?.data?.message || 'Gagal generate sertifikat', 'error');
    }
};
 
  const handleEditScore = (score) => {
  console.log("Score data:", score); 
  console.log("Working days:", calculateWorkingDays(score.tanggal_masuk, score.tanggal_keluar)); 




    setEditDialog({
      open: true,
      loading: false,
      data: score,
      error: null
    });
    setScoreForm({
      nilai_teamwork: score.nilai_teamwork || '',
      nilai_komunikasi: score.nilai_komunikasi || '',
      nilai_pengambilan_keputusan: score.nilai_pengambilan_keputusan || '',
      nilai_kualitas_kerja: score.nilai_kualitas_kerja || '',
      nilai_teknologi: score.nilai_teknologi || '',
      nilai_disiplin: score.nilai_disiplin || '',
      nilai_tanggungjawab: score.nilai_tanggungjawab || '',
      nilai_kerjasama: score.nilai_kerjasama || '',
      nilai_kejujuran: score.nilai_kejujuran || '',
      nilai_kebersihan: score.nilai_kebersihan || '',
      jumlah_hadir: score.jumlah_hadir || '' 
    });
  };




  const handleSubmitScore = async (e) => {
    e.preventDefault();
    setEditDialog(prev => ({ ...prev, loading: true }));
    try {
      const scoreData = {
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
 
      const response = await axios.put(
        `/api/intern/update-nilai/${editDialog.data.id_penilaian}`,
        scoreData,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        }
    );




      if (response.data.status === 'success') {
            showSnackbar('Nilai berhasil diperbarui', 'success');
            setEditDialog(prev => ({ ...prev, open: false, loading: false }));
            fetchData();
        } else {
            throw new Error(response.data.message || 'Gagal memperbarui nilai');
        }
    } catch (error) {
        console.error('Error updating score:', error);
        showSnackbar(
            error.response?.data?.message || 'Gagal memperbarui nilai. Silakan coba lagi.',
            'error'
        );
        setEditDialog(prev => ({
            ...prev,
            loading: false,
            error: error.response?.data?.message || 'Gagal memperbarui nilai'
        }));
    }
};




const handleExport = async () => {
  setExportDialog(prev => ({ ...prev, loading: true }));
  try {
    const params = {
      bidang: filters.bidang
    };
   

    if (exportDialog.exportType === 'filtered' && exportDialog.dateRange.startDate && exportDialog.dateRange.endDate) {
      const formatDate = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      };
      params.end_date_start = formatDate(exportDialog.dateRange.startDate);
      params.end_date_end = formatDate(exportDialog.dateRange.endDate);
    }




    console.log('Export params:', params); 




    const response = await axios.get('/api/intern/export', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      responseType: 'blob',
      params
    });




    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Data_Anak_Magang.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    showSnackbar('Data berhasil diexport');
    setExportDialog(prev => ({ ...prev, open: false, loading: false }));
  } catch (error) {
    showSnackbar('Error mengexport data', 'error');
    setExportDialog(prev => ({ ...prev, loading: false }));
  }
};


const ExportDialog = () => (
  <Dialog
    open={exportDialog.open}
    onClose={() => setExportDialog(prev => ({ ...prev, open: false }))}
    maxWidth="sm"
    fullWidth
  >
    <DialogTitle sx={{ pb: 1 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">Export Data</Typography>
        <IconButton
          onClick={() => setExportDialog(prev => ({ ...prev, open: false }))}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </Box>
    </DialogTitle>
    <DialogContent>
      <Box sx={{ mt: 2 }}>
        <RadioGroup
          value={exportDialog.exportType}
          onChange={(e) => setExportDialog(prev => ({
            ...prev,
            exportType: e.target.value
          }))}
        >
          <FormControlLabel
            value="all"
            control={<Radio />}
            label="Export Semua Data"
          />
          <FormControlLabel
            value="filtered"
            control={<Radio />}
            label="Export Berdasarkan Filter Tanggal"
          />
        </RadioGroup>

        {exportDialog.exportType === 'filtered' && (
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Tanggal Mulai"
                value={exportDialog.dateRange.startDate}
                onChange={(date) => setExportDialog(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, startDate: date }
                }))}
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DatePicker
                label="Tanggal Akhir"
                value={exportDialog.dateRange.endDate}
                onChange={(date) => setExportDialog(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, endDate: date }
                }))}
                slotProps={{ textField: { fullWidth: true } }}
                minDate={exportDialog.dateRange.startDate}
              />
            </LocalizationProvider>
          </Box>
        )}
      </Box>
    </DialogContent>
    <DialogActions>
      <Button
        onClick={() => setExportDialog(prev => ({ ...prev, open: false }))}
        disabled={exportDialog.loading}
      >
        Batal
      </Button>
      <LoadingButton
        onClick={handleExport}
        loading={exportDialog.loading}
        variant="contained"
        disabled={
          exportDialog.exportType === 'filtered' &&
          (!exportDialog.dateRange.startDate || !exportDialog.dateRange.endDate)
        }
      >
        Export
      </LoadingButton>
    </DialogActions>
  </Dialog>
);


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
   
     // Main render
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
            Rekap Nilai
        </Typography>
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={() => setExportDialog(prev => ({ ...prev, open: true }))}
          sx={{
            bgcolor: 'white',
            color: '#26BBAC',
            '&:hover': { bgcolor: '#f5f5f5' },
          }}
        >
          Export Excel
        </Button>
      </Box>


      {/* Filter Section */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Search nama/institusi"
            value={filters.search}
            onChange={(e) => handleFilter('search', e.target.value)}
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel>Bidang</InputLabel>
            <Select
              value={filters.bidang}
              label="Bidang"
              onChange={(e) => handleFilter('bidang', e.target.value)}
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
      </Grid>








      {/* Table */}
      {/* Table Section */}
      <div className="bg-white rounded-lg shadow overflow-x-auto" style={{ maxWidth: '950px' }}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-[20%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nama
            </th>
            <th className="w-[20%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Institusi
            </th>
            <th className="w-[15%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Bidang
            </th>
            <th className="w-[15%] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Nilai
            </th>
            <th className="w-[10%] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Absensi
            </th>
            <th className="w-[10%] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rata-rata
            </th>
            <th className="w-[10%] px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
        {data.map((score) => {
  const totalNilai = (
    Number(score.nilai_teamwork || 0) +
    Number(score.nilai_komunikasi || 0) +
    Number(score.nilai_pengambilan_keputusan || 0) +
    Number(score.nilai_kualitas_kerja || 0) +
    Number(score.nilai_teknologi || 0) +
    Number(score.nilai_disiplin || 0) +
    Number(score.nilai_tanggungjawab || 0) +
    Number(score.nilai_kerjasama || 0) +
    Number(score.nilai_kejujuran || 0) +
    Number(score.nilai_kebersihan || 0)
  );
 
  const workingDays = calculateWorkingDays(score.tanggal_masuk, score.tanggal_keluar);
  const average = totalNilai / 10;
 

          const attendanceScore = (score.jumlah_hadir || 0) / workingDays * 100;
            return (
              <tr key={score.id_penilaian} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {score.nama}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {score.nama_institusi}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {score.nama_bidang}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {totalNilai}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                {score.jumlah_hadir || 0}/{workingDays}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                {average.toFixed(2)}
              </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                <IconButton
  onClick={() => handleDetailClick(score.id_magang)}
  sx={{ color: 'info.main' }}
  size="small"
>
  <VisibilityIcon fontSize="small" />
</IconButton>




                  <IconButton
                    onClick={() => handleEditScore(score)}
                    sx={{ color: 'info.main' }}
                    size="small"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleGenerateClick(score.id_magang)}
                    sx={{ color: 'info.main' }}
                    >
                    <FileDownloadIcon fontSize="small" />
                    </IconButton>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
 




      {/* Pagination */}
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




      <Dialog
  open={detailDialog.open}
  onClose={() => setDetailDialog({ open: false, loading: false, data: null, error: null })}
  maxWidth="md"
  fullWidth
>
  <DialogTitle sx={{ pb: 1 }}>
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Typography variant="h6">Detail Peserta Magang</Typography>
      <IconButton
        onClick={() => setDetailDialog({ open: false, loading: false, data: null, error: null })}
        size="small"
      >
        <CloseIcon />
      </IconButton>
    </Box>
  </DialogTitle>
 
  <DialogContent sx={{ pb: 2 }}>
    {detailDialog.loading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    ) : detailDialog.error ? (
      <Alert severity="error">{detailDialog.error}</Alert>
    ) : detailDialog.data && (
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary">Informasi Pribadi</Typography>
          <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">Nama Lengkap</Typography>
                <Typography variant="body1">{detailDialog.data.nama}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{detailDialog.data.email || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">No. HP</Typography>
                <Typography variant="body1">{detailDialog.data.no_hp || '-'}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>




        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary">Informasi Akademik</Typography>
          <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">Institusi</Typography>
                <Typography variant="body1">{detailDialog.data.nama_institusi}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {detailDialog.data.jenis_peserta === 'mahasiswa' ? 'NIM' : 'NISN'}
                </Typography>
                <Typography variant="body1">
                  {detailDialog.data.detail_peserta?.nim || detailDialog.data.detail_peserta?.nisn || '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Jurusan</Typography>
                <Typography variant="body1">
                  {detailDialog.data.detail_peserta?.jurusan || '-'}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>




        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>Informasi Pembimbing</Typography>
          <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">Nama Pembimbing</Typography>
                <Typography variant="body1">{detailDialog.data.nama_pembimbing || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">No. Telp Pembimbing</Typography>
                <Typography variant="body1">{detailDialog.data.telp_pembimbing || '-'}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {userRole === 'superadmin' && (
    <Grid item xs={12} md={6}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, mt: 1 }} >Mentor</Typography>
      <Paper variant="outlined" sx={{ p: 2, mt: 1}}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">Nama Mentor</Typography>
            <Typography variant="body1">
              {mentorList.find(m => m.id_users === detailDialog.data.mentor_id)?.nama || '-'}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Grid>
  )}


        <Grid item xs={12}>
          <Typography variant="subtitle2" color="text.secondary">Informasi Magang</Typography>
          <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">Ruang Penempatan</Typography>
                <Typography variant="body1">{detailDialog.data.nama_bidang}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">Tanggal Mulai</Typography>
                <Typography variant="body1">{formatDate(detailDialog.data.tanggal_masuk)}</Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">Tanggal Selesai</Typography>
                <Typography variant="body1">{formatDate(detailDialog.data.tanggal_keluar)}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    )}
  </DialogContent>

  <DialogActions sx={{ px: 3, pb: 2 }}>
  <Button
  onClick={() => handleEditDataClick(detailDialog.data?.id_magang)}
  startIcon={<EditIcon />}
  sx={{ 
    color: '#2E7D32',
    borderColor: '#2E7D32',
    '&:hover': {
      borderColor: '#1B5E20',
      bgcolor: '#E8F5E9'
    }
  }}
  variant="outlined" 
  disabled={!detailDialog.data || detailDialog.loading}
>
  Edit Data
</Button>
  </DialogActions>
</Dialog>

  <Dialog
    open={editDataDialog.open}
    onClose={() => setEditDataDialog({ open: false, loading: false, data: null, error: null })}
    maxWidth="md"
    fullWidth
  >
    <DialogTitle sx={{ pb: 1 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">Edit Data Peserta Magang</Typography>
        <IconButton
          onClick={() => setEditDataDialog({ open: false, loading: false, data: null, error: null })}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </Box>
    </DialogTitle>
   
    <DialogContent>
      {editDataDialog.loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : editDataDialog.error ? (
        <Alert severity="error" sx={{ mb: 2 }}>{editDataDialog.error}</Alert>
      ) : editDataDialog.data && (
        <Formik
          initialValues={{
            nama: editDataDialog.data.nama || '',
            email: editDataDialog.data.email || '',
            no_hp: editDataDialog.data.no_hp || '',
            nama_institusi: editDataDialog.data.nama_institusi || '',
            jenis_institusi: editDataDialog.data.jenis_institusi || '',
            bidang_id: editDataDialog.data.id_bidang || '',
            tanggal_masuk: adjustDateForTimezone(editDataDialog.data.tanggal_masuk),
            tanggal_keluar: adjustDateForTimezone(editDataDialog.data.tanggal_keluar),
            nama_pembimbing: editDataDialog.data.nama_pembimbing || '',
            telp_pembimbing: editDataDialog.data.telp_pembimbing || '',
            mentor_id: editDataDialog.data.mentor_id || '',
            status: editDataDialog.data.status || 'not_yet',
            detail_peserta: {
              ...(editDataDialog.data.jenis_peserta === 'mahasiswa'
                ? {
                    nim: editDataDialog.data.detail_peserta?.nim || '',
                    fakultas: editDataDialog.data.detail_peserta?.fakultas || '',
                    jurusan: editDataDialog.data.detail_peserta?.jurusan || '',
                    semester: editDataDialog.data.detail_peserta?.semester || ''
                  }
                : {
                    nisn: editDataDialog.data.detail_peserta?.nisn || '',
                    jurusan: editDataDialog.data.detail_peserta?.jurusan || '',
                    kelas: editDataDialog.data.detail_peserta?.kelas || ''
                  }
              )
            }
          }}
          onSubmit={handleEditSubmit}
          validationSchema={Yup.object({
            nama: Yup.string()
              .required('Nama wajib diisi')
              .min(3, 'Nama minimal 3 karakter'),
            email: Yup.string()
              .email('Format email tidak valid'),
            jenis_institusi: Yup.string()
              .required('Jenis institusi wajib dipilih'),
            no_hp: Yup.string()
              .matches(/^[0-9]+$/, 'Nomor HP hanya boleh berisi angka')
              .min(10, 'Nomor HP minimal 10 digit')
              .max(15, 'Nomor HP maksimal 15 digit'),
            nama_institusi: Yup.string()
              .required('Nama institusi wajib diisi'),
            bidang_id: Yup.string()
              .required('Ruang Penempatan wajib dipilih'),
            tanggal_masuk: Yup.date()
              .required('Tanggal masuk wajib diisi'),
            tanggal_keluar: Yup.date()
              .required('Tanggal keluar wajib diisi')
              .min(
                Yup.ref('tanggal_masuk'),
                'Tanggal keluar harus setelah tanggal masuk'
              ),
            nama_pembimbing: Yup.string()
                          .nullable(),
                        telp_pembimbing: Yup.string()
                          .nullable()
                          .matches(/^[0-9]*$/, 'Nomor telepon hanya boleh berisi angka')
                          .min(10, 'Nomor telepon minimal 10 digit')
                          .max(15, 'Nomor telepon maksimal 15 digit'),
                          mentor_id: Yup.string()
    .nullable(),
            status: Yup.string()
              .required('Status wajib dipilih'),
            detail_peserta: Yup.object().shape(
              editDataDialog.data.jenis_peserta === 'mahasiswa'
                ? {
                    nim: Yup.string().required('NIM wajib diisi'),
                    jurusan: Yup.string().required('Jurusan wajib diisi'),
                    fakultas: Yup.string().required('Fakultas wajib diisi'),
                    semester: Yup.number()
                      .typeError('Semester harus berupa angka')
                      .min(1, 'Minimal semester 1')
                      .max(14, 'Maksimal semester 14')
                  }
                : {
                    nisn: Yup.string().required('NISN wajib diisi'),
                    jurusan: Yup.string().required('Jurusan wajib diisi'),
                    kelas: Yup.string().required('Kelas wajib diisi')
                  }
            )
          })}
        >
          {({ isSubmitting }) => (
            <Form>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {/* Status Magang - Ditambahkan di awal form */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                    Status Magang
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    name="status"
                    component={({ field, form }) => (
                      <FormControl fullWidth size="small" error={form.touched.status && Boolean(form.errors.status)}>
                        <InputLabel>Status Magang</InputLabel>
                        <Select {...field} label="Status Magang">
                          <MenuItem value="not_yet">Belum Mulai</MenuItem>
                          <MenuItem value="aktif">Aktif</MenuItem>
                          <MenuItem value="almost">Hampir Selesai</MenuItem>
                          <MenuItem value="selesai">Selesai</MenuItem>
                          <MenuItem value="missing">Missing</MenuItem>
                        </Select>
                        {form.touched.status && form.errors.status && (
                          <FormHelperText>{form.errors.status}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>


                {/* Informasi Pribadi */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, mt: 2 }}>
                    Informasi Pribadi
                  </Typography>
                </Grid>
               
                <Grid item xs={12} md={6}>
                  <Field
                    name="nama"
                    component={FormTextField}
                    fullWidth
                    label="Nama Lengkap"
                    size="small"
                  />
                </Grid>


                <Grid item xs={12} md={6}>
                  <Field
                    name="email"
                    component={FormTextField}
                    fullWidth
                    label="Email"
                    type="email"
                    size="small"
                  />
                </Grid>


                <Grid item xs={12} md={6}>
                  <Field
                    name="no_hp"
                    component={FormTextField}
                    fullWidth
                    label="Nomor HP"
                    size="small"
                  />
                </Grid>


                {/* Informasi Institusi */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
                    Informasi Institusi
                  </Typography>
                </Grid>


                <Grid item xs={12} md={6}>
                  <Field
                    name="nama_institusi"
                    component={FormTextField}
                    fullWidth
                    label="Nama Institusi"
                    size="small"
                  />
                </Grid>


                <Grid item xs={12} md={6}>
                  <Field
                    name="bidang_id"
                    component={({ field, form }) => (
                      <FormControl fullWidth size="small" error={form.touched.bidang_id && Boolean(form.errors.bidang_id)}>
                        <InputLabel>Ruang Penempatan</InputLabel>
                        <Select {...field} label="Bidang">
                          {bidangList.map(bidang => (
                            <MenuItem key={bidang.id_bidang} value={bidang.id_bidang}>
                              {bidang.nama_bidang}
                            </MenuItem>
                          ))}
                        </Select>
                        {form.touched.bidang_id && form.errors.bidang_id && (
                          <FormHelperText>{form.errors.bidang_id}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>


                {/* Detail Peserta */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
                    Detail Peserta
                  </Typography>
                </Grid>


                {editDataDialog.data.jenis_peserta === 'mahasiswa' ? (
                  <>
                    <Grid item xs={12} md={6}>
                      <Field
                        name="detail_peserta.nim"
                        component={FormTextField}
                        fullWidth
                        label="NIM"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Field
                        name="detail_peserta.fakultas"
                        component={FormTextField}
                        fullWidth
                        label="Fakultas"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Field
                        name="detail_peserta.jurusan"
                        component={FormTextField}
                        fullWidth
                        label="Jurusan"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Field
                        name="detail_peserta.semester"
                        component={FormTextField}
                        fullWidth
                        label="Semester"
                        type="number"
                        size="small"
                      />
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item xs={12} md={6}>
                      <Field
                        name="detail_peserta.nisn"
                        component={FormTextField}
                        fullWidth
                        label="NISN"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Field
                        name="detail_peserta.jurusan"
                        component={FormTextField}
                        fullWidth
                        label="Jurusan"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Field
                        name="detail_peserta.kelas"
                        component={FormTextField}
                        fullWidth
                        label="Kelas"
                        size="small"
                      />
                    </Grid>
                  </>
                )}


                {/* Periode Magang */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
                    Periode Magang
                  </Typography>
                </Grid>


                <Grid item xs={12} md={6}>
                  <Field
                    name="tanggal_masuk"
                    component={FormTextField}
                    fullWidth
                    label="Tanggal Mulai"
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>


                <Grid item xs={12} md={6}>
                  <Field
                    name="tanggal_keluar"
                    component={FormTextField}
                    fullWidth
                    label="Tanggal Selesai"
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>


                {/* Informasi Pembimbing */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
                    Informasi Pembimbing
                  </Typography>
                </Grid>
               
                <Grid item xs={12} md={6}>
                  <Field
                    name="nama_pembimbing"
                    component={FormTextField}
                    fullWidth
                    label="Nama Pembimbing"
                    size="small"
                  />
                </Grid>


                <Grid item xs={12} md={6}>
  <Field
    name="telp_pembimbing"
    component={FormTextField}
    fullWidth
    label="No. Telp Pembimbing"
    size="small"
  />
</Grid>

<Grid item xs={12}>
  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
    Mentor
  </Typography>
</Grid>

<Grid item xs={12} md={6}>
  <Field
    name="mentor_id"
    component={({ field, form }) => (
      <FormControl fullWidth size="small">
        <InputLabel>Mentor</InputLabel>
        <Select {...field} label="Mentor">
          {mentorList.map(mentor => (
            <MenuItem key={mentor.id_users} value={mentor.id_users}>
              {mentor.nama}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    )}
  />
</Grid>
</Grid>


              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                  onClick={() => setEditDataDialog({ open: false, loading: false, data: null, error: null })}
                  disabled={isSubmitting}
                  sx={{ 
                    color: '#2E7D32',
                    borderColor: '#2E7D32',
                    '&:hover': {
                      borderColor: '#1B5E20',
                      bgcolor: '#E8F5E9'
                    }
                  }}
                  variant="outlined"
                >

                  Batal
                </Button>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                  sx={{
                    bgcolor: '#2E7D32',
                    '&:hover': {
                      bgcolor: '#1B5E20'
                    }
                  }}
                >
                  Simpan Perubahan
                </LoadingButton>
              </Box>
            </Form>
          )}
        </Formik>
      )}
    </DialogContent>
  </Dialog>

      {/* Edit Score Dialog */}
      <Dialog
      open={editDialog.open}
      onClose={() => setEditDialog({ open: false, loading: false, data: null, error: null })}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Edit Nilai - {editDialog.data?.nama}</Typography>


          <IconButton
            onClick={() => setEditDialog({ open: false, loading: false, data: null, error: null })}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmitScore}>
        <DialogContent>
          {editDialog.error && (
            <Alert severity="error" sx={{ mb: 2 }}>{editDialog.error}</Alert>
          )}




          <Grid container spacing={2}>
            {/* Attendance Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                Informasi Kehadiran
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
  <Typography variant="body2" color="text.secondary">
    Total Hari Kerja
  </Typography>
  <Typography variant="body1" fontWeight="medium">
  {calculateWorkingDays(editDialog.data?.tanggal_masuk, editDialog.data?.tanggal_keluar)} Hari
</Typography>
</Grid>
  <Grid item xs={12} md={6}>
    <TextField
      fullWidth
      label="Jumlah Kehadiran"
      type="number"
      value={scoreForm.jumlah_hadir || ''}
      onChange={(e) => {
        const val = e.target.value;
        const workingDays = calculateWorkingDays(
          editDialog.data?.tanggal_masuk,
          editDialog.data?.tanggal_keluar
        );
       
        if (val === '' || (Number(val) >= 0 && Number(val) <= workingDays)) {
          setScoreForm(prev => ({
            ...prev,
            jumlah_hadir: val
          }));
        }
      }}
      inputProps={{
        min: 0,
        max: calculateWorkingDays(
          editDialog.data?.tanggal_masuk,
          editDialog.data?.tanggal_keluar
        ),
        step: 1
      }}
      error={
        Number(scoreForm.jumlah_hadir) > calculateWorkingDays(
          editDialog.data?.tanggal_masuk,
          editDialog.data?.tanggal_keluar
        )
      }
      helperText={
        Number(scoreForm.jumlah_hadir) > calculateWorkingDays(
          editDialog.data?.tanggal_masuk,
          editDialog.data?.tanggal_keluar
        )
          ? 'Jumlah kehadiran tidak boleh melebihi total hari kerja'
          : `Total hari kerja: ${calculateWorkingDays(
              editDialog.data?.tanggal_masuk,
              editDialog.data?.tanggal_keluar
            )} hari`
              }
            />
          </Grid>
          </Grid>
          </Box>
            </Grid>




            {/* Scores Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                Penilaian Kinerja
              </Typography>
            </Grid>
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
          <Button
            onClick={() => setEditDialog({ open: false, loading: false, data: null, error: null })}
            disabled={editDialog.loading}
          >
            Batal
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={editDialog.loading}
          >
            Simpan Perubahan
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>








      {/* Export Dialog */}
      <Dialog
        open={exportDialog.open}
        onClose={() => setExportDialog(prev => ({ ...prev, open: false }))}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Export Data</Typography>
            <IconButton
              onClick={() => setExportDialog(prev => ({ ...prev, open: false }))}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <RadioGroup
              value={exportDialog.exportType}
              onChange={(e) => setExportDialog(prev => ({
                ...prev,
                exportType: e.target.value
              }))}
            >
              <FormControlLabel
                value="all"
                control={<Radio />}
                label="Export Semua Data"
              />
              <FormControlLabel
                value="filtered"
                control={<Radio />}
                label="Export Berdasarkan Filter Tanggal"
              />
            </RadioGroup>




            {exportDialog.exportType === 'filtered' && (
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Tanggal Mulai"
                    value={exportDialog.dateRange.startDate}
                    onChange={(date) => setExportDialog(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, startDate: date }
                    }))}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                  <DatePicker
                    label="Tanggal Akhir"
                    value={exportDialog.dateRange.endDate}
                    onChange={(date) => setExportDialog(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, endDate: date }
                    }))}
                    slotProps={{ textField: { fullWidth: true } }}
                    minDate={exportDialog.dateRange.startDate}
                  />
                </LocalizationProvider>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setExportDialog(prev => ({ ...prev, open: false }))}
            disabled={exportDialog.loading}
          >
            Batal
          </Button>
          <LoadingButton
            onClick={handleExport}
            loading={exportDialog.loading}
            variant="contained"
            disabled={
              exportDialog.exportType === 'filtered' &&
              (!exportDialog.dateRange.startDate || !exportDialog.dateRange.endDate)
            }
          >
            Export
          </LoadingButton>
        </DialogActions>
      </Dialog>




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



export default RekapNilai;

