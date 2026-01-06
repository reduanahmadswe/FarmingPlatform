import Post, { IPost } from './post.model';

export const createPost = async (data: Partial<IPost>): Promise<IPost> => {
    return await Post.create(data as any);
};

export const getAllPosts = async (): Promise<IPost[]> => {
    return await Post.find().populate('sharedPost').sort({ createdAt: -1 });
};

export const likePost = async (id: string, userId: string, type: string = 'like'): Promise<IPost | null> => {
    const post = await Post.findById(id);
    if (!post) return null;

    const existingReactionIndex = post.reactions.findIndex(r => r.user === userId);

    if (existingReactionIndex > -1) {
        if (post.reactions[existingReactionIndex].type === type) {
            post.reactions.splice(existingReactionIndex, 1);
        } else {
            post.reactions[existingReactionIndex].type = type;
        }
    } else {
        post.reactions.push({ user: userId, type });
    }

    post.likes = post.reactions.length;
    return await post.save();
};

export const addComment = async (id: string, user: string, text: string, userAvatar?: string): Promise<IPost | null> => {
    return await Post.findByIdAndUpdate(
        id,
        {
            $push: {
                commentsList: {
                    user,
                    text,
                    userAvatar,
                    createdAt: new Date(),
                    reactions: [],
                    replies: []
                }
            }
        },
        { new: true }
    );
};

// Recursive helper to find and update a nested reply
const findAndAddReply = (items: any[], targetId: string, replyData: any): boolean => {
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item._id.toString() === targetId) {
            if (!item.replies) item.replies = [];
            item.replies.push(replyData);
            return true;
        }

        if (item.replies && item.replies.length > 0) {
            if (findAndAddReply(item.replies, targetId, replyData)) {
                return true;
            }
        }
    }
    return false;
};

export const replyToComment = async (postId: string, commentId: string, user: string, text: string, userAvatar?: string, replyToId?: string): Promise<IPost | null> => {
    // If replyToId is provided, we traverse. If not, we assume reply to root comment (commentId)
    // Note: The API route is /:postId/comments/:commentId/reply.
    // If we want nested, maybe we should just ignore commentId if replyToId is present, or restrict search to that comment tree?
    // Let's first try to find the post.
    const post = await Post.findById(postId);
    if (!post) return null;

    const replyData = {
        user,
        text,
        userAvatar,
        createdAt: new Date(),
        reactions: [],
        replies: []
    };

    const target = replyToId || commentId;

    // Find the root comment first
    const rootComment = post.commentsList.find((c: any) => c._id.toString() === commentId);
    if (!rootComment) return null;

    if (target === commentId) {
        // Direct reply to comment
        rootComment.replies.push(replyData);
    } else {
        // Deep reply. We search within this root comment's replies recursively.
        // We do this in JS.
        const found = findAndAddReply(rootComment.replies, target, replyData);
        if (!found) {
            // If not found in replies, maybe the target IS the root comment (handled above), or invalid.
            // Fallback: Add to root comment replies? Or error?
            // Let's add to root comment to be safe, but ideally we found it.
            return null; // or throw error
        }
    }

    return await post.save();
};

export const reactToComment = async (postId: string, commentId: string, userId: string, type: string): Promise<IPost | null> => {
    const post = await Post.findById(postId);
    if (!post) return null;

    // This handles root comments reactions.
    // DOES NOT handle nested reply reactions yet if commentId refers to a reply.
    // To support deep reaction, we need recursive search too.

    // Check root comments
    let targetItem: any = post.commentsList.find((c: any) => c._id.toString() === commentId);

    // Recursive search if not found at root
    if (!targetItem) {
        // Helper to find any item by ID in the tree
        const findItem = (items: any[]): any => {
            for (const item of items) {
                if (item._id.toString() === commentId) return item;
                if (item.replies) {
                    const found = findItem(item.replies);
                    if (found) return found;
                }
            }
            return null;
        };

        // Search all comments trees
        for (const comment of post.commentsList) {
            const found = findItem(comment.replies);
            if (found) {
                targetItem = found;
                break;
            }
        }
    }

    if (!targetItem) return null;

    const existingIdx = targetItem.reactions.findIndex((r: any) => r.user === userId);
    if (existingIdx > -1) {
        if (targetItem.reactions[existingIdx].type === type) {
            targetItem.reactions.splice(existingIdx, 1);
        } else {
            targetItem.reactions[existingIdx].type = type;
        }
    } else {
        targetItem.reactions.push({ user: userId, type });
    }

    return await post.save();
};

export const deletePost = async (id: string): Promise<IPost | null> => {
    return await Post.findByIdAndDelete(id);
};

export const getPostById = async (id: string): Promise<IPost | null> => {
    return await Post.findById(id);
};

export const updatePost = async (id: string, data: Partial<IPost>): Promise<IPost | null> => {
    return await Post.findByIdAndUpdate(id, data, { new: true });
};

export const incrementShares = async (id: string): Promise<void> => {
    await Post.findByIdAndUpdate(id, { $inc: { shares: 1 } });
};
