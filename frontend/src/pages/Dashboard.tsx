import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { UserProfile, Post } from '../types';
import SinglePost from '../components/layout/SinglePost';
import WeatherWidget from '../components/widgets/WeatherWidget';
import { uploadToCloudinary } from '../utils/imageUtils';

interface ExtendedUserProfile extends UserProfile {
    id: string; // Add ID
    phone: string;
    avatar: string; // Add avatar
}

const Dashboard: React.FC = () => {
    const [userProfile, setUserProfile] = useState<ExtendedUserProfile>({
        id: "",
        name: "Rahim Mia",
        phone: "+880 1712 345678",
        location: "Bogura, Bangladesh",
        initials: "RM",
        avatar: ""
    });
    const [myPosts, setMyPosts] = useState<Post[]>([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', phone: '', location: '' });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            const data = JSON.parse(savedProfile);
            setUserProfile({
                ...data,
                initials: data.name ? data.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : "RM"
            });
        }
        loadMyPosts();
    }, []);

    const loadMyPosts = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/posts');
            const data = await res.json();
            const allPosts: Post[] = data.map((p: any) => ({ ...p, id: p._id }));

            // Filter posts for current user
            const myPostsFiltered = allPosts.filter(p => p.user === userProfile.name);
            setMyPosts(myPostsFiltered);
        } catch (error) {
            console.error("Error loading posts:", error);
        }
    };

    // Re-load posts if userProfile changes (name might change)
    useEffect(() => {
        loadMyPosts();
    }, [userProfile.name]);

    const handleEditProfile = () => {
        setEditForm({
            name: userProfile.name,
            phone: userProfile.phone,
            location: userProfile.location || ''
        });
        setSelectedFile(null);
        setIsEditModalOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userProfile.id) {
            alert("User ID missing. Please log out and log in again.");
            return;
        }

        setIsSaving(true);
        let newAvatarUrl = userProfile.avatar;

        try {
            if (selectedFile) {
                newAvatarUrl = await uploadToCloudinary(selectedFile);
            }

            const updatedData = {
                name: editForm.name,
                phone: editForm.phone,
                location: editForm.location,
                avatar: newAvatarUrl
            };

            // Call Backend API
            const res = await fetch(`http://localhost:5000/api/auth/profile/${userProfile.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (res.ok) {
                const savedUser = await res.json();

                const newProfile: ExtendedUserProfile = {
                    ...userProfile,
                    ...updatedData,
                    initials: updatedData.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                };

                setUserProfile(newProfile);
                localStorage.setItem('userProfile', JSON.stringify(newProfile));
                setIsEditModalOpen(false);
                // Ideally trigger a global refresh or user context update
                // For now, loadMyPosts will trigger due to effect, but other components (Community) need reload 
                // Using window.location.reload() is heavy but ensures all components get fresh data from localStorage/API
                // window.location.reload(); 
            } else {
                console.error("Failed to update profile", await res.text());
                alert("Failed to update profile");
            }

        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Error saving profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleReaction = async (id: string, type: string) => {
        // Optimistic UI update
        const updatedPosts = myPosts.map(p => {
            // @ts-ignore
            if (p.id === id || p._id === id) {
                // @ts-ignore
                let reactions = p.reactions ? [...p.reactions] : [];
                // @ts-ignore
                const existingIndex = reactions.findIndex((r: any) => r.user === userProfile.name);

                if (existingIndex > -1) {
                    if (reactions[existingIndex].type === type) {
                        reactions.splice(existingIndex, 1); // Remove
                    } else {
                        reactions[existingIndex].type = type; // Update
                    }
                } else {
                    reactions.push({ user: userProfile.name, type }); // Add
                }
                // @ts-ignore
                return { ...p, reactions, currentUser: userProfile.name };
            }
            return p;
        });
        setMyPosts(updatedPosts);

        try {
            await fetch(`http://localhost:5000/api/posts/${id}/like`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userProfile.name, type })
            });
        } catch (error) {
            console.error("Reaction failed", error);
            loadMyPosts(); // Revert on error
        }
    };

    // ... (keep addComment and others) [Skipping to avoid huge replacement, will target ranges]

    const addComment = async (id: string, text: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/posts/${id}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: userProfile.name, text })
            });
            if (res.ok) {
                loadMyPosts();
            }
        } catch (error) {
            console.error("Comment failed", error);
        }
    };

    const handleDeletePost = async (id: string | number) => {
        if (window.confirm("Delete this post?")) {
            try {
                await fetch(`http://localhost:5000/api/posts/${id}`, {
                    method: 'DELETE'
                });
                loadMyPosts();
            } catch (error) {
                console.error("Error deleting post:", error);
            }
        }
    };

    return (
        <main className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Stats & Activity */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats [Abbreviated] */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 px-1">Farm Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link to="/marketplace" className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 group cursor-pointer relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition"><i className="fas fa-store text-5xl text-brand-accent"></i></div>
                                <div className="relative z-10">
                                    <h3 className="font-bold text-sm text-gray-600 group-hover:text-brand-dark">Marketplace</h3>
                                    <p className="text-2xl font-bold text-brand-dark mt-1">2 Listings</p>
                                </div>
                            </Link>
                            <Link to="/iot" className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 group cursor-pointer relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition"><i className="fas fa-tint text-5xl text-blue-500"></i></div>
                                <div className="relative z-10">
                                    <h3 className="font-bold text-sm text-gray-600 group-hover:text-blue-600">Smart Pump</h3>
                                    <div className="flex items-center mt-1">
                                        <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
                                        <p className="text-xl font-bold text-green-600">ON</p>
                                    </div>
                                </div>
                            </Link>
                            <WeatherWidget compact={true} />
                        </div>
                    </div>

                    {/* Activity Timeline */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4 px-1 flex items-center">
                            <span className="bg-brand-light text-white w-7 h-7 rounded-full flex items-center justify-center mr-2 text-xs"><i className="fas fa-history"></i></span>
                            My Activity Timeline
                        </h2>

                        <div className="space-y-6">
                            {myPosts.length === 0 ? (
                                <p className="text-gray-400 text-sm italic py-4">No posts found. Create one in Community page!</p>
                            ) : (
                                myPosts.map(post => (
                                    <SinglePost
                                        key={post.id}
                                        post={{ ...post, currentUser: userProfile.name }}
                                        currentInitials={userProfile.initials}
                                        currentUserAvatar={userProfile.avatar}
                                        onReaction={(type) => handleReaction(post.id || (post as any)._id, type)}
                                        onComment={(text) => addComment(post.id || (post as any)._id, text)}
                                        onDelete={() => handleDeletePost(post.id || (post as any)._id)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Profile Card */}
                <div className="hidden lg:block lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24 relative text-center">
                        <button onClick={handleEditProfile} className="absolute top-4 right-4 text-gray-400 hover:text-brand-dark transition bg-gray-50 p-2 rounded-full border border-gray-200 shadow-sm z-10 cursor-pointer" title="Edit Profile">
                            <i className="fas fa-pen text-sm"></i>
                        </button>

                        <div className="flex flex-col items-center">
                            <div className="relative mb-4">
                                {userProfile.avatar ? (
                                    <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-white shadow-md">
                                        <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="h-28 w-28 bg-brand-light rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-md">
                                        <span>{userProfile.initials}</span>
                                    </div>
                                )}
                                <div className="absolute bottom-2 right-2 bg-green-500 h-6 w-6 rounded-full border-2 border-white shadow-sm" title="Active"></div>
                            </div>

                            <h1 className="text-2xl font-bold text-gray-800 mb-1">{userProfile.name}</h1>
                            <span className="text-xs font-bold text-brand-dark bg-green-100 px-3 py-0.5 rounded-full border border-green-200 mb-4">Farmer</span>

                            <div className="w-full space-y-3">
                                <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="bg-white p-2 rounded-full shadow-sm mr-3 text-brand-light"><i className="fas fa-phone-alt"></i></div>
                                    <div className="text-left">
                                        <p className="text-xs text-gray-400 font-bold uppercase">Phone</p>
                                        <p className="text-sm font-semibold text-gray-700">{userProfile.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="bg-white p-2 rounded-full shadow-sm mr-3 text-red-400"><i className="fas fa-map-marker-alt"></i></div>
                                    <div className="text-left">
                                        <p className="text-xs text-gray-400 font-bold uppercase">Location</p>
                                        <p className="text-sm font-semibold text-gray-700">{userProfile.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="bg-white p-2 rounded-full shadow-sm mr-3 text-blue-400"><i className="fas fa-calendar-alt"></i></div>
                                    <div className="text-left">
                                        <p className="text-xs text-gray-400 font-bold uppercase">Joined</p>
                                        <p className="text-sm font-semibold text-gray-700">January 2025</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-fade-in-up border border-gray-200">
                        <div className="flex justify-between items-center mb-5 border-b pb-3">
                            <h3 className="text-lg font-bold text-gray-800">Edit Profile</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-red-500"><i className="fas fa-times"></i></button>
                        </div>

                        <form onSubmit={handleSaveProfile}>
                            <div className="flex justify-center mb-6">
                                <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                                    {selectedFile ? (
                                        <img src={URL.createObjectURL(selectedFile)} className="h-20 w-20 rounded-full object-cover border-2 border-brand-light shadow-sm" />
                                    ) : userProfile.avatar ? (
                                        <img src={userProfile.avatar} className="h-20 w-20 rounded-full object-cover border-2 border-gray-200 shadow-sm" />
                                    ) : (
                                        <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-2xl border-2 border-gray-200 border-dashed hover:border-brand-dark transition">
                                            <i className="fas fa-camera"></i>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition flex items-center justify-center">
                                        <i className="fas fa-pen text-white opacity-0 group-hover:opacity-100"></i>
                                    </div>
                                    <input
                                        type="file"
                                        id="avatar-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg px-3 py-2.5 bg-gray-50 focus:bg-white transition"
                                    required
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Phone Number</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg px-3 py-2.5 bg-gray-50 focus:bg-white transition"
                                    required
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Location</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg px-3 py-2.5 bg-gray-50 focus:bg-white transition"
                                    required
                                    value={editForm.location}
                                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-brand-dark text-white font-bold py-3 rounded-lg hover:bg-green-800 transition disabled:opacity-50"
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            <style>{`
                .animate-fade-in-up { animation: fadeInUp 0.3s ease-out forwards; } 
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </main>
    );
};

export default Dashboard;
