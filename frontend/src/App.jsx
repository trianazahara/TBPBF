import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import AddInternPage from './pages/intern/add';



import {
    Dashboard,
    InternManagement,
    AvailabilityCheck,
} from './pages';

import { Sidebar } from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Login from './pages/Login'; 
import ForgotPassword from './pages/ForgotPassword';


const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});


const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div>Loading...</div>;
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};


const DashboardLayout = ({ children }) => {
    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            {/* Sidebar */}
            <Sidebar className="fixed left-0 h-full w-64" />
            
            {/* Main Content */}
            <div className="flex-1 pl-64">
                {/* Fixed Header */}
                <Header className="fixed top-0 right-0 left-64 z-10" />
                
                {/* Scrollable Content Area */}
                <main className="h-full pt-16 overflow-auto">
                    <div className="px-8 py-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

const App = () => {
    return (
        <Router>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <AuthProvider>
                    <Routes>
                        {/* Rute publik */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />

                         <Route path="/intern/add" element={
                            <ProtectedRoute>
                                <DashboardLayout>
                                    <AddInternPage />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />

                        {/* Rute yang dilindungi */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <DashboardLayout>
                                    <Dashboard />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />

                        <Route path="/intern/management" element={
                            <ProtectedRoute>
                                <DashboardLayout>
                                    <InternManagement />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />

                        <Route path="/intern/availabilityCheck" element={
                            <ProtectedRoute>
                                <DashboardLayout>
                                    <AvailabilityCheck />
                                </DashboardLayout>
                            </ProtectedRoute>
                        } />

                    </Routes>
                </AuthProvider>
            </ThemeProvider>
        </Router>
    );
};

export default App;