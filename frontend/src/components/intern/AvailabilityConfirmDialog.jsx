import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';

const AvailabilityConfirmDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  availabilityData,
  isSubmitting 
}) => {
  if (!availabilityData) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogTitle>Konfirmasi Penambahan Peserta Magang</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Peringatan Kapasitas:
            </Typography>
            <Typography variant="body2">
              {availabilityData.message}
            </Typography>
          </Alert>

          {availabilityData.leavingInterns && availabilityData.leavingInterns.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Peserta yang akan selesai dalam waktu dekat:
              </Typography>
              {availabilityData.leavingInterns.map((intern, index) => (
                <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                  • {intern.nama} ({intern.nama_bidang}) - Selesai: {new Date(intern.tanggal_keluar).toLocaleDateString('id-ID')}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
        <Typography>
          Apakah Anda tetap ingin melanjutkan penambahan peserta magang?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose}
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
          onClick={onConfirm}
          loading={isSubmitting}
          variant="contained"
          sx={{
            bgcolor: '#2E7D32',
            '&:hover': {
              bgcolor: '#1B5E20'
            }
          }}
        >
          Ya, Lanjutkan
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default AvailabilityConfirmDialog;