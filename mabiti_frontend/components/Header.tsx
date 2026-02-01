import React, { useState, memo } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LiquidGlass } from './LiquidGlass';
import { useTheme } from '../services/ThemeContext';
import { useAuth } from '../services/AuthContext';

export const Header: React.FC = memo(() => {
    const { theme, toggleTheme } = useTheme();
    const { isAuthenticated, user, logout } = useAuth();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const navLinks = [
        { label: 'Home', path: '/home' },
        { label: 'Buy', path: '/buy' },
        { label: 'Rent', path: '/rent' },
        { label: 'Sell', path: '/sell' }
    ];

    return (
        <header className="sticky top-4 z-50 px-4 md:px-10 flex items-center justify-between pointer-events-none h-14">
            {/* Logos */}
            <Link
                to="/home"
                className="pointer-events-auto relative z-20 group"
            >
                <LiquidGlass variant="nav" className="px-[10px] py-[10px] group-hover:bg-white/10 transition-colors">
                    <div className="size-8 flex items-center justify-center rounded-full bg-blue-500 shrink-0">
                        <img src="/Images/logow.png" alt="Mabiti Logo" className="w-5 h-5 object-contain" />
                    </div>
                    <h2 className="text-zinc-900 dark:text-white text-lg font-bold ml-2 mr-2 tracking-tight">Mabiti</h2>
                </LiquidGlass>
            </Link>

            {/* Center Floating Nav */}
            <div className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <LiquidGlass variant="nav" className={`transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${isSearchOpen ? 'w-[500px]' : 'w-[400px]'}`}>
                    <div className="relative flex items-center w-full overflow-hidden">

                        {/* Nav Links Layer */}
                        <div className={`flex items-center justify-center w-full transition-all duration-500 absolute inset-0 ${isSearchOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100 z-10'}`}>
                            <nav className="flex items-center">
                                {navLinks.map(link => (
                                    <NavLink
                                        key={link.label}
                                        to={link.path}
                                        className={({ isActive }) => `text-sm font-medium px-4 py-2 rounded-full transition-colors whitespace-nowrap ${isActive
                                            ? 'text-black dark:text-white bg-black/5 dark:bg-white/10'
                                            : 'text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
                                            }`}
                                    >
                                        {link.label}
                                    </NavLink>
                                ))}
                                <NavLink
                                    to="/ai"
                                    className={({ isActive }) => `flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full transition-colors whitespace-nowrap ${isActive
                                        ? 'text-zinc-900 dark:text-white bg-black/5 dark:bg-white/10'
                                        : 'text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 hover:bg-black/5 dark:hover:bg-white/10'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-lg filled">auto_awesome</span>
                                    AI
                                </NavLink>
                            </nav>
                        </div>

                        {/* Search Icon - Far Right (Only visible when closed) */}
                        <div className={`absolute right-2 top-1/2 -translate-y-1/2 transition-all duration-500 ${isSearchOpen ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100 z-20'}`}>
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="size-9 rounded-full flex items-center justify-center text-zinc-600 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">search</span>
                            </button>
                        </div>

                        {/* Search Active State */}
                        <div className={`absolute inset-0 flex items-center h-[50px] px-4 transition-all duration-500 ${isSearchOpen ? 'opacity-100 z-20' : 'opacity-0 pointer-events-none'}`}>
                            <span className="material-symbols-outlined text-zinc-400 text-[20px] mr-3 shrink-0">search</span>
                            <input
                                autoFocus={isSearchOpen}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none text-zinc-900 dark:text-white text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-0 focus:outline-none w-full h-9"
                                placeholder="Search address, city, or zip..."
                                onBlur={() => !searchQuery && setIsSearchOpen(false)}
                            />
                            <button
                                onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                                className="size-8 rounded-full flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0 ml-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        </div>

                        {/* Spacer to maintain height */}
                        <div className="h-[50px] w-full pointer-events-none"></div>
                    </div>
                </LiquidGlass>
            </div>

            {/* Right Auth */}
            <div className="flex items-center gap-3">
                <LiquidGlass variant="nav" className="pointer-events-auto py-2 relative z-20 flex items-center gap-3 pr-2">
                    <button
                        onClick={toggleTheme}
                        className="size-8 ml-1 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>
                    <div className="w-px h-4 bg-zinc-300 dark:bg-white/10 mx-1"></div>
                    {isAuthenticated ? (
                        <>
                            <span className="text-zinc-600 dark:text-zinc-300 text-sm font-medium px-2">
                                Hi, {user?.username} {user?.is_admin && <span className="text-[10px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded-full uppercase ml-1">Admin</span>}
                            </span>
                            <div className="w-px h-4 bg-zinc-300 dark:bg-white/10 mx-1"></div>
                            <button
                                onClick={logout}
                                className="text-zinc-600 dark:text-zinc-300 hover:text-red-500 text-sm font-semibold transition-colors pr-2"
                            >
                                Log Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white text-sm font-semibold transition-colors">Log In</Link>
                            <button className="bg-black ml-2 dark:bg-white text-white dark:text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
                                Sign Up
                            </button>
                        </>
                    )}
                </LiquidGlass>
            </div>
        </header>
    );
});
