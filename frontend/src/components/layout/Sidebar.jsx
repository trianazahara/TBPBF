import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext";
import {
    Home,
    History,
    People,
    Settings,
    LibraryBooks,
    KeyboardArrowDown,
    KeyboardArrowRight,
} from '@mui/icons-material';

export const Sidebar = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = useState({});
    const [hoveredItem, setHoveredItem] = useState(null);

    const toggleMenu = (path) => {
        setExpandedMenus(prev => ({
            ...prev,
            [path]: !prev[path]
        }));
    };

    const getMenuItems = () => {
        const items = [
            {
                path: '/dashboard',
                icon: <Home />,
                label: 'Dashboard'
            },
            {
                path: '/intern',
                icon: <LibraryBooks />,
                label: 'Data Magang',
                subItems: [
                    {
                        path: '/intern/management',
                        label: 'Manajemen Data'
                    },
                    {
                        path: '/intern/availabilityCheck',
                        label: 'Check Ketersediaan'
                    }
                ]
            },
            {
                path: '/history',
                icon: <History />,
                label: 'Riwayat',
                subItems: [
                    {
                        path: '/history/data',
                        label: 'Riwayat Data'
                    },
                    {
                        path: '/history/score',
                        label: 'Rekap Nilai'
                    }
                ]
            },
            {
                path: '/settings',
                icon: <Settings />,
                label: 'Pengaturan'
            }
        ];

        if (user?.role === 'superadmin') {
            items.splice(3, 0, {
                path: '/admin/management',
                icon: <People />,
                label: 'Manajemen Admin'
            });
        }

        return items;
    };

    const menuItems = getMenuItems();

    return (
        <div className="w-64 h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-green-600
            fixed left-0 top-0 shadow-xl animate-slideRight border-r border-r-slate-200/50
            backdrop-blur-sm flex flex-col">
            <div className="p-4 perspective shrink-0">
                <div className="flex items-center gap-3 hover:scale-105 transition-all duration-500
                    transform hover:translate-z-4 relative">
                    <div className="relative transform transition-all duration-500 hover:rotate-y-180">
                        <img
                            src="/images/logo.jpg"
                            alt="Pandu Logo"
                            className="w-12 h-12 shadow-lg animate-float"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-green-500/20 to-transparent
                            rounded-xl animate-pulse-glow" />
                    </div>
                    <div className="transform transition-all duration-500 hover:translate-x-2">
                        <h1 className="text-green-600 text-xl font-bold mb-1">PANDU</h1>
                        <div className="text-gray-700 text-sm">
                            Platform Magang
                            <br />
                            Dinas Pendidikan Sumatera Barat
                        </div>
                    </div>
                </div>
            </div>
            <nav className="mt-6 perspective flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-2 pb-6">
                    {menuItems.map((item) => (
                        <div key={item.path} className="mb-4 px-2">
                            {item.subItems ? (
                                <div className="group">
                                    <button
                                        onClick={() => toggleMenu(item.path)}
                                        onMouseEnter={() => setHoveredItem(item.path)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl
                                            transform transition-all duration-500 focus:outline-none
                                            hover:shadow-lg hover:shadow-green-500/10 relative
                                            ${hoveredItem === item.path ? 'animate-tilt-3d' : ''}
                                            bg-gradient-to-r hover:from-green-50 hover:to-emerald-50
                                            active:scale-95`}
                                    >
                                        <div className="flex items-center">
                                            <div className={`transform transition-all duration-500 p-2
                                                rounded-lg bg-gradient-to-br from-green-100 to-green-50
                                                ${hoveredItem === item.path ? 'rotate-12 scale-110 shadow-md' : ''}`}>
                                                {item.icon}
                                            </div>
                                            <span className="ml-3 font-medium">{item.label}</span>
                                        </div>
                                        <div className={`transform transition-all duration-500
                                            ${expandedMenus[item.path] ? 'rotate-180' : ''}`}>
                                            {expandedMenus[item.path] ? 
                                                <KeyboardArrowDown /> : 
                                                <KeyboardArrowRight />
                                            }
                                        </div>
                                    </button>
                                    <div 
                                        className={`ml-8 mt-2 space-y-2 transition-all duration-500 transform
                                            ${expandedMenus[item.path] 
                                                ? 'opacity-100 translate-y-0' 
                                                : 'opacity-0 -translate-y-4 hidden'}`}
                                    >
                                        {item.subItems.map((subItem, index) => (
                                            <Link
                                                key={subItem.path}
                                                to={subItem.path}
                                                style={{
                                                    animationDelay: `${index * 100}ms`,
                                                }}
                                                className={`block p-2 rounded-xl transform transition-all duration-500
                                                    hover:translate-x-2 relative animate-fadeIn
                                                    ${location.pathname === subItem.path
                                                        ? 'bg-gradient-to-r from-green-200 to-emerald-100 shadow-md scale-105'
                                                        : 'hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:shadow-md'}
                                                    active:scale-95`}
                                            >
                                                {subItem.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    to={item.path}
                                    onMouseEnter={() => setHoveredItem(item.path)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    className={`flex items-center p-3 rounded-xl transform transition-all duration-500
                                        hover:shadow-lg hover:shadow-green-500/10 focus:outline-none relative
                                        ${hoveredItem === item.path ? 'animate-tilt-3d' : ''}
                                        ${location.pathname === item.path 
                                            ? 'bg-gradient-to-r from-green-200 to-emerald-100 shadow-md scale-105' 
                                            : 'hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50'}
                                        active:scale-95`}
                                >
                                    <div className={`transform transition-all duration-500 p-2
                                        rounded-lg bg-gradient-to-br from-green-100 to-green-50
                                        ${hoveredItem === item.path ? 'rotate-12 scale-110 shadow-md' : ''}`}>
                                        {item.icon}
                                    </div>
                                    <span className="ml-3 font-medium">{item.label}</span>
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            </nav>
            {/* Copyright section */}
            <div className="p-4 mt-auto border-t border-slate-200/50">
                <div className="text-xs scale-90 text-gray-600 text-center">
                    <p className="font-medium mb-1">Developed by:</p>
                    <p>Dhiya Gustita Aqila, Triana Zahara Nurhaliza, Laura Iffa Razitta</p>
                    <p className="mt-1 font-medium">Sistem Informasi 22 UNAND</p>
                </div>
            </div>
            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default Sidebar;