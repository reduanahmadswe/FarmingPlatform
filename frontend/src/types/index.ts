export interface Reaction {
    user: string;
    type: string;
}

export interface Reply {
    _id: string;
    user: string;
    userAvatar?: string; // Initials or image URL
    text: string;
    createdAt: string;
    reactions?: Reaction[];
    replies?: Reply[];
}

export interface Comment {
    _id: string; // Backend ID
    user: string;
    userAvatar?: string;
    text: string;
    createdAt: string;
    reactions?: Reaction[];
    replies?: Reply[];
}

export interface Post {
    id: string; // Changed from number to string for consistency with MongoDB _id
    _id?: string; // Allow _id for raw backend data
    user: string;
    role: string;
    initial: string;
    color: string;
    time?: string;
    text: string;
    likes: number;
    isLiked: boolean;
    commentsList: Comment[];
    reactions?: { user: string; type: string }[];
    userReaction?: string; // Helper for frontend state
    mediaType?: 'image' | 'video' | null;
    mediaSrc?: string | null;
    sharedPost?: Post;
    shares?: number;
    marketStatus?: 'available' | 'sold-out';
    createdAt?: string; // Real backend date
}

export interface UserProfile {
    name: string;
    initials: string;
    location: string;
}

export interface Crop {
    id?: string;
    _id?: string;
    name: string;
    qty: number;
    price: number;
    icon: string;
    color: string;
    contact: string;
    notes?: string;
    imageUrl?: string | null;
    soldOut?: boolean;
}
