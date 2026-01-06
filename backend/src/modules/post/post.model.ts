import mongoose, { Schema, Document } from 'mongoose';

export interface IReaction {
    user: string;
    type: string;
}

export interface IReply {
    user: string;
    userAvatar?: string;
    text: string;
    createdAt: Date;
    reactions: IReaction[];
    replies?: IReply[];
}

export interface IComment {
    user: string;
    userAvatar?: string;
    text: string;
    createdAt: Date;
    reactions: IReaction[];
    replies: IReply[];
}

export interface IPost extends Document {
    user: string;
    role: string;
    initial: string;
    color: string;
    text: string;
    likes: number;
    reactions: IReaction[];
    commentsList: IComment[];
    mediaType: 'image' | 'video' | null;
    mediaSrc: string | null;
    marketStatus?: 'sold-out' | 'available';
    sharedPost?: IPost | Schema.Types.ObjectId;
    shares: number;
    userAvatar?: string;
    createdAt: Date;
}

const ReactionSchema = new Schema({
    user: { type: String, required: true },
    type: { type: String, default: 'like' }
}, { _id: false });

const ReplySchema = new Schema({
    user: { type: String, required: true },
    userAvatar: { type: String },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    reactions: [ReactionSchema]
});
// Self reference for nested replies
ReplySchema.add({ replies: [ReplySchema] });

const CommentSchema = new Schema({
    user: { type: String, required: true },
    userAvatar: { type: String },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    reactions: [ReactionSchema],
    replies: [ReplySchema]
});

const PostSchema: Schema = new Schema({
    user: { type: String, required: true },
    role: { type: String, default: 'Farmer' },
    initial: { type: String },
    color: { type: String, default: 'green' },
    text: { type: String },
    reactions: [ReactionSchema],
    likes: { type: Number, default: 0 },
    commentsList: [CommentSchema],
    mediaType: { type: String, enum: ['image', 'video', null], default: null },
    mediaSrc: { type: String, default: null },
    marketStatus: { type: String, enum: ['sold-out', 'available'], default: undefined },
    sharedPost: { type: Schema.Types.ObjectId, ref: 'Post', default: null },
    shares: { type: Number, default: 0 },
    userAvatar: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPost>('Post', PostSchema);
