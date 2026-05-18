import React, { useState, useMemo } from 'react';
import { Heart, MessageSquare, ThumbsDown, MoreVertical, Edit2, Trash2, Flag } from 'lucide-react';
import CommentSection from './CommentSection';
import PostImageGrid from './PostImageGrid'; 
import ReportModal from './ReportModal'; 

import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";

import '../../Styles/PostCard.css';

const PostCard = ({ 
    post, 
    activeMenu, 
    setActiveMenu, 
    handleInteraction, 
    handleDeletePost, 
    setEditingPost,
    showComments, 
    fetchComments, 
    postComments, 
    commentInput, 
    setCommentInput, 
    handleSendComment, 
    handleImgError, 
    currentUserId,
    handleDeleteComment,  
    handleUpdateComment,  
    onReportPost,      
    onReportComment    
}) => {
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [imgIndex, setImgIndex] = useState(-1);

    const isMyPost = Number(currentUserId) === Number(post.UserID);

    const imageSources = useMemo(() => {
        const rawData = post.ImageUrl;
        if (!rawData) return [];
        
        if (Array.isArray(rawData)) {
            return rawData.filter(url => url && String(url).trim() !== "");
        }

        if (typeof rawData === 'string') {
            const trimmed = rawData.trim();
            if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                try {
                    const parsed = JSON.parse(trimmed);
                    return Array.isArray(parsed) ? parsed : [trimmed];
                } catch (e) {
                    return [trimmed];
                }
            }
            return trimmed.split(',').map(url => url.trim()).filter(url => url !== "");
        }
        return [];
    }, [post.ImageUrl]);

    const slides = useMemo(() => imageSources.map(src => ({ src })), [imageSources]);

    const handleReportSubmit = (reason) => {
        if (typeof onReportPost === 'function') {
            onReportPost(post.PostID, reason);
        }
        setIsReportModalOpen(false);
    };

    return (
        <div className="post-card animate-slide-up">
            <div className="post-header">
                <div className="post-user-info-group">
                    <img 
                        src={post.AvatarURL || '/assets/default-avatar.png'} 
                        alt="avatar" 
                        className="author-avatar" 
                        onError={handleImgError} 
                    />
                    <div className="author-details">
                        <div className="author-name-row">
                            <strong className="username">{post.Username}</strong>
                            <span className="user-badge">Lv.{post.Level || 0}</span>
                        </div>
                        <span className="post-time">
                            {post.CreatedAt ? new Date(post.CreatedAt).toLocaleString('vi-VN') : 'Vừa xong'}
                        </span>
                    </div>
                </div>
                
                <div className="post-options-container">
                    <button 
                        className="options-btn" 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            setActiveMenu(activeMenu === post.PostID ? null : post.PostID); 
                        }}
                    >
                        <MoreVertical size={20} />
                    </button>
                    
                    {activeMenu === post.PostID && (
                        <div className="options-menu">
                            {isMyPost ? (
                                <>
                                    <button className="menu-item" onClick={() => { setEditingPost(post); setActiveMenu(null); }}>
                                        <Edit2 size={14} /> <span>Chỉnh sửa</span>
                                    </button>
                                    <button className="menu-item delete" onClick={() => { 
                                        if(window.confirm("Xóa bài viết này?")) handleDeletePost(post.PostID); 
                                        setActiveMenu(null); 
                                    }}>
                                        <Trash2 size={14} /> <span>Xóa bài</span>
                                    </button>
                                </>
                            ) : (
                                <button className="menu-item report" onClick={() => { setIsReportModalOpen(true); setActiveMenu(null); }}>
                                    <Flag size={14} /> <span>Báo cáo</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="post-body">
                <p className="post-content">{post.Content}</p>
                
                <PostImageGrid 
                    imageUrl={imageSources} 
                    handleImgError={handleImgError} 
                    onImageClick={(index) => setImgIndex(index)} 
                />
            </div>

            {slides.length > 0 && (
                <Lightbox
                    index={imgIndex}
                    open={imgIndex >= 0}
                    close={() => setImgIndex(-1)}
                    slides={slides}
                    plugins={[Zoom, Counter]}
                />
            )}

            <div className="post-actions">
                <button className={`action-btn heart-btn ${post.UserLiked ? 'active' : ''}`} onClick={() => handleInteraction(post.PostID, 'like')}>
                    <Heart size={20} fill={post.UserLiked ? "#ef4444" : "none"} stroke={post.UserLiked ? "#ef4444" : "currentColor"} />
                    <span>{post.LikesCount || 0}</span>
                </button>

                <button className={`action-btn dislike-btn ${post.UserDisliked ? 'active' : ''}`} onClick={() => handleInteraction(post.PostID, 'dislike')}>
                    <ThumbsDown size={20} fill={post.UserDisliked ? "#6b7280" : "none"} stroke={post.UserDisliked ? "#6b7280" : "currentColor"} />
                    <span>{post.DislikesCount || 0}</span>
                </button>

                <button className="action-btn comment-btn" onClick={() => fetchComments(post.PostID)}>
                    <MessageSquare size={20} />
                    <span>{post.CommentsCount || 0}</span>
                </button>
            </div>

            {/* Sử dụng Component ReportModal cho bài viết */}
            <ReportModal 
                isOpen={isReportModalOpen}
                title="Báo cáo bài viết"
                onClose={() => setIsReportModalOpen(false)}
                onSubmit={handleReportSubmit}
            />

            {/* Render CommentSection */}
            {showComments[post.PostID] && (
                <div className="post-comments-wrapper">
                    <CommentSection 
                        postId={post.PostID}
                        comments={postComments[post.PostID] || []}
                        commentInput={commentInput[post.PostID] || ''}
                        setCommentInput={(val) => setCommentInput(prev => ({ ...prev, [post.PostID]: val }))}
                        handleSendComment={() => handleSendComment(post.PostID)}
                        handleImgError={handleImgError}
                        currentUserId={currentUserId}
                        onDeleteComment={(commentId) => {
                            if (typeof handleDeleteComment === 'function') {
                                handleDeleteComment(post.PostID, commentId);
                            }
                        }}
                        onUpdateComment={(commentId, newText) => {
                            if (typeof handleUpdateComment === 'function') {
                                handleUpdateComment(post.PostID, commentId, newText);
                            }
                        }}
                        onReportComment={(commentId, reason) => {
                            if (typeof onReportComment === 'function') {
                                onReportComment(post.PostID, commentId, reason);
                            }
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default PostCard;