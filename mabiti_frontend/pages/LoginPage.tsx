import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LiquidGlass } from '../components/LiquidGlass';
import { DottedSurface } from '../components/DottedSurface';
import { useAuth } from '../services/AuthContext';
import { useTheme } from '../services/ThemeContext';

export const LoginPage: React.FC = () => {
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (isRegisterMode) {
            // Registration logic
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                return;
            }
            setIsLoggingIn(true);
            try {
                const result = await register(username, email, password);
                setIsLoggingIn(false);
                if (result.success) {
                    setError('Registration successful! Please login.');
                    setIsRegisterMode(false);
                    // Clear fields
                    setUsername('');
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                } else {
                    setError(result.message);
                }
            } catch (err) {
                setIsLoggingIn(false);
                setError('Registration failed. Please try again.');
            }
        } else {
            // Login logic
            setIsLoggingIn(true);
            try {
                const success = await login(username, password);
                if (success) {
                    navigate('/home');
                } else {
                    setIsLoggingIn(false);
                    setError('Invalid credentials. Please try again.');
                }
            } catch (err) {
                setIsLoggingIn(false);
                setError('Login failed. Please check your connection.');
            }
        }
    };

    const toggleMode = () => {
        setIsRegisterMode(!isRegisterMode);
        setError('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="relative z-10 flex flex-col min-h-screen bg-zinc-50 dark:bg-black/90 transition-colors duration-500 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl animate-float-delayed"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
            </div>

            {/* Dotted Surface Background */}
            <DottedSurface className="opacity-40" animated={true} />

            {/* Theme Toggle */}
            <div className="absolute top-8 right-8 z-20">
                <button
                    onClick={toggleTheme}
                    className="size-12 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white bg-white/90 dark:bg-black/60 border border-zinc-200 dark:border-white/10 backdrop-blur-2xl hover:bg-white dark:hover:bg-black/80 transition-all shadow-xl hover:scale-110 hover:rotate-180 duration-500"
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    <span className="material-symbols-outlined text-[28px]">
                        {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                    </span>
                </button>
            </div>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6 relative z-10">
                <div className="w-full max-w-md perspective-1000">
                    {/* Flip Card Container */}
                    <div
                        className={`relative grid grid-cols-1 grid-rows-1 transition-all duration-700 transform-style-3d ${isRegisterMode ? 'rotate-y-180' : ''
                            }`}
                        style={{
                            transformStyle: 'preserve-3d',
                            transform: isRegisterMode ? 'rotateY(180deg)' : 'rotateY(0deg)'
                        }}
                    >
                        {/* Login Side */}
                        <div
                            className={`backface-hidden transition-all duration-300 col-start-1 row-start-1 ${!isRegisterMode ? 'z-10 pointer-events-auto' : 'z-0 pointer-events-none'}`}
                            style={{
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden'
                            }}
                        >
                            <div className="relative rounded-3xl p-10">

                                <div className="relative z-10">
                                    {/* Logo with Animation */}
                                    <div className="flex flex-col items-center mb-8">
                                        <div className="size-20 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-600 shrink-0 shadow-2xl shadow-blue-500/30 mb-3 hover:scale-110 hover:rotate-6 transition-all duration-300">
                                            <img src="/Images/logow.png" alt="Mabiti Logo" className="w-14 h-14 object-contain" />
                                        </div>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Sign in to continue to Mabiti</p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        {/* Username Input with Icon */}
                                        <div className="relative group">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-zinc-400 dark:text-zinc-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors text-[20px]">
                                                person
                                            </span>
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white/80 dark:bg-white/5 border-2 border-zinc-200/50 dark:border-white/10 text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-white/10 focus:shadow-lg focus:shadow-blue-500/10 transition-all backdrop-blur-xl hover:border-blue-400 dark:hover:border-blue-500"
                                                placeholder="Username"
                                                required
                                                disabled={isLoggingIn}
                                            />
                                        </div>

                                        {/* Password Input with Icon */}
                                        <div className="relative group">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-zinc-400 dark:text-zinc-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors text-[20px]">
                                                lock
                                            </span>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white/80 dark:bg-white/5 border-2 border-zinc-200/50 dark:border-white/10 text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-white/10 focus:shadow-lg focus:shadow-blue-500/10 transition-all backdrop-blur-xl hover:border-blue-400 dark:hover:border-blue-500"
                                                placeholder="Password"
                                                required
                                                disabled={isLoggingIn}
                                            />
                                        </div>

                                        {/* Error Message */}
                                        {error && !isRegisterMode && (
                                            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border-2 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm text-center font-medium backdrop-blur-xl animate-shake">
                                                {error}
                                            </div>
                                        )}

                                        {/* Login Button */}
                                        <button
                                            type="submit"
                                            disabled={isLoggingIn}
                                            className={`w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-600 text-white font-bold text-lg shadow-xl shadow-blue-500/30 transition-all duration-300 ${isLoggingIn
                                                ? 'cursor-not-allowed opacity-60'
                                                : 'hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/40 active:scale-95'
                                                }`}
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                {isLoggingIn ? (
                                                    <>
                                                        <span className="animate-spin material-symbols-outlined text-[20px]">refresh</span>
                                                        Logging in...
                                                    </>
                                                ) : (
                                                    <>
                                                        Sign In
                                                        <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                                    </>
                                                )}
                                            </span>
                                        </button>
                                    </form>

                                    {/* Toggle to Register */}
                                    <div className="mt-8 text-center">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                            Don't have an account?{' '}
                                            <button
                                                onClick={toggleMode}
                                                className="font-bold text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                            >
                                                Create
                                            </button>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Register Side */}
                        <div
                            className={`relative backface-hidden transition-all duration-300 col-start-1 row-start-1 ${isRegisterMode ? 'z-10 pointer-events-auto' : 'z-0 pointer-events-none'}`}
                            style={{
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)'
                            }}
                        >
                            <div className="relative rounded-3xl p-10 bg-white/70 dark:bg-black/60 border border-white/20 dark:border-white/10 shadow-2xl backdrop-blur-xl hover:shadow-purple-500/20 transition-all duration-500">
                                {/* Animated border gradient */}
                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/20 via-transparent to-blue-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none"></div>

                                <div className="relative z-10">
                                    {/* Logo */}
                                    <div className="flex flex-col items-center mb-8">
                                        <div className="size-20 flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-purple-500 dark:from-purple-500 dark:to-purple-600 shrink-0 shadow-2xl shadow-purple-500/30 mb-3 hover:scale-110 hover:rotate-6 transition-all duration-300">
                                            <img src="/Images/logow.png" alt="Mabiti Logo" className="w-14 h-14 object-contain" />
                                        </div>
                                        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-purple-400 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent">
                                            Join Mabiti
                                        </h1>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Create your account today</p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        {/* Username Input */}
                                        <div className="relative group">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-zinc-400 dark:text-zinc-500 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors text-[20px]">
                                                person
                                            </span>
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white/80 dark:bg-white/5 border-2 border-zinc-200/50 dark:border-white/10 text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-purple-600 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-white/10 focus:shadow-lg focus:shadow-purple-500/10 transition-all backdrop-blur-xl hover:border-purple-400 dark:hover:border-purple-500"
                                                placeholder="Username"
                                                required
                                                disabled={isLoggingIn}
                                            />
                                        </div>

                                        {/* Email Input */}
                                        <div className="relative group">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-zinc-400 dark:text-zinc-500 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors text-[20px]">
                                                email
                                            </span>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white/80 dark:bg-white/5 border-2 border-zinc-200/50 dark:border-white/10 text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-purple-600 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-white/10 focus:shadow-lg focus:shadow-purple-500/10 transition-all backdrop-blur-xl hover:border-purple-400 dark:hover:border-purple-500"
                                                placeholder="Email"
                                                required
                                                disabled={isLoggingIn}
                                            />
                                        </div>

                                        {/* Password Input */}
                                        <div className="relative group">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-zinc-400 dark:text-zinc-500 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors text-[20px]">
                                                lock
                                            </span>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white/80 dark:bg-white/5 border-2 border-zinc-200/50 dark:border-white/10 text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-purple-600 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-white/10 focus:shadow-lg focus:shadow-purple-500/10 transition-all backdrop-blur-xl hover:border-purple-400 dark:hover:border-purple-500"
                                                placeholder="Password"
                                                required
                                                disabled={isLoggingIn}
                                            />
                                        </div>

                                        {/* Confirm Password Input */}
                                        <div className="relative group">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-zinc-400 dark:text-zinc-500 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors text-[20px]">
                                                lock_reset
                                            </span>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full pl-12 pr-5 py-4 rounded-2xl bg-white/80 dark:bg-white/5 border-2 border-zinc-200/50 dark:border-white/10 text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-purple-600 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-white/10 focus:shadow-lg focus:shadow-purple-500/10 transition-all backdrop-blur-xl hover:border-purple-400 dark:hover:border-purple-500"
                                                placeholder="Confirm Password"
                                                required
                                                disabled={isLoggingIn}
                                            />
                                        </div>

                                        {/* Error Message */}
                                        {error && isRegisterMode && error !== 'Registration successful! Please login.' && (
                                            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border-2 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm text-center font-medium backdrop-blur-xl animate-shake">
                                                {error}
                                            </div>
                                        )}

                                        {/* Register Button */}
                                        <button
                                            type="submit"
                                            disabled={isLoggingIn}
                                            className={`w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-500 dark:from-purple-500 dark:to-purple-600 text-white font-bold text-lg shadow-xl shadow-purple-500/30 transition-all duration-300 ${isLoggingIn
                                                ? 'cursor-not-allowed opacity-60'
                                                : 'hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/40 active:scale-95'
                                                }`}
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                {isLoggingIn ? (
                                                    <>
                                                        <span className="animate-spin material-symbols-outlined text-[20px]">refresh</span>
                                                        Creating Account...
                                                    </>
                                                ) : (
                                                    <>
                                                        Create Account
                                                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                                    </>
                                                )}
                                            </span>
                                        </button>
                                    </form>

                                    {/* Toggle to Login */}
                                    <div className="mt-8 text-center">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                            Already have an account?{' '}
                                            <button
                                                onClick={toggleMode}
                                                className="font-bold text-purple-600 dark:text-purple-400 hover:underline hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                                            >
                                                Sign In
                                            </button>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Add Custom Animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    25% { transform: translate(10px, -10px) rotate(3deg); }
                    50% { transform: translate(-5px, -20px) rotate(-3deg); }
                    75% { transform: translate(-10px, -5px) rotate(2deg); }
                }
                
                @keyframes float-delayed {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    25% { transform: translate(-15px, 10px) rotate(-2deg); }
                    50% { transform: translate(10px, 15px) rotate(2deg); }
                    75% { transform: translate(5px, -10px) rotate(-3deg); }
                }
                
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
                    50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.1); }
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                
                .animate-float {
                    animation: float 8s ease-in-out infinite;
                }
                
                .animate-float-delayed {
                    animation: float-delayed 10s ease-in-out infinite;
                }
                
                .animate-pulse-slow {
                    animation: pulse-slow 6s ease-in-out infinite;
                }
                
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
                
                .perspective-1000 {
                    perspective: 1000px;
                }
                
                .transform-style-3d {
                    transform-style: preserve-3d;
                }
                
                .backface-hidden {
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                }
                
                .rotate-y-180 {
                    transform: rotateY(180deg);
                }
            `}</style>
        </div>
    );
};
