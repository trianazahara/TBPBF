import React, { useEffect, useState, useRef } from 'react';
import { Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationHandler from './NotificationHandler';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({ username: '', role: '', profile_picture: '' });
  
  const navigate = useNavigate();
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch user profile');
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications?page=1&limit=5', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications(data.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications/unread-count', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch unread count');
      const data = await response.json();
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      setNotifications(prevNotifications =>
        prevNotifications.map(notif => ({ ...notif, dibaca: 1 }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-0 right-0 left-64 bg-white border-b z-10">
      <div className="flex justify-end items-center p-1 mr-4">
        <div className="flex items-center gap-3">
        <NotificationHandler 
          notifications={notifications}
          unreadCount={unreadCount}
        />
          <div className="relative" ref={notificationRef}>
            <button
  onClick={async () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      await fetchNotifications();
      await markAllAsRead();
    }
  }}
  className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none"
>
  <Bell className="w-6 h-6" />
  {unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {unreadCount}
    </span>
  )}
</button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">Notifikasi</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Tidak ada notifikasi
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id_notifikasi}
                        onClick={() => markAsRead(notification.id_notifikasi)}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                          !notification.dibaca ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="font-semibold">{notification.judul}</div>
                        <div className="text-sm text-gray-600">
                          {notification.pesan}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(notification.created_at).toLocaleString('id-ID')}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-2 text-center border-t border-gray-200">
                    <button
                      onClick={() => navigate('/notifications')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Lihat Semua Notifikasi
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="text-right">
                <p className="text-gray-700">{user.nama}</p>
                <p className="text-gray-500 text-sm">{user.role}</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <img
                  src={user.profile_picture || 'images/default-avatar.jpg'}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <svg
                  className={`w-4 h-4 text-gray-400 transform ${
                    isProfileOpen ? 'rotate-180' : ''
                  } transition-transform duration-200`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsProfileOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;