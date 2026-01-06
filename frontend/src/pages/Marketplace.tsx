import React, { useState, useEffect } from 'react';
import type { Crop } from '../types';
import { compressImage, uploadToCloudinary } from '../utils/imageUtils';
import ConfirmDialog from '../components/widgets/ConfirmDialog';

const defaultCrops: Crop[] = [
    { name: 'Organic Rice', qty: 500, price: 65, icon: 'fa-seedling', color: 'yellow', contact: '01700000000', notes: 'Clean sun-dried', imageUrl: null },
    { name: 'Fresh Tomato', qty: 200, price: 40, icon: 'fa-apple-alt', color: 'red', contact: '01800000000', notes: 'Grade A crate packed', imageUrl: null }
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
        name: '',
        qty: '',
        price: '',
        contact: '',
        notes: '',
        shareToFeed: true,
        imageUrl: '',
        soldOut: false
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [currentUserName, setCurrentUserName] = useState('Rahim Mia');
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);

    useEffect(() => {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            const parsed = JSON.parse(savedProfile);
            setCurrentUserName(parsed.name || 'Rahim Mia');
        }
        fetchCrops();
    }, []);

    const fetchCrops = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/marketplace`);
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
            setEditId(null);
            setFormData({ name: '', qty: '', price: '', contact: '', notes: '', shareToFeed: true, imageUrl: '', soldOut: false });
            setImagePreview(null);
            setImageFile(null);
        } else {
            const crop = crops[index];
            setEditId((crop as any).id || (crop as any)._id || null);
            setFormData({
                name: crop.name,
                qty: crop.qty?.toString() || '',
                price: crop.price?.toString() || '',
                contact: crop.contact || '',
                notes: crop.notes || '',
                shareToFeed: false,
                imageUrl: crop.imageUrl || '',
                soldOut: !!crop.soldOut
            });
            setImagePreview(crop.imageUrl || null);
            setImageFile(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleDeleteRequest = (index: number) => {
        setPendingDeleteIndex(index);
        setConfirmOpen(true);
    };

    const performDelete = async () => {
        if (pendingDeleteIndex === null) return;
        const crop = crops[pendingDeleteIndex];
        const cropId = (crop as any).id || (crop as any)._id;
        if (!cropId) return;
        try {
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/marketplace/${cropId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: currentUserName })
            });
            setToast({ type: 'success', message: 'Listing deleted' });
            setConfirmOpen(false);
            setPendingDeleteIndex(null);
            fetchCrops();
        } catch (error) {
            console.error('Delete failed', error);
            setToast({ type: 'error', message: 'Delete failed' });
            setConfirmOpen(false);
            setPendingDeleteIndex(null);
        }
    };

    const toggleSoldOut = async (index: number) => {
        const crop = crops[index];
        const cropId = (crop as any).id || (crop as any)._id;
        if (!cropId) return;
        try {
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/marketplace/${cropId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ soldOut: !crop.soldOut })
            });
            setToast({ type: 'success', message: !crop.soldOut ? 'Marked as sold out' : 'Marked as available' });
            fetchCrops();
        } catch (error) {
            console.error('Toggle sold out failed', error);
            setToast({ type: 'error', message: 'Could not update sold status' });
        }
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        try {
            const compressed = await compressImage(e.target.files[0]);
            setImageFile(compressed);

            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) setImagePreview(ev.target.result as string);
            };
            reader.readAsDataURL(compressed);
        } catch (err) {
            console.error('Image select failed', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.contact.trim()) {
            alert('Please add crop name and contact number.');
            return;
        }

        setIsSaving(true);

        // Icon Logic
        let icon = 'fa-leaf';
        let color = 'green';
        const name = formData.name;
        if (name.includes('Rice')) { icon = 'fa-seedling'; color = 'yellow'; }
        else if (name.includes('Tomato')) { icon = 'fa-apple-alt'; color = 'red'; }
        else if (name.includes('Potato')) { icon = 'fa-cookie'; color = 'orange'; }
        else if (name.includes('Onion')) { icon = 'fa-feather-alt'; color = 'purple'; }
        else if (name.includes('Chili')) { icon = 'fa-pepper-hot'; color = 'red'; }

        let uploadedUrl = formData.imageUrl || null;
        try {
            if (imageFile) {
                uploadedUrl = await uploadToCloudinary(imageFile);
            }

            const cropData = {
                name: formData.name,
                qty: parseInt(formData.qty) || 0,
                price: parseInt(formData.price) || 0,
                icon,
                color,
                contact: formData.contact.trim(),
                notes: formData.notes.trim(),
                imageUrl: uploadedUrl,
                user: currentUserName,
                shareToFeed: formData.shareToFeed,
                soldOut: formData.soldOut || false
            } as any;

            if (editIndex === -1) {
                await fetch('http://localhost:5000/api/marketplace', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cropData)
                });
                setToast({ type: 'success', message: 'Listing published' });
            } else if (editId) {
                await fetch(`http://localhost:5000/api/marketplace/${editId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cropData)
                });
                setToast({ type: 'success', message: 'Listing updated' });
            }

            await fetchCrops();
            closeModal();
        } catch (error) {
            console.error("Save failed", error);
            setToast({ type: 'error', message: 'Save failed. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg border text-sm font-semibold flex items-center space-x-2 ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    <i className={`fas ${toast.type === 'success' ? 'fa-check-circle text-green-500' : 'fa-exclamation-circle text-red-500'}`}></i>
                    <span>{toast.message}</span>
                    <button onClick={() => setToast(null)} className="ml-2 text-xs text-gray-500 hover:text-gray-700">✕</button>
                </div>
            )}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <p className="text-xs uppercase tracking-wide text-brand-light font-semibold">Marketplace</p>
                    <h2 className="text-2xl font-bold text-gray-800">My Listings</h2>
                    <p className="text-sm text-gray-500">Add crop photo, quantity, price/kg and contact so buyers can reach you. Toggle share to also publish in Community feed.</p>
                </div>
                <button onClick={() => openModal(-1)} className="bg-brand-dark text-white px-5 py-2 rounded-full shadow hover:bg-brand-light transition text-sm font-semibold">
                    <i className="fas fa-plus mr-2"></i>Add Crop
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {crops.length === 0 && <p className="text-gray-500 col-span-3 text-center py-10">No crops listed yet.</p>}
                {crops.map((crop, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 relative group hover:shadow-md transition">
                        <div className="absolute top-3 left-3 z-10">
                            <div className={`text-xs font-bold px-3 py-1 rounded-full shadow-sm border ${crop.soldOut ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                                {crop.soldOut ? 'Sold Out' : 'Available'}
                            </div>
                        </div>
                        <div className={`h-40 bg-${crop.color}-50 flex items-center justify-center overflow-hidden`}>
                            {crop.imageUrl ? (
                                <img src={crop.imageUrl} className="w-full h-full object-cover" alt={crop.name} />
                            ) : (
                                <i className={`fas ${crop.icon} text-5xl text-${crop.color}-500`}></i>
                            )}
                        </div>
                        <div className="p-5">
                            <h3 className="font-bold text-lg text-gray-800">{crop.name}</h3>
                            <p className="text-sm text-gray-500 mb-1">Stock: {crop.qty} KG</p>
                            <p className="text-sm text-gray-600 mb-1"><i className="fas fa-phone-alt text-brand-light mr-1"></i>{crop.contact || 'No contact'}</p>
                            {crop.notes && <p className="text-xs text-gray-500 mb-2">{crop.notes}</p>}
                            <div className="flex justify-between items-center">
                                <span className="text-xl font-bold text-brand-dark">৳ {crop.price}/kg</span>
                                <div className="space-x-2">
                                    <button onClick={() => toggleSoldOut(i)} className={`text-xs font-semibold px-2 py-1 rounded-full border ${crop.soldOut ? 'text-green-700 border-green-200 bg-green-50' : 'text-red-700 border-red-200 bg-red-50'}`}>
                                        {crop.soldOut ? 'Mark Available' : 'Mark Sold Out'}
                                    </button>
                                    <button onClick={() => openModal(i)} className="text-brand-light font-semibold hover:underline text-sm"><i className="fas fa-edit"></i> Edit</button>
                                    <button onClick={() => handleDeleteRequest(i)} className="text-red-400 font-semibold hover:text-red-600 text-sm"><i className="fas fa-trash"></i></button>
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
                                <input
                                    list="cropOptions"
                                    placeholder="e.g. Organic Rice"
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-brand-dark focus:border-brand-dark"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                                <datalist id="cropOptions">
                                    {cropOptions.map(opt => <option key={opt} value={opt}></option>)}
                                </datalist>
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

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Contact Number</label>
                                <input
                                    type="tel"
                                    placeholder="017XXXXXXXX"
                                    className="w-full border rounded-lg px-3 py-2"
                                    required
                                    value={formData.contact}
                                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-1">Buyers will use this to call you. Visible on card and community post.</p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Quality / Notes</label>
                                <textarea
                                    rows={2}
                                    placeholder="Moisture <14%, clean sacks, delivery within 10km"
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-brand-dark focus:border-brand-dark"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Crop Image</label>
                                <div className="flex items-center space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('cropImageInput')?.click()}
                                        className="px-3 py-2 bg-brand-bg text-brand-dark rounded-lg border border-brand-light hover:bg-green-100 text-sm font-semibold flex items-center space-x-2"
                                    >
                                        <i className="fas fa-camera"></i><span>Upload Photo</span>
                                    </button>
                                    <input id="cropImageInput" type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                                    <span className="text-xs text-gray-500">{imageFile ? imageFile.name : formData.imageUrl ? 'Existing image' : 'No file selected'}</span>
                                </div>
                                {imagePreview && (
                                    <div className="mt-3 w-full h-40 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                                        <img src={imagePreview} className="w-full h-full object-cover" alt="Crop preview" />
                                    </div>
                                )}
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

                            <div className="mb-5 flex items-center">
                                <input
                                    type="checkbox"
                                    id="soldOut"
                                    className="w-4 h-4 text-brand-dark rounded border-gray-300 focus:ring-brand-light"
                                    checked={formData.soldOut}
                                    onChange={(e) => setFormData({ ...formData, soldOut: e.target.checked })}
                                />
                                <label htmlFor="soldOut" className="ml-2 text-sm text-gray-700 font-medium">Mark as Sold Out</label>
                            </div>

                            <button type="submit" className={`w-full bg-brand-dark text-white font-bold py-3 rounded-lg hover:bg-green-800 transition ${isSaving ? 'opacity-60 cursor-wait' : ''}`} disabled={isSaving}>
                                {isSaving ? 'Saving...' : editIndex === -1 ? "Publish Listing" : "Update Listing"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            <style>{`
                .animate-bounce-in { animation: bounceIn 0.5s; } 
                @keyframes bounceIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
            `}</style>

            <ConfirmDialog
                open={confirmOpen}
                title="Delete Listing"
                message="Are you sure you want to delete this listing? This will also remove the linked community post."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={performDelete}
                onCancel={() => { setConfirmOpen(false); setPendingDeleteIndex(null); }}
            />
        </main>
    );
};

export default Marketplace;
