import React from 'react';
import AvailabilityCheck from '../components/intern/AvailabilityCheck';
import {
  Typography,
  Box
} from '@mui/material';

const AvailabilityCheckPage = () => {

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
          Cek Ketersediaan Posisi Anak Magang
        </Typography>
      </Box>
      <AvailabilityCheck />
</Box>
  );
};

export default AvailabilityCheckPage;