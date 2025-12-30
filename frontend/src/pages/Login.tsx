import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpeg';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Save auth data
                localStorage.setItem('token', data.token);

                // Map backend user to frontend UserProfile format
                const userProfile = {
                    id: data.user._id,
                    name: data.user.name,
                    phone: data.user.phone,
                    location: data.user.location || "Unknown",
                    role: data.user.role,
                    avatar: data.user.avatar || "",
                    initials: data.user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                };
                localStorage.setItem('userProfile', JSON.stringify(userProfile));

                // Navigate to community
                navigate('/community');
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            console.error("Login error:", err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 flex items-center justify-center min-h-screen">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <div className="text-center mb-6">
                    <img src={logo} onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/150x80?text=Fosoler+Khoj'} className="h-28 mx-auto object-contain mb-2" alt="Logo" />
                    <p className="text-xs text-brand-light font-bold tracking-widest uppercase">Purely Organic Pleasure</p>
                </div>

                {error && <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-lg text-sm text-center">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Mobile Number</label>
                        <input
                            type="text"
                            placeholder="+880 17..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark bg-gray-50 transition"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-dark bg-gray-50 transition"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className={`w-full bg-brand-dark text-white font-bold py-3 rounded-lg hover:bg-green-800 transition shadow-lg ${loading ? 'opacity-70 cursor-wait' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Logging In...' : 'Log In'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">Don't have an account? <Link to="/signup" className="text-brand-dark font-bold hover:underline">Sign Up</Link></p>
            </div>
        </div>
    );
};

export default Login;
