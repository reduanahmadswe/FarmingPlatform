import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpeg';

const Signup: React.FC = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Farmer');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    phone,
                    password,
                    role,
                    location: "Bogura, Bangladesh" // Default for now, can be input later
                }),
            });

            if (response.ok) {
                // On success, redirect to login
                alert("Account created successfully! Please log in.");
                navigate('/');
            } else {
                const data = await response.json();
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            console.error("Signup error:", err);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-brand-dark flex items-center justify-center min-h-screen p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="text-center mb-6">
                    <img src={logo} onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/100?text=FK'} className="h-20 mx-auto object-contain" alt="Logo" />
                    <h2 className="text-xl font-bold text-gray-800 mt-2">Create New Account</h2>
                </div>

                {error && <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-lg text-sm text-center">{error}</div>}

                <form onSubmit={handleSignup}>
                    <div className="mb-3">
                        <label className="block text-gray-700 text-xs font-bold mb-1">Full Name</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-brand-dark focus:border-brand-dark"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="block text-gray-700 text-xs font-bold mb-1">Role</label>
                        <select
                            className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:ring-brand-dark focus:border-brand-dark"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="Farmer">Farmer (কৃষক)</option>
                            <option value="Buyer">Buyer (পাইকার)</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label className="block text-gray-700 text-xs font-bold mb-1">Mobile Number</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-brand-dark focus:border-brand-dark"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-xs font-bold mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-brand-dark focus:border-brand-dark"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className={`w-full bg-brand-accent text-brand-dark font-bold py-3 rounded-lg hover:bg-yellow-400 transition shadow ${loading ? 'opacity-70 cursor-wait' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-500">Already have an account? <Link to="/" className="text-brand-dark font-bold">Log In</Link></p>
            </div>
        </div>
    );
};

export default Signup;
