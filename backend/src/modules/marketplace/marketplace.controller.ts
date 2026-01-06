import { Request, Response } from 'express';
import * as marketService from './marketplace.service';
import * as postService from '../post/post.service';
import Post from '../post/post.model';

export const createCrop = async (req: Request, res: Response) => {
    try {
        const { name, qty, price, icon, color, contact, notes, imageUrl, user, shareToFeed, soldOut } = req.body;

        if (!name || qty === undefined || price === undefined || !contact) {
            return res.status(400).json({ message: 'name, qty, price, contact are required' });
        }

        const cropPayload = {
            name,
            qty,
            price,
            icon,
            color,
            contact,
            notes,
            imageUrl,
            soldOut: !!soldOut,
            user: user || 'Farmer'
        } as any;

        const crop = await marketService.createCrop(cropPayload);

        if (shareToFeed) {
            const sellerName = crop.user || 'Farmer';
            const initials = sellerName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
            const postText = [
                '📢 নতুন বিক্রয় বিজ্ঞপ্তি!',
                `ফসল: ${crop.name}`,
                `পরিমাণ: ${crop.qty} কেজি`,
                `দাম: ৳${crop.price}/কেজি`,
                `যোগাযোগ: ${crop.contact}`,
                notes ? `নোট: ${notes}` : null
            ].filter(Boolean).join('\n');

            const post = await postService.createPost({
                user: sellerName,
                role: 'Farmer',
                initial: initials,
                color: crop.color || 'green',
                text: postText,
                mediaType: imageUrl ? 'image' : null,
                mediaSrc: imageUrl || null,
                marketStatus: crop.soldOut ? 'sold-out' : 'available',
                commentsList: [],
                reactions: [],
                likes: 0
            });

            await marketService.updateCrop(crop._id.toString(), { communityPostId: post._id as any });
            crop.communityPostId = post._id as any;
        }

        res.status(201).json(crop);
    } catch (error) {
        res.status(500).json({ message: 'Error creating crop', error });
    }
};

export const getCrops = async (req: Request, res: Response) => {
    try {
        const crops = await marketService.getAllCrops();
        res.status(200).json(crops);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching crops', error });
    }
};

export const updateCrop = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const requester = (req.body && (req.body.user || req.body.userId)) as string | undefined;

        if (!requester) {
            return res.status(400).json({ message: 'user (owner) is required to update a crop' });
        }

        const existing = await marketService.getCropById(id);
        if (!existing) {
            return res.status(404).json({ message: 'Crop not found' });
        }

        if (existing.user !== requester) {
            return res.status(403).json({ message: 'You can only update your own crop' });
        }

        const crop = await marketService.updateCrop(id, req.body);

        // Sync linked community post if exists
        if (existing.communityPostId) {
            const postText = [
                '📢 নতুন বিক্রয় বিজ্ঞপ্তি!',
                `ফসল: ${crop?.name}`,
                `পরিমাণ: ${crop?.qty} কেজি`,
                `দাম: ৳${crop?.price}/কেজি`,
                `যোগাযোগ: ${crop?.contact}`,
                crop?.notes ? `নোট: ${crop?.notes}` : null
            ]
                .filter(Boolean)
                .join('\n');

            await postService.updatePost(existing.communityPostId.toString(), {
                text: postText,
                mediaType: crop?.imageUrl ? 'image' : null,
                mediaSrc: crop?.imageUrl || null,
                marketStatus: crop?.soldOut ? 'sold-out' : 'available',
                color: crop?.color || 'green'
            });
        }

        res.status(200).json(crop);
    } catch (error) {
        res.status(500).json({ message: 'Error updating crop', error });
    }
};

export const deleteCrop = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const requester = (req.body && (req.body.user || req.body.userId)) as string | undefined;

        if (!requester) {
            return res.status(400).json({ message: 'user (owner) is required to delete a crop' });
        }

        const existing = await marketService.getCropById(id);
        if (!existing) {
            return res.status(404).json({ message: 'Crop not found' });
        }

        if (existing.user !== requester) {
            return res.status(403).json({ message: 'You can only delete your own crop' });
        }

        await marketService.deleteCrop(id);

        if (existing.communityPostId) {
            await postService.deletePost(existing.communityPostId.toString());
        }

        res.status(200).json({ message: 'Crop deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting crop', error });
    }
};
