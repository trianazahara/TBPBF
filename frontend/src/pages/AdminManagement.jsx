import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
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
  TextField,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';

const AdminManagement = () => {
    const [admins, setAdmins] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [bidangList, setBidangList] = useState([]);
    const [bidangLoading, setBidangLoading] = useState(false);
    const [bidangError, setBidangError] = useState(null);
    const [formData, setFormData] = useState({
      username: '',
      password: '',
      email: '',
      nama: '',
      nip: '',
      id_bidang: '',
      role: 'admin'
    });
    const [snackbar, setSnackbar] = useState({
      open: false,
      message: '',
      severity: 'success'
    });
 
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
          throw new Error('Gagal mengambil data bidang');
        }
 
        const result = await response.json();
        if (result.status === 'success') {
          setBidangList(result.data);
        } else {
          throw new Error(result.message || 'Gagal mengambil data bidang');
        }
      } catch (error) {
        console.error('Error fetching bidang:', error);
        setBidangError('Gagal mengambil data bidang');
      } finally {
        setBidangLoading(false);
      }
    };

    const fetchAdmins = async () => {
      try {
        const response = await axios.get('/api/admin', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setAdmins(response.data);
      } catch (error) {
        showSnackbar('Gagal mengambil data admin', 'error');
      }
    };
 
    useEffect(() => {
      fetchAdmins();
      fetchBidangList();
    }, []);
 
    const handleOpenDialog = (admin = null) => {
      if (admin) {
        setSelectedAdmin(admin);
        setFormData({
          username: admin.username,
          email: admin.email,
          nama: admin.nama,
          nip: admin.nip,
          id_bidang: admin.id_bidang,
          password: '',
          role: admin.role
        });
      } else {
        setSelectedAdmin(null);
        setFormData({
          username: '',
          password: '',
          email: '',
          nama: '',
          nip: '',
          id_bidang: '',
          role: 'admin'
        });
      }
      setOpenDialog(true);
    };
 
    const showSnackbar = (message, severity = 'success') => {
      setSnackbar({ open: true, message, severity });
    };
 
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (selectedAdmin) {
          await axios.patch(`/api/admin/${selectedAdmin.id_users}`, formData, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          showSnackbar('Admin berhasil diperbarui');
        } else {
          await axios.post('/api/admin', formData, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          showSnackbar('Admin berhasil ditambahkan');
        }
        setOpenDialog(false);
        fetchAdmins();
      } catch (error) {
        showSnackbar(error.response?.data?.message || 'Terjadi kesalahan', 'error');
      }
    };
 
    const handleDelete = async (id_users) => {
      if (window.confirm('Apakah Anda yakin ingin menghapus admin ini?')) {
        try {
          const response = await axios.delete(`/api/admin/${id_users}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
   
          if (response.status === 200) {
            showSnackbar('Admin berhasil dihapus');
            fetchAdmins();
          }
        } catch (error) {
          console.error('Delete error:', error);
          showSnackbar(
            error.response?.data?.message || 'Gagal menghapus admin',
            'error'
          );
        }
      }
    };

    React.useEffect(() => {
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
      
      return () => {
        document.head.removeChild(style);
      };
    }, []);

    return (
        <Box sx={{ width: '100%', minWidth: 0 }}>
          {/* Header Section */}
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
              Manajemen Admin
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                bgcolor: 'white',
                color: '#26BBAC',
                '&:hover': { bgcolor: '#f5f5f5' },
              }}>
              TAMBAH ADMIN
            </Button>
          </Box>

          <TableContainer
            component={Paper}
            sx={{
              width: '100%',
              minWidth: 0,
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: '600' }}>Nama</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>NIP</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Username</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Bidang</TableCell>
                  <TableCell sx={{ fontWeight: '600' }}>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow
                    key={admin.id_users}
                    sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}
                  >
                    <TableCell>{admin.nama}</TableCell>
                    <TableCell>{admin.nip || '-'}</TableCell>
                    <TableCell>{admin.username}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.nama_bidang || '-'}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleOpenDialog(admin)}
                        sx={{ color: '#2196F3', mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(admin.id_users)}
                        sx={{ color: '#f44336' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Form Dialog */}
          <Dialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              {selectedAdmin ? 'Edit Admin' : 'Tambah Admin Baru'}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
              <DialogContent sx={{ py: 3 }}>
                <TextField
                  fullWidth
                  label="Nama Lengkap"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="NIP"
                  value={formData.nip}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setFormData({ ...formData, nip: value });
                  }}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  margin="normal"
                  required
                />
                <TextField
                  select
                  fullWidth
                  label="Bidang"
                  value={formData.id_bidang}
                  onChange={(e) => setFormData({ ...formData, id_bidang: e.target.value })}
                  margin="normal"
                  required
                >
                  {bidangList.map((bidang) => (
                    <MenuItem key={bidang.id_bidang} value={bidang.id_bidang}>
                      {bidang.nama_bidang}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  margin="normal"
                  required={!selectedAdmin}
                  helperText={selectedAdmin ? "Kosongkan jika tidak ingin mengubah password" : ""}
                />
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button
                  onClick={() => setOpenDialog(false)}
                  sx={{
                    color: '#9e9e9e',
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    px: 3,
                    borderRadius: 1,
                    boxShadow: 'none'
                  }}
                >
                  {selectedAdmin ? 'Perbarui' : 'Tambah'}
                </Button>
              </DialogActions>
            </form>
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
              sx={{
                width: '100%',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                borderRadius: 1
              }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
    );
};

export default AdminManagement;