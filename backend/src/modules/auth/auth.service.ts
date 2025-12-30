import User, { IUser } from './auth.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'secret';

import Post from '../post/post.model';

export const register = async (userData: Partial<IUser>): Promise<IUser> => {
    // In production, validate fields
    const hashedPassword = await bcrypt.hash(userData.password!, 10);
    return await User.create({ ...userData, password: hashedPassword });
};

export const login = async (phone: string, password: string): Promise<{ user: IUser, token: string } | null> => {
    const user = await User.findOne({ phone });
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) return null;

    const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1d' });
    return { user, token };
};

export const updateUser = async (id: string, updates: Partial<IUser>): Promise<IUser | null> => {
    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) return null;

    if (updates.avatar) {
        // Cascade update avatar
        const name = user.name;
        // 1. Update posts by user
        await Post.updateMany({ user: name }, { userAvatar: updates.avatar }); // Post model has no userAvatar field at root? Wait.
        // Post has `user` string. It doesn't have `userAvatar` at root? 
        // Let's check Post interface.
        // It does NOT. It uses `initial` and `color`. 
        // Wait, SinglePost frontend uses `post.initial`.
        // BUT Comments DO have `userAvatar`.
        // So for Post author, we assume `initial` is derived or something?
        // Actually, PostSchema has `initial`, `color`. No `userAvatar`.
        // Frontend `SinglePost` uses `post.initial` div.
        // But the requirement says "profile picture jeno... post... show kore".
        // So I should arguably ADD `userAvatar` to `Post` model too, and display it instead of initials if present.

        // 2. Update comments
        await Post.updateMany(
            { "commentsList.user": name },
            { $set: { "commentsList.$[elem].userAvatar": updates.avatar } },
            { arrayFilters: [{ "elem.user": name }] }
        );

        // 3. Update replies
        await Post.updateMany(
            { "commentsList.replies.user": name },
            { $set: { "commentsList.$[].replies.$[reply].userAvatar": updates.avatar } },
            { arrayFilters: [{ "reply.user": name }] }
        );
    }

    return user;
};
