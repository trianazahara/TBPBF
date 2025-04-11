import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Key, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';


// Animation styles component
const AnimationStyles = () => (
    <style>
        {`
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-20px); }
            }

            .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
            .animate-slideUp { animation: slideUp 0.5s ease-out; }
            .animate-float { animation: float 3s ease-in-out infinite; }
        `}
    </style>
);

// Floating Element Component
const FloatingElement = ({ className, animationDelay }) => (
    <div 
        className={`absolute pointer-events-none opacity-30 ${className}`}
        style={{
            animation: `float 20s infinite ${animationDelay}s linear`,
        }}
    >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
    </div>
);

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { username, maskedEmail } = location.state || {};

    useEffect(() => {
        if (!username || !maskedEmail) {
            navigate('/login');
            return;
        }
        setSuccessMessage(`Kode OTP telah dikirim ke ${maskedEmail}`);
    }, [username, maskedEmail, navigate]);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Password tidak cocok');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await axios.post('http://localhost:5000/api/auth/reset-password', {
                username,
                otp,
                newPassword
            });
            navigate('/login', { 
                state: { message: 'Password berhasil direset. Silakan login dengan password baru Anda.' }
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Terjadi kesalahan');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <AnimationStyles />
            <div className="w-screen h-screen overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
                <img
                    src="/images/background.jpg"
                    className="w-full h-full object-cover"
                    alt="background"
                />
            </div>

                {/* Floating Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <FloatingElement className="text-white top-1/4 left-1/4" animationDelay={0} />
                    <FloatingElement className="text-white top-1/3 left-1/2" animationDelay={2} />
                    <FloatingElement className="text-white top-2/3 left-1/3" animationDelay={4} />
                    <FloatingElement className="text-white top-1/2 left-3/4" animationDelay={6} />
                </div>

                {/* Main Content */}
                <div className="relative h-full flex items-center justify-center px-4">
                    <div className="w-full max-w-md animate-fadeIn">
                        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-2xl space-y-6">
                            {/* Logo and Header */}
                            <div className="flex flex-col items-center mb-6">
                            <div className="relative w-24 h-24 mb-4">
                            <img
                                src="/images/logo.jpg"
                                alt="Logo PANDU"
                                className="w-full h-full"
                            />
                        </div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {step === 1 ? 'Lupa Password' : 
                                     step === 2 ? 'Verifikasi OTP' : 
                                     'Reset Password'}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {step === 1 ? 'Masukkan email Anda untuk menerima kode OTP' :
                                     step === 2 ? 'Masukkan kode OTP yang telah dikirim ke email Anda' :
                                     'Masukkan password baru Anda'}
                                </p>
                            </div>

                            {/* Messages */}
                            {error && (
                                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded animate-slideUp">
                                    <div className="flex">
                                        <span className="flex-1">{error}</span>
                                    </div>
                                </div>
                            )}

                            {successMessage && (
                                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded animate-slideUp">
                                    <div className="flex items-center">
                                        <CheckCircle2 className="h-5 w-5 mr-2" />
                                        <span className="flex-1">{successMessage}</span>
                                    </div>
                                </div>
                            )}

                             {/* OTP Form */}
                             {step === 1 && (
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    setStep(2);
                                }} className="space-y-6 animate-slideUp">
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Key className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-10 pr-3 py-2 bg-white/50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                            placeholder="Masukkan kode OTP"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-2 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02]"
                                    >
                                        Verifikasi OTP
                                    </button>
                                </form>
                            )}

                            {step === 2 && (
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    setStep(3);
                                }} className="space-y-6 animate-slideUp">
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Key className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-10 pr-3 py-2 bg-white/50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                            placeholder="Masukkan kode OTP"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-2 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02]"
                                    >
                                        Verifikasi OTP
                                    </button>
                                </form>
                            )}

                            {step === 3 && (
                                <form onSubmit={handleResetPassword} className="space-y-6 animate-slideUp">
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Key className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                                            </div>
                                            <input
                                                type="password"
                                                required
                                                className="w-full pl-10 pr-3 py-2 bg-white/50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                                placeholder="Password baru"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                        </div>

                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Key className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                                            </div>
                                            <input
                                                type="password"
                                                required
                                                className="w-full pl-10 pr-3 py-2 bg-white/50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                                placeholder="Konfirmasi password baru"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex justify-center items-center py-2 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            'Reset Password'
                                        )}
                                    </button>
                                </form>
                            )}

                            {/* Back to Login Button */}
                            <div className="pt-4 text-center">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="inline-flex items-center text-sm text-gray-600 hover:text-emerald-600 transition-colors"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    Kembali ke halaman login
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ForgotPassword;