import { Request, Response } from 'express';
import * as postService from './post.service';

export const createPost = async (req: Request, res: Response) => {
    try {
        const post = await postService.createPost(req.body);
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error creating post', error });
    }
};

export const getPosts = async (req: Request, res: Response) => {
    try {
        const posts = await postService.getAllPosts();
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error });
    }
};

export const likePost = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId, type } = req.body;
        const post = await postService.likePost(id, userId, type);
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error reacting to post', error });
    }
};

export const addComment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { user, text, userAvatar } = req.body;
        const post = await postService.addComment(id, user, text, userAvatar);
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error adding comment', error });
    }
};

export const replyToComment = async (req: Request, res: Response) => {
    try {
        const { id, commentId } = req.params;
        const { user, text, userAvatar, replyToId } = req.body;
        const post = await postService.replyToComment(id, commentId, user, text, userAvatar, replyToId);
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error replying to comment', error });
    }
};

export const reactToComment = async (req: Request, res: Response) => {
    try {
        const { id, commentId } = req.params;
        const { userId, type } = req.body;
        const post = await postService.reactToComment(id, commentId, userId, type);
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error reacting to comment', error });
    }
};

export const sharePost = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { user, initial, color, text } = req.body;
        // Logic: Create a NEW Post that references the 'id' as sharedPost
        const newPost = await postService.createPost({
            user,
            initial,
            color,
            text: text || '', // Sharer's commentary
            sharedPost: id as any, // Cast because interface expects ObjectId or IPost, simplified for controller
            role: 'Farmer',
            commentsList: [],
            reactions: [],
            likes: 0,
            shares: 0 // New post has 0 shares
        });

        await postService.incrementShares(id);

        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ message: 'Error sharing post', error });
    }
};

export const deletePost = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const requester = (req.body && (req.body.user || req.body.userId)) as string | undefined;

        if (!requester) {
            return res.status(400).json({ message: 'user (owner) is required to delete a post' });
        }

        const post = await postService.getPostById(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.user !== requester) {
            return res.status(403).json({ message: 'You can only delete your own posts' });
        }

        await postService.deletePost(id);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting post', error });
    }
};
