import React, { useState } from 'react';
import type { Comment, Reply } from '../../types';

interface SinglePostProps {
    post: any;
    currentInitials: string;
    currentUserAvatar?: string;
    onReaction: (type: string) => void;
    onComment: (text: string) => void;
    onDelete?: () => void;
    onReply?: (rootCommentId: string, replyToId: string, text: string) => void;
    onCommentReaction?: (commentId: string, type: string) => void;
    onShare?: (text?: string) => void;
}

const timeAgo = (date: string | Date) => {
    if (!date) return '';
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
};

const CommentItem = ({
    comment,
    rootCommentId,
    level = 0,
    onReply,
    onReact,
    currentUserAvatar
}: {
    comment: Comment | Reply,
    rootCommentId?: string,
    level?: number,
    onReply?: (rootId: string, targetId: string, text: string) => void,
    onReact?: (id: string, type: string) => void,
    currentUserAvatar?: string
}) => {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState("");

    const effectiveRootId = level === 0 ? comment._id : rootCommentId!;

    const handleReplySubmit = () => {
        if (replyText.trim() && onReply) {
            onReply(effectiveRootId, comment._id, replyText);
            setReplyText("");
            setShowReplyInput(false);
        }
    };

    const initials = comment.userAvatar || comment.user.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
    const hasReplies = comment.replies && comment.replies.length > 0;

    return (
        <div className="relative">
            {/* Comment Row */}
            <div className="flex space-x-2.5 relative z-10 group">
                {/* Avatar */}
                <div className="flex-shrink-0 relative">
                    <div className={`rounded-full flex items-center justify-center text-gray-600 font-bold border border-white shadow-sm overflow-hidden ${level === 0 ? 'h-9 w-9 text-sm' : 'h-7 w-7 text-xs bg-gray-100'}`}>
                        {initials.length > 2 ? <img src={initials} alt={comment.user} className="w-full h-full object-cover" /> : initials}
                    </div>
                </div>

                {/* Content Bubble & Actions */}
                <div className="flex-grow max-w-[90%]">
                    <div className="inline-block">
                        <div className="bg-gray-100/90 rounded-2xl px-3.5 py-2 inline-block shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                            <h4 className="font-bold text-[13px] text-gray-900 leading-tight block mb-0.5 hover:underline cursor-pointer">{comment.user}</h4>
                            <p className="text-[14px] text-gray-800 leading-snug">{comment.text}</p>
                        </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center space-x-3 mt-1 ml-1 text-[12px] text-gray-500 font-medium">
                        <span className="cursor-pointer hover:underline text-gray-400">{timeAgo(comment.createdAt || new Date().toISOString())}</span>
                        {onReact && (
                            <button onClick={() => onReact(comment._id, 'like')} className="hover:text-brand-dark font-bold transition">Like</button>
                        )}
                        {onReply && (
                            <button onClick={() => setShowReplyInput(!showReplyInput)} className="hover:text-brand-dark font-bold transition">Reply</button>
                        )}
                        {(comment.reactions && comment.reactions.length > 0) && (
                            <div className="flex items-center bg-white rounded-full px-1.5 py-0.5 shadow-sm border border-gray-100 ml-auto cursor-pointer">
                                <span className="text-[10px] text-brand-dark">🌱 {comment.reactions.length}</span>
                            </div>
                        )}
                    </div>

                    {/* Reply Input */}
                    {showReplyInput && (
                        <div className="mt-2 flex items-center space-x-2 animate-fade-in relative z-20">
                            <div className="h-6 w-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border border-white shadow-sm">
                                {currentUserAvatar ? (
                                    <img src={currentUserAvatar} alt="Me" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-brand-light flex items-center justify-center text-[8px] text-white font-bold">ME</div>
                                )}
                            </div>
                            <div className="relative flex-grow">
                                <input
                                    type="text"
                                    className="bg-gray-100/50 border border-gray-200 rounded-2xl px-3 py-1.5 text-[13px] w-full focus:outline-none focus:border-gray-300 focus:bg-white transition"
                                    placeholder={`Reply to ${comment.user}...`}
                                    autoFocus
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit()}
                                />
                                <button onClick={handleReplySubmit} className="absolute right-2 top-1.5 text-brand-dark hover:text-green-700"><i className="fas fa-paper-plane text-xs"></i></button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Recursion - The Tree Structure */}
            {hasReplies && (
                <div className="pl-9 mt-1">
                    {comment.replies!.map((reply: any, idx: number) => {
                        const isLast = idx === comment.replies!.length - 1;
                        return (
                            <div key={reply._id || Math.random()} className="relative">
                                {/* Connector Lines */}
                                <div className={`absolute -left-[18px] -top-3 w-[18px] h-full border-l-[2px] border-gray-200 rounded-bl-[14px] ${isLast ? 'h-[24px]' : ''}`}></div>

                                <CommentItem
                                    comment={reply}
                                    rootCommentId={effectiveRootId}
                                    level={level + 1}
                                    onReply={onReply}
                                    onReact={onReact}
                                    currentUserAvatar={currentUserAvatar}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const SinglePost = ({
    post,
    currentInitials,
    currentUserAvatar,
    onReaction,
    onComment,
    onDelete,
    onReply,
    onCommentReaction,
    onShare
}: SinglePostProps) => {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [showReactions, setShowReactions] = useState(false);
    const [showShareInput, setShowShareInput] = useState(false);
    const [shareText, setShareText] = useState("");

    const handleCommentSubmit = () => {
        if (commentText.trim()) {
            onComment(commentText);
            setCommentText("");
            setShowComments(true);
        }
    };

    const handleShareSubmit = () => {
        if (onShare) {
            onShare(shareText);
            setShareText("");
            setShowShareInput(false);
        }
    };

    // Reaction Mapping
    const reactionIcons: Record<string, string> = {
        like: '🌱',
        love: '💚',
        haha: '🌻',
        wow: '🌽',
        sad: '🍂',
        angry: '🐛'
    };

    const reactionConfig = [
        { type: 'like', label: 'Support', icon: '🌱', color: 'text-green-600' },
        { type: 'love', label: 'Love', icon: '💚', color: 'text-red-500' },
        { type: 'haha', label: 'Happy', icon: '🌻', color: 'text-yellow-400' },
        { type: 'wow', label: 'Bumper', icon: '🌽', color: 'text-yellow-500' },
        { type: 'sad', label: 'Loss', icon: '🍂', color: 'text-orange-700' },
        { type: 'angry', label: 'Pest', icon: '🐛', color: 'text-red-700' },
    ];

    const currentReaction = post.reactions?.find((r: any) => r.user === post.currentUser) ||
        (post.isLiked ? { type: 'like' } : null);

    const reactionCounts = post.reactions?.reduce((acc: any, curr: any) => {
        acc[curr.type] = (acc[curr.type] || 0) + 1;
        return acc;
    }, {}) || {};

    const totalReactions = post.reactions?.length || post.likes || 0;

    const countComments = (comments: any[]): number => {
        if (!comments) return 0;
        return comments.reduce((acc, curr) => {
            return acc + 1 + (curr.replies ? countComments(curr.replies) : 0);
        }, 0);
    };

    const totalComments = countComments(post.commentsList);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in relative z-0 mb-4 mx-1">
            {onDelete && (
                <div className="absolute top-4 right-4 z-10">
                    <button onClick={onDelete} className="bg-white/80 p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition shadow-sm border border-gray-100"><i className="fas fa-trash-alt"></i></button>
                </div>
            )}

            <div className="p-4 flex justify-between items-start">
                <div className="flex items-center space-x-3">
                    {post.userAvatar ? (
                        <img src={post.userAvatar} alt={post.user} className="h-10 w-10 rounded-full object-cover border border-gray-100" />
                    ) : (
                        <div className={`h-10 w-10 bg-${post.color || 'green'}-100 rounded-full flex items-center justify-center text-${post.color || 'green'}-600 font-bold text-sm`}>{post.initial}</div>
                    )}
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm">{post.user}</h3>
                        <p className="text-xs text-gray-500 cursor-pointer hover:underline">
                            {post.time || timeAgo(post.createdAt)} • <i className="fas fa-globe-asia"></i>
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-4 pb-2">
                {post.text && <p className="text-gray-700 text-base leading-relaxed mb-3">{post.text}</p>}

                {post.sharedPost ? (
                    <div className="border border-gray-200 rounded-xl overflow-hidden mt-2 mb-2">
                        <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center space-x-2">
                            {post.sharedPost.userAvatar ? (
                                <img src={post.sharedPost.userAvatar} alt={post.sharedPost.user} className="h-8 w-8 rounded-full object-cover border border-gray-200" />
                            ) : (
                                <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-xs text-gray-700">{(post.sharedPost.initial || 'U')}</div>
                            )}
                            <div>
                                <h4 className="font-bold text-sm text-gray-900">{post.sharedPost.user}</h4>
                                <p className="text-xs text-gray-500">{timeAgo(post.sharedPost.createdAt)}</p>
                            </div>
                        </div>
                        <div className="p-3 bg-white">
                            <p className="text-gray-800 text-sm mb-2">{post.sharedPost.text}</p>
                            {post.sharedPost.mediaType === 'image' && post.sharedPost.mediaSrc && (
                                <div className="rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                                    <img src={post.sharedPost.mediaSrc} className="w-full h-auto max-h-[400px] object-cover" alt="Shared content" />
                                </div>
                            )}
                            {post.sharedPost.mediaType === 'video' && post.sharedPost.mediaSrc && (
                                <div className="rounded-lg overflow-hidden border border-gray-100 bg-black"><video src={post.sharedPost.mediaSrc} controls className="w-full h-auto max-h-[400px]"></video></div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {post.mediaType === 'image' && post.mediaSrc && (
                            <div className="rounded-lg overflow-hidden border border-gray-100 bg-gray-50 cursor-pointer">
                                <img src={post.mediaSrc} className="w-full h-auto max-h-[600px] object-contain mx-auto" alt="Post content" loading="lazy" />
                            </div>
                        )}
                        {post.mediaType === 'video' && post.mediaSrc && (
                            <div className="rounded-lg overflow-hidden border border-gray-100 bg-black"><video src={post.mediaSrc} controls className="w-full h-auto max-h-[600px]"></video></div>
                        )}
                    </>
                )}
            </div>

            <div className="px-4 py-2">
                <div className="flex justify-between items-center text-xs text-gray-500 border-b border-gray-50 pb-2 mb-2">
                    <div className="flex items-center space-x-1">
                        {totalReactions > 0 && (
                            <>
                                <div className="flex -space-x-1">
                                    {Object.keys(reactionCounts).slice(0, 3).map(type => (
                                        <span key={type} className="bg-white rounded-full p-0.5 border border-white text-[10px] scale-110 shadow-sm relative z-10">{reactionIcons[type]}</span>
                                    ))}
                                </div>
                                <span className="ml-1 hover:underline cursor-pointer">{totalReactions}</span>
                            </>
                        )}
                    </div>
                    <div className="flex space-x-3">
                        <span className="hover:underline cursor-pointer">{totalComments} comments</span>
                        <button onClick={() => setShowShareInput(prev => !prev)} className="hover:underline cursor-pointer">
                            {post.shares > 0 ? `${post.shares} shares` : 'Share'}
                        </button>
                    </div>
                </div>

                {showShareInput && (
                    <div className="mb-3 flex items-center space-x-2 animate-fade-in relative z-20">
                        <input
                            type="text"
                            className="bg-gray-100/50 border border-gray-200 rounded-full px-4 py-2 text-sm w-full focus:outline-none focus:border-brand-dark focus:bg-white transition"
                            placeholder="Write a thought about this post..."
                            autoFocus
                            value={shareText}
                            onChange={(e) => setShareText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleShareSubmit()}
                        />
                        <button onClick={handleShareSubmit} className="bg-green-600 text-white px-4 py-1.5 rounded-full text-sm hover:bg-green-700 transition">Share Now</button>
                    </div>
                )}

                <div className="flex justify-between items-center">
                    {/* Reaction Button */}
                    <div
                        className="relative group flex-1"
                        onMouseEnter={() => setShowReactions(true)}
                        onMouseLeave={() => setShowReactions(false)}
                    >
                        <div className={`absolute bottom-full left-0 mb-2 transition-all duration-300 transform origin-bottom-left z-50 ${showReactions ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
                            <div className="bg-white rounded-full shadow-xl border border-gray-100 p-1.5 flex space-x-1 animate-bounce-subtle">
                                {reactionConfig.map((r) => (
                                    <button
                                        key={r.type}
                                        onClick={() => { onReaction(r.type); setShowReactions(false); }}
                                        className="hover:scale-125 transition-transform duration-200 p-1.5 rounded-full hover:bg-green-50 text-2xl"
                                        title={r.label}
                                    >
                                        {r.icon}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => onReaction(currentReaction?.type || 'like')}
                            className={`w-full flex justify-center items-center space-x-2 py-2 rounded-lg hover:bg-gray-50 transition active:scale-95 ${currentReaction ? 'text-green-600' : 'text-gray-500'}`}
                        >
                            <span className="text-xl">
                                {currentReaction ? reactionIcons[currentReaction.type] || '👍' : '👍'}
                            </span>
                            <span className={`text-sm font-semibold ${currentReaction ? 'text-brand-dark' : ''}`}>
                                {currentReaction ? reactionConfig.find(r => r.type === currentReaction.type)?.label : 'Like'}
                            </span>
                        </button>
                    </div>

                    <button onClick={() => setShowComments(!showComments)} className="flex-1 flex justify-center items-center space-x-2 py-2 rounded-lg hover:bg-gray-50 transition text-gray-500 active:scale-95">
                        <i className="far fa-comment text-lg"></i>
                        <span className="text-sm font-semibold">Comment</span>
                    </button>

                    <button onClick={() => setShowShareInput(prev => !prev)} className="flex-1 flex justify-center items-center space-x-2 py-2 rounded-lg hover:bg-gray-50 transition text-gray-500 active:scale-95">
                        <i className="fas fa-share text-lg"></i>
                        <span className="text-sm font-semibold">Share</span>
                    </button>
                </div>
            </div>

            {showComments && (
                <div className="bg-gray-50 p-4 border-t border-gray-100">
                    <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {post.commentsList && post.commentsList.length > 0 ? post.commentsList.map((c: any) => (
                            <CommentItem
                                key={c._id || Math.random()}
                                comment={c}
                                onReply={onReply}
                                onReact={onCommentReaction}
                                currentUserAvatar={currentUserAvatar}
                            />
                        )) : (
                            <p className="text-center text-gray-400 text-sm py-4">No comments yet.</p>
                        )}
                    </div>

                    <div className="flex items-start space-x-2 sticky bottom-0 bg-gray-50 pt-2">
                        {currentUserAvatar ? (
                            <img src={currentUserAvatar} alt="Me" className="h-8 w-8 rounded-full object-cover border border-gray-200 shadow-sm" />
                        ) : (
                            <div className="h-8 w-8 bg-brand-light rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm border border-white">{currentInitials}</div>
                        )}
                        <div className="flex-grow relative">
                            <input
                                type="text"
                                placeholder="Write a comment..."
                                className="w-full bg-white border border-gray-300 rounded-full pl-4 pr-10 py-2 text-sm focus:outline-none focus:border-brand-dark focus:ring-1 focus:ring-brand-light transition"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
                            />
                            <button onClick={handleCommentSubmit} className="absolute right-2 top-1.5 text-brand-dark hover:text-green-700 p-1 rounded-full hover:bg-green-50 transition"><i className="fas fa-paper-plane"></i></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SinglePost;
