import React, { useState, useEffect } from 'react';
import type { Crop, Post } from '../types';

const defaultCrops: Crop[] = [
    { name: 'Organic Rice', qty: 500, price: 65, icon: 'fa-seedling', color: 'yellow' },
    { name: 'Fresh Tomato', qty: 200, price: 40, icon: 'fa-apple-alt', color: 'red' }
];

const cropOptions = [
    'Organic Rice', 'Fresh Tomato', 'Potato (Alu)', 'Wheat (Gom)',
    'Onion (Peyaj)', 'Mustard (Shorisha)', 'Green Chili'
];

const Marketplace: React.FC = () => {
    const [crops, setCrops] = useState<Crop[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(-1); // -1 for new
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: 'Organic Rice',
        qty: '',
        price: '',
        shareToFeed: true
    });

    useEffect(() => {
        fetchCrops();
    }, []);

    const fetchCrops = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/marketplace');
            const data = await res.json();
            // Backend returns array of crops with _id
            setCrops(data.map((c: any) => ({ ...c, id: c._id })));
        } catch (error) {
            console.error("Error fetching crops:", error);
            // Fallback
            setCrops(defaultCrops);
        }
    };

    const openModal = (index: number = -1) => {
        setEditIndex(index);
        if (index === -1) {
            // New
            setEditId(null);
            setFormData({ name: 'Organic Rice', qty: '', price: '', shareToFeed: true });
        } else {
            // Edit
            const crop = crops[index];
            setEditId((crop as any).id); // assuming we added id field during fetch mapping
            setFormData({
                name: crop.name,
                qty: crop.qty.toString(),
                price: crop.price.toString(),
                shareToFeed: false
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleDelete = async (index: number) => {
        if (window.confirm("Are you sure you want to delete this listing?")) {
            const crop = crops[index];
            try {
                // @ts-ignore
                await fetch(`http://localhost:5000/api/marketplace/${crop.id}`, { method: 'DELETE' });
                fetchCrops();
            } catch (error) {
                console.error("Delete failed", error);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Icon Logic
        let icon = 'fa-leaf';
        let color = 'green';
        const name = formData.name;
        if (name.includes('Rice')) { icon = 'fa-seedling'; color = 'yellow'; }
        else if (name.includes('Tomato')) { icon = 'fa-apple-alt'; color = 'red'; }
        else if (name.includes('Potato')) { icon = 'fa-cookie'; color = 'orange'; }
        else if (name.includes('Onion')) { icon = 'fa-feather-alt'; color = 'purple'; }
        else if (name.includes('Chili')) { icon = 'fa-pepper-hot'; color = 'red'; }

        const cropData = {
            name: formData.name,
            qty: parseInt(formData.qty) || 0,
            price: parseInt(formData.price) || 0,
            icon,
            color
        };

        try {
            if (editIndex === -1) {
                // Add New
                await fetch('http://localhost:5000/api/marketplace', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cropData)
                });
                alert("Listing Published!");
            } else {
                // Update
                if (editId) {
                    await fetch(`http://localhost:5000/api/marketplace/${editId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(cropData)
                    });
                    alert("Listing Updated!");
                }
            }
            fetchCrops();
        } catch (error) {
            console.error("Save failed", error);
        }

        // Auto-Post Logic (Optional: send to community API directly if backend doesn't handle it)
        if (formData.shareToFeed) {
            const savedProfile = localStorage.getItem('userProfile');
            const userData = savedProfile ? JSON.parse(savedProfile) : { name: "Rahim Mia" };
            const initials = userData.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

            const actionText = editIndex === -1 ? "নতুন বিক্রয় বিজ্ঞপ্তি!" : "আপডেট বিজ্ঞপ্তি!";
            const postText = `📢 ${actionText} \nআমি ${cropData.qty} কেজি "${cropData.name}" বিক্রি করছি। \nদাম: ৳${cropData.price}/কেজি। \nকারও প্রয়োজন হলে যোগাযোগ করুন।`;

            // Create post via API
            await fetch('http://localhost:5000/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: userData.name,
                    role: "Farmer",
                    initial: initials,
                    color: "green",
                    text: postText,
                    mediaType: null,
                    mediaSrc: null
                })
            });
        }

        closeModal();
    };

    return (
        <main className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Listings</h2>
                <button onClick={() => openModal(-1)} className="bg-brand-dark text-white px-5 py-2 rounded-full shadow hover:bg-brand-light transition text-sm font-semibold">
                    <i className="fas fa-plus mr-2"></i>Add Crop
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {crops.length === 0 && <p className="text-gray-500 col-span-3 text-center py-10">No crops listed yet.</p>}
                {crops.map((crop, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 relative group hover:shadow-md transition">
                        <div className={`h-40 bg-${crop.color}-50 flex items-center justify-center`}>
                            <i className={`fas ${crop.icon} text-5xl text-${crop.color}-500`}></i>
                        </div>
                        <div className="p-5">
                            <h3 className="font-bold text-lg text-gray-800">{crop.name}</h3>
                            <p className="text-sm text-gray-500 mb-4">Stock: {crop.qty} KG</p>
                            <div className="flex justify-between items-center">
                                <span className="text-xl font-bold text-brand-dark">৳ {crop.price}/kg</span>
                                <div className="space-x-2">
                                    <button onClick={() => openModal(i)} className="text-brand-light font-semibold hover:underline text-sm"><i className="fas fa-edit"></i> Edit</button>
                                    <button onClick={() => handleDelete(i)} className="text-red-400 font-semibold hover:text-red-600 text-sm"><i className="fas fa-trash"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 animate-bounce-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-brand-dark">{editIndex === -1 ? "Add New Crop" : "Edit Crop Details"}</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-red-500"><i className="fas fa-times text-xl"></i></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Crop Name</label>
                                <select
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-brand-dark focus:border-brand-dark"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                >
                                    {cropOptions.map(opt => <option key={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div className="flex space-x-4 mb-4">
                                <div className="w-1/2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Quantity (KG)</label>
                                    <input
                                        type="number"
                                        placeholder="500"
                                        className="w-full border rounded-lg px-3 py-2"
                                        required
                                        value={formData.qty}
                                        onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                                    />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Price per KG (৳)</label>
                                    <input
                                        type="number"
                                        placeholder="60"
                                        className="w-full border rounded-lg px-3 py-2"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="mb-5 flex items-center">
                                <input
                                    type="checkbox"
                                    id="shareToFeed"
                                    className="w-4 h-4 text-brand-dark rounded border-gray-300 focus:ring-brand-light"
                                    checked={formData.shareToFeed}
                                    onChange={(e) => setFormData({ ...formData, shareToFeed: e.target.checked })}
                                />
                                <label htmlFor="shareToFeed" className="ml-2 text-sm text-gray-700 font-medium">Share update to Community Feed?</label>
                            </div>

                            <button type="submit" className="w-full bg-brand-dark text-white font-bold py-3 rounded-lg hover:bg-green-800 transition">
                                {editIndex === -1 ? "Publish Listing" : "Update Listing"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            <style>{`
                .animate-bounce-in { animation: bounceIn 0.5s; } 
                @keyframes bounceIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
            `}</style>
        </main>
    );
};

export default Marketplace;
