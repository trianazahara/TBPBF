import React, { useState, useEffect } from 'react';
import AvailabilityConfirmDialog from '../components/intern/AvailabilityConfirmDialog';
import {
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  InputAdornment,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Select,
  MenuItem,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar,
  Fab,
  Grid,
  Stack,
  FormHelperText,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  PersonOff as PersonOffIcon
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
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


const InternManagement = () => {
  // States
  const [userRole, setUserRole] = useState('');
  const [interns, setInterns] = useState([]);
  const [mentorList, setMentorList] = useState([]);
  const [selectedInterns, setSelectedInterns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availabilityDialog, setAvailabilityDialog] = useState({
    open: false,
    data: null,
    formValues: null
  });
  const [filters, setFilters] = useState({
    status: '',
    bidang: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    internId: null,
    loading: false,
    nama: ''
  });
  const [missingDialog, setMissingDialog] = useState({
    open: false,
    internId: null,
    loading: false,
    nama: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [bidangList, setBidangList] = useState([]);
  const [bidangLoading, setBidangLoading] = useState(true);
  const [bidangError, setBidangError] = useState(null);

  // State for detail and edit dialogs
  const [detailDialog, setDetailDialog] = useState({
    open: false,
    loading: false,
    data: null,
    error: null
  });

  const [editDialog, setEditDialog] = useState({
    open: false,
    loading: false,
    data: null,
    error: null
  });

  // New state for add dialog
  const [addDialog, setAddDialog] = useState({
    open: false,
    loading: false,
    error: null
  });

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      'not_yet': 'Belum Mulai',
      'aktif': 'Aktif',
      'almost': 'Hampir Selesai',
      'selesai': 'Selesai',
      'missing': 'Missing'
    };
    return labels[status?.toLowerCase()] || status;
  };
  
  const STATUS_MAPPING = {
    'not_yet': 'not_yet',      // untuk 'Belum Mulai'
    'aktif': 'aktif',          // untuk 'Aktif'
    'almost': 'almost',        // untuk 'Hampir Selesai'
    'selesai': 'selesai',      // untuk 'Selesai'
    'missing': 'missing'  
  };

  const getStatusValue = (status) => {
    if (!status) return '';
    const normalizedStatus = status.toLowerCase();
    return STATUS_MAPPING[normalizedStatus] || normalizedStatus;
  };

  const getStatusStyle = (status, mode = 'class') => {
    const normalizedStatus = getStatusValue(status);
   
    const styles = {
      'active': {
        bg: '#dcfce7', // Lighter green background
        color: '#15803d', // Darker green text
        border: '#15803d'
      },
      'missing': {
            bg: '#fee2e2',
            color: '#dc2626',
            border: '#dc2626'
        },
      'not_yet': {
        bg: '#f1f5f9', // Light slate background
        color: '#475569', // Slate text
        border: '#475569'
      },
      'completed': {
        bg: '#dbeafe', // Light blue background
        color: '#1e40af', // Darker blue text
        border: '#1e40af'
      },
      'almost': {
        bg: '#fef9c3', // Light yellow background
        color: '#854d0e', // Darker yellow text
        border: '#854d0e'
      },
      'belum_mulai': {
        bg: '#f1f5f9', // Light slate background
        color: '#475569', // Slate text
        border: '#475569'
      },
      'hampir_selesai': {
        bg: '#fef9c3', // Light yellow background
        color: '#854d0e', // Darker yellow text
        border: '#854d0e'
      }
    };
 
    const defaultStyle = styles['not_yet'];
 

    if (mode === 'class') {
      return `inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        status === 'missing'
            ? 'bg-red-100 text-red-800 border border-red-800' :
        normalizedStatus === 'active' || normalizedStatus === 'aktif'
          ? 'bg-green-100 text-green-800 border border-green-800' :
        normalizedStatus === 'not_yet' || normalizedStatus === 'belum_mulai'
          ? 'bg-slate-100 text-slate-600 border border-slate-600' :
        normalizedStatus === 'completed' || normalizedStatus === 'selesai'
          ? 'bg-blue-100 text-blue-800 border border-blue-800' :
        normalizedStatus === 'almost' || normalizedStatus === 'hampir_selesai'
          ? 'bg-yellow-100 text-yellow-800 border border-yellow-800' :
        'bg-slate-100 text-slate-600 border border-slate-600'
      }`;
    }
  
    return styles[normalizedStatus] || defaultStyle;
  };

  // Generate PDF function
  const generateReceipt = async () => {
    try {
      const response = await fetch('/api/intern/generate-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ internIds: selectedInterns })
      });

      if (!response.ok) {
        throw new Error('Failed to generate receipt');
      }

      // Get the PDF blob from the response
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tanda-terima-magang.pdf';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Reset selection
      setSelectedInterns([]);
      
      setSnackbar({
        open: true,
        message: 'Tanda terima berhasil di-generate',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error generating receipt:', error);
      setSnackbar({
        open: true,
        message: 'Gagal men-generate tanda terima',
        severity: 'error'
      });
    }
  };
 

//   const [mentors, setMentors] = useState([]);
// const [mentorsLoading, setMentorsLoading] = useState(true);
// const [mentorsError, setMentorsError] = useState(null);



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

// Modify mentor fetching to only run for superadmin
useEffect(() => {
  const fetchMentors = async () => {
    if (userRole !== 'superadmin') return; // Only fetch if superadmin
    
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
      setBidangError('Gagal mengambil data bidang');
    } finally {
      setBidangLoading(false);
    }
  };

  const fetchInterns = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('excludeStatus', ['missing', 'selesai'].join(','));
  
      if (filters.status) {
        if (!['missing', 'selesai'].includes(filters.status)) {
          queryParams.append('status', filters.status);
        }
      }
      if (filters.bidang) queryParams.append('bidang', filters.bidang);
      if (filters.search) {
        queryParams.append('search', filters.search);
        queryParams.append('search_fields', ['nama', 'nama_institusi'].join(','));  // Added this line
      }
  
      queryParams.append('page', pagination.page + 1);
      queryParams.append('limit', pagination.limit);
  
      const response = await fetch(`/api/intern?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to load data');
      }
  
      const data = await response.json();
      const filteredData = data.data.filter(intern =>
        !['missing', 'selesai'].includes(intern.status?.toLowerCase())
      );
  
      setInterns(filteredData);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
      }));
    } catch (error) {
      console.error('Error fetching interns:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkInternAvailability = async (date) => {
    try {
      const response = await fetch(`/api/intern/check-availability?date=${date}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to check availability');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error checking availability:', error);
      throw error;
    }
  };

  // Event handlers
  const handleAddSubmit = async (values, { setSubmitting, resetForm }) => {
  try {
    // Check availability first
    const availabilityData = await checkInternAvailability(values.tanggal_masuk);
    
    console.log('Availability Data:', availabilityData); // Debugging
    console.log('Total Available Slots:', availabilityData.availableSlots); // Debugging
    console.log('Total Occupied:', availabilityData.totalOccupied); // Debugging
    
    // Dialog should ONLY show if adding this intern would exceed 50 slots
    const noSlotsAvailable = availabilityData.availableSlots <= 0;
    
    if (wouldExceedLimit) {
      setAvailabilityDialog({
        open: true,
        data: availabilityData,
        formValues: values
      });
      return;
    }
    
    // If there's still room, submit directly
    await submitInternData(values);
    resetForm();
    setAddDialog({ open: false, loading: false, error: null });
    
  } catch (error) {
    setAddDialog(prev => ({
      ...prev,
      error: error.message
    }));
  } finally {
    setSubmitting(false);
  }
};

  const submitInternData = async (values) => {
    try {
      setAddDialog(prev => ({ ...prev, loading: true }));
      const token = localStorage.getItem('token');
  
      const response = await fetch('/api/intern/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Data peserta magang berhasil ditambahkan',
          severity: 'success'
        });
        setAddDialog({ open: false, loading: false, error: null });
        fetchInterns();
      } else {
        throw new Error(data.message || 'Terjadi kesalahan');
      }
    } catch (error) {
      throw error;
    } finally {
      setAddDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const handleMissingClick = (internId, nama) => {
    setMissingDialog({
      open: true,
      internId,
      loading: false,
      nama
    });
  };

  const handleFilter = (key, value) => {
    setFilters(prevFilters => {
      if (key === 'status') {
        // For status filter, use the direct value without mapping
        return {
          ...prevFilters,
          [key]: value
        };
      }
      return {
        ...prevFilters,
        [key]: value
      };
    });
  };
  
  const handleDeleteClick = (internId, nama) => {
    setDeleteDialog({ open: true, internId, nama });
  };


  const handleDeleteConfirm = async () => {
    if (!deleteDialog.internId) return;


    try {
      setDeleteDialog(prev => ({ ...prev, loading: true }));


      const response = await fetch(`/api/intern/${deleteDialog.internId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });


      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menghapus data');
      }


      setSnackbar({
        open: true,
        message: 'Data berhasil dihapus',
        severity: 'success'
      });
     
      fetchInterns();
    } catch (error) {
      console.error('Error deleting intern:', error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    } finally {
      setDeleteDialog({ open: false, internId: null, loading: false, nama: '' });
    }
  };


  const handleDetailClick = async (id) => {
    setDetailDialog(prev => ({ ...prev, open: true, loading: true }));
    try {
      const response = await fetch(`/api/intern/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });


      if (!response.ok) {
        throw new Error('Gagal memuat data');
      }


      const result = await response.json();
      setDetailDialog(prev => ({ ...prev, data: result.data, loading: false }));
    } catch (error) {
      setDetailDialog(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
    }
  };

const adjustDateForTimezone = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
    .toISOString()
    .split('T')[0];
};


  const handleEditClick = async (id) => {
    setEditDialog(prev => ({ ...prev, open: true, loading: true }));
    try {
      const response = await fetch(`/api/intern/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });


      if (!response.ok) {
        throw new Error('Gagal memuat data');
      }


      const result = await response.json();
      setEditDialog(prev => ({ ...prev, data: result.data, loading: false }));
    } catch (error) {
      setEditDialog(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
    }
  };


  const handleEditSubmit = async (values) => {
    try {
      setEditDialog(prev => ({ ...prev, loading: true }));
  
      const response = await fetch(`/api/intern/${editDialog.data.id_magang}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });
  
      const responseData = await response.json();
  
      if (!response.ok) {
        throw new Error(responseData.message || 'Gagal memperbarui data');
      }
  
      setSnackbar({
        open: true,
        message: 'Data berhasil diperbarui',
        severity: 'success'
      });
  
      setEditDialog({
        open: false,
        loading: false,
        data: null,
        error: null
      });
  
      await fetchInterns();
  
    } catch (error) {
      console.error('Error updating intern:', error);
      setEditDialog(prev => ({
        ...prev,
        error: error.message || 'Terjadi kesalahan saat memperbarui data',
        loading: false
      }));
  
      // Tampilkan error notification
      setSnackbar({
        open: true,
        message: error.message || 'Terjadi kesalahan saat memperbarui data',
        severity: 'error'
      });
    }
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };


  const handleLimitChange = (event) => {
    setPagination(prev => ({
      ...prev,
      limit: parseInt(event.target.value, 10),
      page: 0
    }));
  };


  // useEffect hooks
  useEffect(() => {
    fetchInterns();
  }, [pagination.page, pagination.limit, filters]);


  useEffect(() => {
    fetchBidangList();
    // fetchMentors();
  }, []);


  // Add Dialog Component
const AddDialog = () => (
    <Dialog
      open={addDialog.open}
      onClose={() => setAddDialog({ open: false, loading: false, error: null })}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Tambah Peserta Magang</Typography>
          <IconButton
            onClick={() => setAddDialog({ open: false, loading: false, error: null })}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>


      <DialogContent>
        {addDialog.error && (
          <Alert severity="error" sx={{ mb: 2 }}>{addDialog.error}</Alert>
        )}


        <Formik
          initialValues={{
            nama: '',
            jenis_peserta: '',
            nama_institusi: '',
            jenis_institusi: '',
            email: '',
            no_hp: '',
            bidang_id: '',
            tanggal_masuk: '',
            tanggal_keluar: '',
            nama_pembimbing: '',  
            telp_pembimbing: '',
            mentor_id: '',  
            detail_peserta: {
              nim: '',
              nisn: '',
              fakultas: '',
              jurusan: '',
              semester: '',
              kelas: ''
            }
          }}
          validationSchema={Yup.object({
            nama: Yup.string()
        .required('Nama wajib diisi')
        .min(3, 'Nama minimal 3 karakter'),
    jenis_peserta: Yup.string()
        .required('Jenis peserta wajib dipilih'),
    nama_institusi: Yup.string()
        .required('Nama institusi wajib diisi'),
    jenis_institusi: Yup.string()
        .required('Jenis institusi wajib dipilih'),
    email: Yup.string()
        .email('Format email tidak valid')
        .nullable(),
    no_hp: Yup.string()
        .nullable()
        .matches(/^[0-9]*$/, 'Nomor HP hanya boleh berisi angka')
        .min(10, 'Nomor HP minimal 10 digit')
        .max(15, 'Nomor HP maksimal 15 digit'),
    bidang_id: Yup.string()
         .nullable(),
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
    mentor_id: Yup.string().nullable(),
    detail_peserta: Yup.object().when('jenis_peserta', {
        is: 'mahasiswa',
        then: () => Yup.object({
            nim: Yup.string()
                .required('NIM wajib diisi'),
            fakultas: Yup.string()
                .nullable(),
            jurusan: Yup.string()
                .required('Jurusan wajib diisi'),
            semester: Yup.number()
                .nullable()
                .typeError('Semester harus berupa angka')
                .min(1, 'Minimal semester 1')
                .max(14, 'Maksimal semester 14')
        }),
        otherwise: () => Yup.object({
            nisn: Yup.string()
                .required('NISN wajib diisi'),
            jurusan: Yup.string()
                .required('Jurusan wajib diisi'),
            kelas: Yup.string()
                .nullable()
              })
            })
          })}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            try {
              // Cek availability terlebih dahulu
              const availabilityData = await checkInternAvailability(values.tanggal_masuk);
              
              // Jika tidak tersedia atau ada yang akan selesai, tampilkan dialog konfirmasi
              if (!availabilityData.available || availabilityData.leavingCount > 0) {
                setAvailabilityDialog({
                  open: true,
                  data: availabilityData,
                  formValues: values
                });
                setSubmitting(false);
                return;
              }
          
              // Jika available, langsung submit
              const success = await submitInternData(values);
              if (success) {
                resetForm();
              }
            } catch (error) {
              setAddDialog(prev => ({
                ...prev,
                error: error.message
              }));
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, isSubmitting }) => (
            <Form>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {/* Basic Information */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
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

                    required={true}
                  />
                </Grid>


                <Grid item xs={12} md={6}>
                <Field
                  name="jenis_peserta"
                  component={({ field, form }) => (
                    <FormControl fullWidth size="small">
                      <InputLabel>Jenis Peserta</InputLabel>
                      <Select 
                        {...field}
                        label="Jenis Peserta"
                        onChange={(e) => {
                          const newValue = e.target.value;
                          field.onChange(e);
                          // Set jenis_institusi berdasarkan jenis_peserta
                          form.setFieldValue(
                            'jenis_institusi',
                            newValue === 'mahasiswa' ? 'universitas' : 'sekolah'
                          );
                        }}
                      >
                        <MenuItem value="mahasiswa">Mahasiswa</MenuItem>
                        <MenuItem value="siswa">Siswa</MenuItem>
                      </Select>
                    </FormControl>
                    
                  )}
                required={true}
                    
                  
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


                {/* Institution Information */}
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

                    required={true}
                  />
                </Grid>


                <Grid item xs={12} md={6}>
                <Field
                  name="jenis_institusi"
                  component={({ field }) => (
                    <FormControl fullWidth size="small">
                      <InputLabel>Jenis Institusi</InputLabel>
                      <Select
                        {...field}
                        label="Jenis Institusi"
                        disabled
                      >
                        <MenuItem value="universitas">Universitas</MenuItem>
                        <MenuItem value="sekolah">Sekolah</MenuItem>
                      </Select>
                    </FormControl>
                  )}
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
                              {bidang.available_slots > 0 && ` (${bidang.available_slots} slot tersedia)`}
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

               


                {/* Internship Period */}
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

                    required={true}
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

                    required={true}
                  />
                </Grid>


                {/* Detail Peserta */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
                    Detail Peserta
                  </Typography>
                </Grid>


                {values.jenis_peserta === 'mahasiswa' ? (
                  <>
                    <Grid item xs={12} md={6}>
                      <Field
                        name="detail_peserta.nim"
                        component={FormTextField}
                        fullWidth
                        label="NIM"
                        size="small"

                        required={true}

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

                        required={true}

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
                  // Fields for high school students
                  <>
                  <Grid item xs={12} md={6}>
                    <Field
                      name="detail_peserta.nisn"
                      component={FormTextField}
                      fullWidth
                      label="NISN"

                      size="small"

                      required={true}

                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Field
                      name="detail_peserta.jurusan"
                      component={FormTextField}
                      fullWidth
                      label="Jurusan"
                      size="small"

                      required={true}

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
              
              {/* Informasi Pembimbing - Pindahkan keluar dari conditional rendering */}
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
                  onClick={() => setAddDialog({ open: false, loading: false, error: null })}
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
                  Simpan
                </LoadingButton>
              </Box>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );


  // Detail Dialog Component
  const DetailDialog = () => (
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
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <span className={getStatusStyle(detailDialog.data.status)}>
                  {getStatusLabel(detailDialog.data.status)}
                </span>
              </Box>
            </Grid>


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
              <Typography variant="subtitle2" color="text.secondary">Informasi Pembimbing</Typography>
              <Paper variant="outlined" sx={{ p: 2, mt: 1, height: '100%' }}>
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
                <Typography variant="subtitle2" color="text.secondary">Mentor</Typography>
                <Paper variant="outlined" sx={{ p: 2, mt: 1, height: '100%' }}>
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
    onClick={() => handleEditClick(detailDialog.data?.id_magang)}
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
  );

  // Helper function to check if data is incomplete
  const hasIncompleteData = (intern) => {
    // Fungsi untuk mengecek apakah sebuah nilai kosong
    const isEmpty = (value) => value === null || value === undefined || value === '';
    
    // Cek field-field opsional
    const hasIncompleteBasicData = 
      isEmpty(intern.email) || 
      isEmpty(intern.no_hp) ||
      isEmpty(intern.nama_pembimbing) ||
      isEmpty(intern.telp_pembimbing) ||
      isEmpty(intern.mentor_id) ||  // Tambah pengecekan mentor
      isEmpty(intern.id_bidang);    // Tambah pengecekan bidang
      
    return hasIncompleteBasicData;
  };

   // Edit Dialog Component
   const EditDialog = () => (
    <Dialog
      open={editDialog.open}
      onClose={() => setEditDialog({ open: false, loading: false, data: null, error: null })}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Edit Data Peserta Magang</Typography>
          <IconButton
            onClick={() => setEditDialog({ open: false, loading: false, data: null, error: null })}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
     
      <DialogContent>
        {editDialog.loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : editDialog.error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{editDialog.error}</Alert>
        ) : editDialog.data && (
          <Formik
            initialValues={{
              nama: editDialog.data.nama || '',
              email: editDialog.data.email || '',
              no_hp: editDialog.data.no_hp || '',
              nama_institusi: editDialog.data.nama_institusi || '',
              jenis_institusi: editDialog.data.jenis_institusi || '',
              bidang_id: editDialog.data.id_bidang || '',
              tanggal_masuk: adjustDateForTimezone(editDialog.data.tanggal_masuk),
              tanggal_keluar: adjustDateForTimezone(editDialog.data.tanggal_keluar),
              nama_pembimbing: editDialog.data.nama_pembimbing || '',
              telp_pembimbing: editDialog.data.telp_pembimbing || '',
              mentor_id: editDialog.data.mentor_id || '',
              // status: editDialog.data.status || 'not_yet'
              detail_peserta: {

              ...(editDialog.data.jenis_peserta === 'mahasiswa'
                ? {
                    nim: editDialog.data.detail_peserta?.nim || '',
                    fakultas: editDialog.data.detail_peserta?.fakultas || '',
                    jurusan: editDialog.data.detail_peserta?.jurusan || '',
                    semester: editDialog.data.detail_peserta?.semester || ''
                  }
                : {
                    nisn: editDialog.data.detail_peserta?.nisn || '',
                    jurusan: editDialog.data.detail_peserta?.jurusan || '',
                    kelas: editDialog.data.detail_peserta?.kelas || ''
                  }
              )
            }
          }}
          validationSchema={Yup.object({
            // Field Wajib
            nama: Yup.string()
              .required('Nama wajib diisi')
              .min(3, 'Nama minimal 3 karakter'),
            jenis_institusi: Yup.string()
              .required('Jenis institusi wajib dipilih'),
            nama_institusi: Yup.string()
              .required('Nama institusi wajib diisi'),
            bidang_id: Yup.string()
              .nullable(),
            tanggal_masuk: Yup.date()
              .required('Tanggal masuk wajib diisi'),
            tanggal_keluar: Yup.date()
              .required('Tanggal keluar wajib diisi')
              .min(
                Yup.ref('tanggal_masuk'),
                'Tanggal keluar harus setelah tanggal masuk'
              ),
            // status: Yup.string()
            //   .required('Status wajib dipilih'),
          
            // Field Opsional
            email: Yup.string()
              .email('Format email tidak valid')
              .nullable(),
            no_hp: Yup.string()
              .nullable()
              .matches(/^[0-9]*$/, 'Nomor HP hanya boleh berisi angka')
              .min(10, 'Nomor HP minimal 10 digit')
              .max(15, 'Nomor HP maksimal 15 digit'),
            nama_pembimbing: Yup.string()
              .nullable(),
            telp_pembimbing: Yup.string()
              .nullable()
              .matches(/^[0-9]*$/, 'Nomor telepon hanya boleh berisi angka')
              .min(10, 'Nomor telepon minimal 10 digit')
              .max(15, 'Nomor telepon maksimal 15 digit'),
            mentor_id: Yup.string()
              .nullable(),
          
            // Detail Peserta
            detail_peserta: Yup.object().shape(
              editDialog.data.jenis_peserta === 'mahasiswa'
                ? {
                    nim: Yup.string()
                      .required('NIM wajib diisi'),
                    fakultas: Yup.string()
                      .nullable(),
                    jurusan: Yup.string()
                      .required('Jurusan wajib diisi'),
                    semester: Yup.number()
                      .nullable()
                      .typeError('Semester harus berupa angka')
                      .min(1, 'Minimal semester 1')
                      .max(14, 'Maksimal semester 14')
                  }
                : {
                    nisn: Yup.string()
                      .required('NISN wajib diisi'),
                    jurusan: Yup.string()
                      .required('Jurusan wajib diisi'),
                    kelas: Yup.string()
                      .nullable()
                  }
            )
          })}
          onSubmit={handleEditSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {/* Status Magang - Ditambahkan di awal form */}
                {/* <Grid item xs={12}>
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
                </Grid> */}


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


                {/* <Grid item xs={12} md={6}>
                  <Field
                    name="mentor_id"
                    component={({ field, form }) => (
                      <FormControl fullWidth size="small">
                        <InputLabel>Mentor</InputLabel>
                        <Select
                          {...field}
                          label="Mentor"
                        >
                          <MenuItem value="">
                            <em>Tidak Ada Mentor</em>
                          </MenuItem>
                          {mentors.map(mentor => (
                            <MenuItem key={mentor.id_users} value={mentor.id_users}>
                              {mentor.nama} {mentor.nip ? `(${mentor.nip})` : ''}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid> */}


                {/* Detail Peserta */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
                    Detail Peserta
                  </Typography>
                </Grid>


                {editDialog.data.jenis_peserta === 'mahasiswa' ? (
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
                  onClick={() => setEditDialog({ open: false, loading: false, data: null, error: null })}
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
);

const handleSetMissing = async (internId, nama) => {
  try {
    const response = await fetch(`/api/intern/missing/${internId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Gagal mengubah status');
    }

    setSnackbar({
      open: true,
      message: `Status ${nama} berhasil diubah menjadi missing`,
      severity: 'success'
    });

    fetchInterns();
  } catch (error) {
    setSnackbar({
      open: true,
      message: error.message,
      severity: 'error'
    });
  }
};

const handleSelectIntern = (internId) => {
  setSelectedInterns(prev => {
    if (prev.includes(internId)) {
      return prev.filter(id => id !== internId);
    } else {
      return [...prev, internId];
    }
  });
};
 
  // Handle select all checkboxes
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedInterns(interns.map(intern => intern.id_magang));
    } else {
      setSelectedInterns([]);
    }
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
          Manajemen Data Peserta Magang
        </Typography>
        {userRole === 'superadmin' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialog({ open: true, loading: false, error: null })}
            sx={{
              bgcolor: 'white',
              color: '#26BBAC',
              '&:hover': { bgcolor: '#f5f5f5' },
            }}>
            TAMBAH PESERTA MAGANG
          </Button>
        )}
      </Box>


      {/* Search and Filter Section */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
        <input
          type="text"
          placeholder="Search nama/institusi"  // Changed from "Search nama/email"
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        </div>
        
        <div className="relative">
          <select
            value={filters.bidang}
            onChange={(e) => setFilters({...filters, bidang: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="">Ruang Penempatan</option>
            {bidangList.map(bidang => (
              <option key={bidang.id_bidang} value={bidang.id_bidang}>
                {bidang.nama_bidang}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="relative">
        <select
          value={filters.status}
          onChange={(e) => handleFilter('status', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
        >
           <option value="">Status</option>
  <option value="not_yet">Belum Mulai</option>
  <option value="aktif">Aktif</option>
  <option value="almost">Hampir Selesai</option>
        </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>



      {/* Table Section with Percentage Widths */}
      {/* <div className="bg-white rounded-lg shadow overflow-auto"> */}
        <div className="overflow-x-scroll" style={{ maxWidth: '950px' }}>
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="w-[5%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedInterns.length === interns.length && interns.length > 0}
                  />
                </th>
                <th scope="col" className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th scope="col" className="w-[20%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Institusi
                </th>
                <th scope="col" className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ruang Penempatan
                </th>
                <th scope="col" className="w-[12%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Masuk
                </th>
                <th scope="col" className="w-[12%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Keluar
                </th>
                <th scope="col" className="w-[11%] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {userRole === 'superadmin' && (
      <th scope="col" className="w-[15%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Mentor
      </th>
    )}
    <th scope="col" className="w-[10%] px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
      Action
    </th>
  </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : interns.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                interns.map((intern) => (
                  <tr key={intern.id_magang} className="hover:bg-gray-50">
                    <td className="px-3 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedInterns.includes(intern.id_magang)}
                        onChange={() => handleSelectIntern(intern.id_magang)}
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 truncate flex items-center gap-1">
                      {intern.nama}
                      {hasIncompleteData(intern) && (  // Ganti dari intern.has_incomplete_data
                        <Tooltip title="Data belum lengkap" placement="top">
                          <InfoIcon 
                            className="text-yellow-500 ml-1 h-4 w-4"
                            fontSize="small"
                          />
                        </Tooltip>
                      )}
                    </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 truncate">
                        {intern.nama_institusi}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 truncate">
                        {intern.nama_bidang}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(intern.tanggal_masuk)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(intern.tanggal_keluar)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span className={getStatusStyle(intern.status)}>
                        {getStatusLabel(intern.status)}
                      </span>
                    </td>
                    {userRole === 'superadmin' && (
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">
          {mentorList.find(m => m.id_users === intern.mentor_id)?.nama || '-'}
        </div>
      </td>
    )}
                    <td className="px-4 py-4 whitespace-nowrap text-center">
  <div className="flex justify-center space-x-1">
    <IconButton
      size="small"
      onClick={() => handleDetailClick(intern.id_magang)}
      sx={{ color: 'info.main' }}
    >
      <VisibilityIcon fontSize="small" />
    </IconButton>
    <IconButton
      size="small"
      onClick={() => handleEditClick(intern.id_magang)}
      sx={{ color: 'warning.main' }}
    >
      <EditIcon fontSize="small" />
    </IconButton>
    {intern.status !== 'missing' && (  // Only show for non-missing interns
      <Tooltip title="Set as Missing">
        <IconButton
          size="small"
          onClick={() => handleMissingClick(intern.id_magang, intern.nama)}
          sx={{ 
            color: 'grey.500',
            '&:hover': {
              color: 'error.main'
            }
          }}
        >
          <PersonOffIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    )}
    <IconButton
      size="small"
      onClick={() => handleDeleteClick(intern.id_magang, intern.nama)}
      sx={{ color: 'error.main' }}
    >
      <DeleteIcon fontSize="small" />
    </IconButton>
  </div>
</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      {/* </div> */}


      {/* Pagination */}
      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-b-lg">
        <div className="flex items-center gap-2">
          <select
            value={pagination.limit}
            onChange={handleLimitChange}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            {[5, 10, 25, 50].map(size => (
              <option key={size} value={size}>{size} items</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(null, Math.max(0, pagination.page - 1))}
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
            onClick={() => handlePageChange(null, pagination.page + 1)}
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

      <Box sx={{ mt: 2, mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <LoadingButton
          variant="contained"
          color='#26BBAC'
          disabled={selectedInterns.length === 0}
          onClick={generateReceipt}
        >
          Generate Tanda Terima
        </LoadingButton>
      </Box>

      {/* Dialogs */}
      <AddDialog />
      <DetailDialog />
      <EditDialog />


      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, internId: null, loading: false, nama: '' })}
      >
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah Anda yakin ingin menghapus data magang "{deleteDialog.nama}"?
            Tindakan ini tidak dapat dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, internId: null, loading: false, nama: '' })}
            disabled={deleteDialog.loading}
          >
            Batal
          </Button>
          <LoadingButton
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            loading={deleteDialog.loading}
          >
            Hapus
          </LoadingButton>
        </DialogActions>
      </Dialog>


      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    
    
    {/* Add AvailabilityConfirmDialog here, right before the final closing Box tag */}
    <AvailabilityConfirmDialog 
      open={availabilityDialog.open}
      onClose={() => setAvailabilityDialog({ open: false, data: null, formValues: null })}
      onConfirm={async () => {
        try {
          await submitInternData(availabilityDialog.formValues);
          setAvailabilityDialog({ open: false, data: null, formValues: null });
          setAddDialog({ open: false, loading: false, error: null });
        } catch (error) {
          setAddDialog(prev => ({
            ...prev,
            error: error.message
          }));
        }
      }}
      availabilityData={availabilityDialog.data}
      isSubmitting={addDialog.loading}
    />

    {/* Missing Confirmation Dialog */}
    <Dialog
      open={missingDialog.open}
      onClose={() => setMissingDialog({ open: false, internId: null, loading: false, nama: '' })}
    >
      <DialogTitle>Konfirmasi Status Missing</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Apakah Anda yakin ingin mengubah status "{missingDialog.nama}" menjadi missing?
          Tindakan ini akan menandai peserta magang sebagai tidak aktif/menghilang.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setMissingDialog({ open: false, internId: null, loading: false, nama: '' })}
          disabled={missingDialog.loading}
        >
          Batal
        </Button>
        <LoadingButton
          onClick={() => {
            handleSetMissing(missingDialog.internId, missingDialog.nama);
            setMissingDialog({ open: false, internId: null, loading: false, nama: '' });
          }}
          color="error"
          variant="contained"
          loading={missingDialog.loading}
        >
          Set Missing
        </LoadingButton>
      </DialogActions>
    </Dialog>
  </Box>  
  );
};


export default InternManagement;

