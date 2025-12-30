import React, { useState, useEffect, useRef } from 'react';
import type { Post, UserProfile } from '../types';
import { compressImage } from '../utils/imageUtils';

import SinglePost from '../components/layout/SinglePost';
import WeatherWidget from '../components/widgets/WeatherWidget';

const Community: React.FC = () => {
    // ... [Previous hooks code remains same, no changes needed to logic] ...
    const [currentUser, setCurrentUser] = useState<UserProfile>({
        name: "Rahim Mia",
        initials: "RM",
        location: "Bogura, BD"
    });

    const [posts, setPosts] = useState<Post[]>([]);
    const [newPostText, setNewPostText] = useState("");
    const [mediaFile, setMediaFile] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    // Load initial data
    useEffect(() => {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            const data = JSON.parse(savedProfile);
            setCurrentUser({
                ...data,
                initials: data.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
            });
        }
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/posts');
            const data = await res.json();
            // Transform _id to id if needed, or backend should handle it. Assuming backend returns array.
            setPosts(data.map((p: any) => ({ ...p, id: p._id })));
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        if (e.target.files && e.target.files[0]) {
            let file = e.target.files[0];

            if (type === 'image') {
                try {
                    console.log(`Original size: ${file.size / 1024} KB`);
                    file = await compressImage(file);
                    console.log(`Compressed size: ${file.size / 1024} KB`);
                } catch (err) {
                    console.error("Compression error", err);
                }
            }

            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    setMediaFile(ev.target.result as string);
                    setMediaType(type);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const clearMedia = () => {
        setMediaFile(null);
        setMediaType(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (videoInputRef.current) videoInputRef.current.value = '';
    };

    const createPost = async () => {
        if (newPostText.trim() === "" && !mediaFile) return;
        setUploading(true);

        try {
            let mediaUrl = mediaFile;

            // If it's a base64 string (local preview) and we need to upload
            if (mediaFile && mediaFile.startsWith('data:')) {
                const res = await fetch(mediaFile);
                const blob = await res.blob();
                const file = new File([blob], "upload.jpg", { type: blob.type });

                const { uploadToCloudinary } = await import('../utils/imageUtils');
                // Use a try-catch for upload specifically to not block posting on upload failure
                try {
                    mediaUrl = await uploadToCloudinary(file);
                } catch (uploadErr) {
                    console.error("Upload failed, posting with local preview anyway", uploadErr);
                    // mediaUrl remains base64
                }
            }

            const postData = {
                user: currentUser.name,
                role: "Farmer",
                initial: currentUser.initials,
                color: "green",
                text: newPostText,
                mediaType: mediaType,
                mediaSrc: mediaUrl
            };

            const res = await fetch('http://localhost:5000/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
            });

            if (res.ok) {
                setNewPostText("");
                clearMedia();
                fetchPosts(); // Refresh feed
            }
        } catch (error) {
            console.error("Error creating post:", error);
        } finally {
            setUploading(false);
        }
    };

    const handleReaction = async (id: string, type: string) => {
        // Optimistic UI update
        const updatedPosts = posts.map(p => {
            // @ts-ignore
            if (p.id === id || p._id === id) {
                // Clone reactions
                let reactions = p.reactions ? [...p.reactions] : [];
                const existingIndex = reactions.findIndex((r: any) => r.user === currentUser.name);

                if (existingIndex > -1) {
                    if (reactions[existingIndex].type === type) {
                        reactions.splice(existingIndex, 1); // Remove
                    } else {
                        reactions[existingIndex].type = type; // Update
                    }
                } else {
                    reactions.push({ user: currentUser.name, type }); // Add
                }

                return { ...p, reactions, currentUser: currentUser.name };
            }
            return p;
        });
        setPosts(updatedPosts);

        try {
            await fetch(`http://localhost:5000/api/posts/${id}/like`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.name, type })
            });
        } catch (error) {
            console.error("Reaction failed", error);
            fetchPosts(); // Revert on error
        }
    };

    const addComment = async (id: string, text: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/posts/${id}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: currentUser.name, text, userAvatar: currentUser.initials })
            });
            if (res.ok) {
                fetchPosts();
            }
        } catch (error) {
            console.error("Comment failed", error);
        }
    };

    const handleReply = async (postId: string, commentId: string, replyToId: string, text: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/posts/${postId}/comments/${commentId}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: currentUser.name, text, userAvatar: currentUser.initials, replyToId })
            });
            if (res.ok) fetchPosts();
        } catch (error) {
            console.error("Reply failed", error);
        }
    };

    const handleCommentReaction = async (postId: string, commentId: string, type: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/posts/${postId}/comments/${commentId}/react`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.name, type })
            });
            if (res.ok) fetchPosts();
        } catch (error) {
            console.error("Comment reaction failed", error);
        }
    };

    const handleShare = async (postId: string, text?: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/posts/${postId}/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: currentUser.name,
                    initial: currentUser.initials,
                    color: 'green',
                    text: text || ''
                })
            });
            if (res.ok) fetchPosts();
        } catch (error) {
            console.error("Share failed", error);
        }
    };

    return (
        <main className="pt-24 pb-10 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Create Post Widget */}
                        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                            <div className="flex space-x-3 mb-4">
                                <div id="post-avatar" className="h-10 w-10 bg-brand-light rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">{currentUser.initials}</div>
                                <input
                                    type="text"
                                    placeholder="Share your farming tips..."
                                    className="w-full bg-gray-50 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light transition"
                                    value={newPostText}
                                    onChange={(e) => setNewPostText(e.target.value)}
                                />
                            </div>

                            {mediaFile && (
                                <div className="mb-4 relative w-full bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                                    <button onClick={clearMedia} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs z-10 hover:bg-red-600"><i className="fas fa-times"></i></button>
                                    {mediaType === 'image' ? (
                                        <img src={mediaFile} className="w-full h-auto max-h-[500px] object-contain mx-auto" alt="Preview" />
                                    ) : (
                                        <video src={mediaFile} className="w-full h-auto max-h-[500px]" controls></video>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-between items-center border-t pt-3">
                                <div className="flex space-x-4 ml-2">
                                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center space-x-1.5 text-gray-500 hover:text-green-600 transition"><i className="fas fa-image text-green-500"></i> <span className="text-xs font-semibold">Photo</span></button>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={(e) => handleFileSelect(e, 'image')}
                                    />
                                    <button onClick={() => videoInputRef.current?.click()} className="flex items-center space-x-1.5 text-gray-500 hover:text-red-600 transition"><i className="fas fa-video text-red-500"></i> <span className="text-xs font-semibold">Video</span></button>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        className="hidden"
                                        ref={videoInputRef}
                                        onChange={(e) => handleFileSelect(e, 'video')}
                                    />
                                </div>
                                <button
                                    onClick={createPost}
                                    className={`bg-brand-dark text-white px-6 py-1.5 rounded-full text-sm font-semibold hover:bg-green-800 transition shadow ${uploading ? 'opacity-50 cursor-wait' : ''}`}
                                    disabled={uploading}
                                >
                                    {uploading ? 'Posting...' : 'Post'}
                                </button>
                            </div>
                        </div>

                        {/* Feed Container */}
                        <div className="space-y-6">
                            {posts.length === 0 && <p className="text-center text-gray-400 py-10">No posts yet. Be the first to share!</p>}
                            {posts.map((post: any) => (
                                <SinglePost
                                    key={post.id || post._id}
                                    post={{ ...post, currentUser: currentUser.name }} // Pass current user for reaction check
                                    currentInitials={currentUser.initials}
                                    onReaction={(type) => handleReaction(post.id || post._id, type)}
                                    onComment={(text) => addComment(post.id || post._id, text)}
                                    onReply={(rootId, replyToId, text) => handleReply(post.id || post._id, rootId, replyToId, text)}
                                    onCommentReaction={(commentId, type) => handleCommentReaction(post.id || post._id, commentId, type)}
                                    onShare={(text) => handleShare(post.id || post._id, text)}
                                />
                            ))}
                        </div>
                    </div>
                    {/* Right Column: Weather */}
                    <div className="hidden lg:block lg:col-span-1 space-y-6">
                        <WeatherWidget />
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Community;
