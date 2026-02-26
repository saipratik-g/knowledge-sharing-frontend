import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    BookOpen,
    PenSquare,
    LayoutDashboard,
    LogIn,
    LogOut,
    User,
    Menu,
    X,
} from 'lucide-react';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Re-read auth state whenever the route changes (covers post-login nav)
    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try { setUser(JSON.parse(stored)); } catch { setUser(null); }
        } else {
            setUser(null);
        }
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    };

    const navLinks = [
        { to: '/', label: 'Home', icon: <BookOpen size={16} /> },
        ...(user
            ? [
                { to: '/dashboard', label: 'My Articles', icon: <LayoutDashboard size={16} /> },
                { to: '/create', label: 'New Article', icon: <PenSquare size={16} /> },
            ]
            : []),
    ];

    const isActive = (path) =>
        path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-brand-700 transition-colors">
                            <BookOpen size={16} className="text-white" />
                        </div>
                        <span className="text-base font-bold text-slate-900 tracking-tight">
                            Know<span className="text-brand-600">Share</span>
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden sm:flex items-center gap-1">
                        {navLinks.map(({ to, label, icon }) => (
                            <Link
                                key={to}
                                to={to}
                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(to)
                                        ? 'bg-brand-50 text-brand-700'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                {icon}
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="hidden sm:flex items-center gap-2">
                        {user ? (
                            <>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center">
                                        <User size={12} className="text-brand-700" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                                        {user.name || user.email}
                                    </span>
                                </div>
                                <button onClick={handleLogout} className="btn-secondary !py-1.5">
                                    <LogOut size={15} />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn-secondary !py-1.5">
                                    <LogIn size={15} />
                                    Login
                                </Link>
                                <Link to="/signup" className="btn-primary !py-1.5">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="sm:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="sm:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
                    {navLinks.map(({ to, label, icon }) => (
                        <Link
                            key={to}
                            to={to}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(to)
                                    ? 'bg-brand-50 text-brand-700'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {icon}
                            {label}
                        </Link>
                    ))}
                    <div className="pt-2 border-t border-slate-100">
                        {user ? (
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700">{user.name || user.email}</span>
                                <button onClick={handleLogout} className="btn-secondary !py-1.5 !text-sm">
                                    <LogOut size={14} /> Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary !py-1.5 flex-1 justify-center">
                                    Login
                                </Link>
                                <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-primary !py-1.5 flex-1 justify-center">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
