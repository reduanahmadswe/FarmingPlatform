import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.jpeg';

const Header: React.FC = () => {
    const location = useLocation();

    // Helper to determine active state styling
    const getLinkClass = (path: string) => {
        const baseClass = "px-3 py-2 text-sm flex items-center transition";
        const activeClass = "text-brand-dark font-bold border-b-2 border-brand-dark";
        const inactiveClass = "text-gray-500 hover:text-brand-dark font-medium";

        return location.pathname === path ? `${baseClass} ${activeClass}` : `${baseClass} ${inactiveClass}`;
    };

    return (
        <header className="bg-white shadow-sm fixed w-full top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/dashboard" className="flex-shrink-0 flex items-center cursor-pointer">
                        <img src={logo} onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/40?text=FK'} className="h-10 w-auto mr-2" alt="Logo" />
                        <span className="font-bold text-xl text-brand-dark tracking-tight">Fosoler Khoj</span>
                    </Link>
                    <nav className="hidden md:flex space-x-8">
                        <Link to="/community" className={getLinkClass('/community')}>
                            <i className="fas fa-users mr-2"></i> Community
                        </Link>
                        <Link to="/marketplace" className={getLinkClass('/marketplace')}>
                            <i className="fas fa-store mr-2"></i> Marketplace
                        </Link>
                        <Link to="/iot" className={getLinkClass('/iot')}>
                            <i className="fas fa-tint mr-2"></i> IoT
                        </Link>
                        <Link to="/ai-detect" className={getLinkClass('/ai-detect')}>
                            <i className="fas fa-microscope mr-2"></i> AI Detect
                        </Link>
                    </nav>
                    <div className="hidden md:flex items-center space-x-4">
                        <Link to="/" className="text-gray-600 hover:text-red-600 font-medium text-sm transition">Log Out</Link>
                        <Link to="/dashboard" className="group flex items-center space-x-2 cursor-pointer bg-brand-bg px-3 py-1.5 rounded-full hover:bg-green-100 transition" title="Go to Profile">
                            <span className="text-xs font-bold text-brand-dark hidden lg:block">My Profile</span>
                            <div id="nav-avatar" className="h-8 w-8 bg-brand-light rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm group-hover:scale-110 transition-transform">RM</div>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
