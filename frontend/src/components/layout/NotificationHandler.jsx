import React, { useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const NotificationHandler = ({ notifications, unreadCount }) => {
  const audioRef = useRef(new Audio());
  const lastCountRef = useRef(unreadCount);
  const soundEnabledRef = useRef(localStorage.getItem('notificationSound') !== 'disabled');
  const [isSoundEnabled, setIsSoundEnabled] = React.useState(soundEnabledRef.current);

  const playNotificationSound = (type) => {
    if (!soundEnabledRef.current) return;

    const lastPlayed = parseInt(localStorage.getItem('lastNotificationSound') || '0');
    const now = Date.now();
    
    if (now - lastPlayed < 2000) return;

    const soundMap = {
      important: '/sounds/important-notification.mp3',
      default: '/sounds/important-notification.mp3'
    };

    audioRef.current.pause();
    audioRef.current.currentTime = 0;

    const soundToPlay = type === 'important' ? soundMap.important : soundMap.default;
    audioRef.current.src = soundToPlay;
    audioRef.current.volume = 0.5;
    
    audioRef.current.play().catch(error => {
      console.log('Audio playback failed:', error);
    });

    localStorage.setItem('lastNotificationSound', now.toString());
  };

  useEffect(() => {
    if (unreadCount > lastCountRef.current && notifications[0]) {
      const latestNotification = notifications[0];
      
      const isImportant = latestNotification && (
        (latestNotification.judul.includes('Penilaian') && 
         (latestNotification.pesan.includes('menambahkan') || 
          latestNotification.pesan.includes('memperbarui'))) ||
        (latestNotification.judul.includes('Peserta Magang') && 
         (latestNotification.pesan.includes('menambah data peserta') || 
          latestNotification.pesan.includes('missing')))
      );

      playNotificationSound(isImportant ? 'important' : 'default');
    }

    lastCountRef.current = unreadCount;
  }, [unreadCount, notifications]);

  const toggleSound = () => {
    const newState = !soundEnabledRef.current;
    soundEnabledRef.current = newState;
    setIsSoundEnabled(newState);
    localStorage.setItem('notificationSound', newState ? 'enabled' : 'disabled');
  };

  return (
    <button
      onClick={toggleSound}
      className="p-2 rounded-full hover:bg-gray-100 focus:outline-none transition-colors"
      title={isSoundEnabled ? 'Matikan suara notifikasi' : 'Aktifkan suara notifikasi'}
    >
      {isSoundEnabled ? (
        <Volume2 className="w-5 h-5 text-gray-600" />
      ) : (
        <VolumeX className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );
};

export default NotificationHandler;