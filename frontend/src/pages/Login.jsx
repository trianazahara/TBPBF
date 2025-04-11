import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Loader2 } from 'lucide-react';
import axios from 'axios';


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


const AnimationStyles = () => (
    <style>
        {`
            @keyframes float {
                0% {
                    transform: translate(0, 0) rotate(0deg);
                }
                25% {
                    transform: translate(100px, -100px) rotate(90deg);
                }
                50% {
                    transform: translate(200px, 0) rotate(180deg);
                }
                75% {
                    transform: translate(100px, 100px) rotate(270deg);
                }
                100% {
                    transform: translate(0, 0) rotate(360deg);
                }
            }
           
            .animate-fadeIn {
                animation: fadeIn 0.5s ease-out;
            }
           
            .animate-scaleIn {
                animation: scaleIn 0.5s ease-out;
            }
           
            .animate-slideDown {
                animation: slideDown 0.5s ease-out;
            }
           
            .animate-slideUp {
                animation: slideUp 0.5s ease-out;
            }
           
            .animate-slideRight {
                animation: slideRight 0.5s ease-out;
            }
           
            .animate-slideLeft {
                animation: slideLeft 0.5s ease-out;
            }
           
            .animate-shake {
                animation: shake 0.5s ease-in-out;
            }
           
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
           
            @keyframes scaleIn {
                from { transform: scale(0.8); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
           
            @keyframes slideDown {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
           
            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
           
            @keyframes slideRight {
                from { transform: translateX(-20px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
           
            @keyframes slideLeft {
                from { transform: translateX(20px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
           
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-10px); }
                75% { transform: translateX(10px); }
            }
        `}
    </style>
);


const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleForgotPassword = async () => {
        if (!username) {
            setError('Masukkan username terlebih dahulu');
            return;
        }
        
        setIsLoading(true);
        try {
           
            const checkResponse = await axios.post('http://localhost:5000/api/auth/check-username', { 
                username 
            });

            if (checkResponse.data.exists) {
                const forgotResponse = await axios.post('http://localhost:5000/api/auth/forgot-password', { 
                    username 
                });

                navigate('/forgot-password', { 
                    state: { 
                        username,
                        maskedEmail: checkResponse.data.maskedEmail
                    } 
                });
            } else {
                setError('Username tidak ditemukan');
            }
        } catch (err) {
            console.error('Error:', err);
            setError(err.response?.data?.message || 'Username tidak ditemukan');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const success = await login(username, password);
            if (success) {
                navigate('/dashboard');
            } else {
                setError('Login gagal. Silakan coba lagi.');
            }
        } catch (err) {
            console.error('Error detail:', err);
            setError('Terjadi kesalahan saat login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <AnimationStyles />
            <div className="w-screen h-screen overflow-hidden">
                {/* Background image dengan overlay */}
                <div className="absolute inset-0">
                    <img
                        src="/images/background.jpg"
                        className="w-full h-full object-cover"
                        alt="background"
                    />
                   
                </div>
               
                {/* Floating Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Generate multiple floating elements with different positions and delays */}
                    <FloatingElement className="text-white top-1/4 left-1/4" animationDelay={0} />
                    <FloatingElement className="text-white top-1/3 left-1/2" animationDelay={2} />
                    <FloatingElement className="text-white top-2/3 left-1/3" animationDelay={4} />
                    <FloatingElement className="text-white top-1/2 left-3/4" animationDelay={6} />
                    <FloatingElement className="text-white top-3/4 left-1/4" animationDelay={8} />
                    <FloatingElement className="text-white top-1/4 left-2/3" animationDelay={10} />
                </div>
               
                {/* Container untuk card login */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {/* Card login dengan backdrop blur */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-8 shadow-lg w-96 animate-fadeIn">
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative w-24 h-24 mb-4 animate-scaleIn">
                                <img
                                    src="/images/logo.jpg"
                                    alt="Logo PANDU"
                                    className="w-full h-full animate-pulse-subtle"
                                />
                            </div>
                            <h2 className="text-2xl font-bold mb-1 animate-slideDown">PANDU</h2>
                            <p className="text-gray-600 text-sm animate-slideUp">Silahkan masuk ke akun anda</p>
                        </div>


                        {error && (
                            <div className="bg-red-100 text-red-700 p-3 rounded mb-4 animate-shake">
                                {error}
                            </div>
                        )}


                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Input username */}
                            <div className="relative group animate-slideRight">
                                <div className="absolute top-0 left-0 h-full flex items-center pl-3">
                                    <User
                                        className={`w-5 h-5 transition-colors duration-300
                                        ${focusedField === 'username' ? 'text-emerald-500' : 'text-gray-400'}`}
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    className={`w-full pl-10 pr-4 py-2 bg-blue-50 border border-gray-300 rounded
                                    transition-all duration-300 focus:outline-none focus:border-emerald-500 focus:ring-2
                                    focus:ring-emerald-500/20 group-hover:border-emerald-400`}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onFocus={() => setFocusedField('username')}
                                    onBlur={() => setFocusedField(null)}
                                    required
                                />
                            </div>
                           
                            {/* Input password */}
                            <div className="relative group animate-slideLeft">
                                <div className="absolute top-0 left-0 h-full flex items-center pl-3">
                                    <Lock
                                        className={`w-5 h-5 transition-colors duration-300
                                        ${focusedField === 'password' ? 'text-emerald-500' : 'text-gray-400'}`}
                                    />
                                </div>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className={`w-full pl-10 pr-4 py-2 bg-blue-50 border border-gray-300 rounded
                                    transition-all duration-300 focus:outline-none focus:border-emerald-500 focus:ring-2
                                    focus:ring-emerald-500/20 group-hover:border-emerald-400`}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    required
                                />
                            </div>
                            <div className="flex justify-end">
    <button
        type="button"
        onClick={handleForgotPassword}
        className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
    >
        Lupa Password?
    </button>
</div>

                            <button
    type="submit"
    disabled={isLoading}
    className="w-full bg-emerald-500 text-white py-2 rounded hover:bg-emerald-600
    transition-all duration-300 transform hover:scale-105 disabled:opacity-50
    disabled:cursor-not-allowed animate-slideUp relative overflow-hidden group mb-2"
>
    <span className="relative z-10 flex items-center justify-center">
        {isLoading ? (
            <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span>MEMPROSES...</span>
            </>
        ) : (
            <span>MASUK</span>
        )}
    </span>
    <div className="absolute inset-0 bg-white/20 transform -translate-x-full
        group-hover:translate-x-0 transition-transform duration-300" />
</button>

                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;

