import React, { useState } from 'react';
import { Send, Edit2, Trash2, X, Check, Flag } from 'lucide-react';
import ReportModal from './ReportModal'; // Import component dùng chung
import '../../Styles/CommentSection.css';

const CommentSection = ({ 
    postId, 
    comments, 
    commentInput, 
    setCommentInput, 
    handleSendComment, 
    handleImgError,
    onDeleteComment, 
    onUpdateComment, 
    onReportComment, 
    currentUserId 
}) => {
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editValue, setEditValue] = useState("");
    
    // State đơn giản cho Modal báo cáo dùng chung
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedCommentId, setSelectedCommentId] = useState(null);

    const formatTime = (dateString) => {
        if (!dateString) return "Vừa xong";
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + 
               ' ' + date.toLocaleDateString('vi-VN');
    };

    // Hàm mở modal báo cáo
    const openReportModal = (commentId) => {
        setSelectedCommentId(commentId);
        setIsReportModalOpen(true);
    };

    // Hàm xử lý gửi báo cáo sau khi nhận được lý do từ ReportModal
    const handleReportSubmit = (reason) => {
        if (typeof onReportComment === 'function' && selectedCommentId) {
            onReportComment(selectedCommentId, reason);
        }
        setIsReportModalOpen(false);
        setSelectedCommentId(null);
    };

    const handleUpdate = (commentId) => {
        if (!editValue.trim()) return;
        if (typeof onUpdateComment === 'function') {
            onUpdateComment(commentId, editValue);
        }
        setEditingCommentId(null);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSendComment();
        }
    };

    return (
        <div className="comments-section">
            <div className="comments-list">
                {comments && comments.length > 0 ? (
                    comments.map(comment => {
                        const isMyComment = Number(comment.UserID) === Number(currentUserId);
                        
                        return (
                            <div key={comment.CommentID} className="comment-item-container animate-fade-in">
                                <div className="comment-item">
                                    <img 
                                        src={comment.AvatarURL || '/assets/default-avatar.png'} 
                                        alt="avatar" 
                                        className="comment-avatar-inside" 
                                        onError={handleImgError} 
                                    />
                                    
                                    <div className="comment-content-box">
                                        <div className="comment-header-mini">
                                            <div className="comment-user-info">
                                                <span className="username-mini">{comment.Username}</span>
                                                <span className="user-badge-mini">Lv.{comment.Level || 0}</span>
                                                <span className="comment-time">{formatTime(comment.CreatedAt)}</span>
                                            </div>

                                            <div className="comment-actions-menu">
                                                {isMyComment ? (
                                                    <>
                                                        <button 
                                                            className="action-btn edit" 
                                                            onClick={() => {setEditingCommentId(comment.CommentID); setEditValue(comment.CommentText);}} 
                                                            title="Sửa"
                                                        >
                                                            <Edit2 size={12} />
                                                        </button>
                                                        <button 
                                                            className="action-btn delete" 
                                                            onClick={() => window.confirm("Xóa bình luận này?") && onDeleteComment(comment.CommentID)} 
                                                            title="Xóa"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button 
                                                        className="action-btn report" 
                                                        onClick={() => openReportModal(comment.CommentID)}
                                                        title="Báo cáo"
                                                    >
                                                        <Flag size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {editingCommentId === comment.CommentID ? (
                                            <div className="edit-comment-form">
                                                <textarea 
                                                    value={editValue} 
                                                    onChange={(e) => setEditValue(e.target.value)} 
                                                    className="edit-input-mini" 
                                                    autoFocus 
                                                    rows="2"
                                                />
                                                <div className="edit-buttons">
                                                    <button onClick={() => handleUpdate(comment.CommentID)} className="save-btn" title="Lưu">
                                                        <Check size={12} /> Lưu
                                                    </button>
                                                    <button onClick={() => setEditingCommentId(null)} className="cancel-btn" title="Hủy">
                                                        <X size={12} /> Hủy
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="comment-body">{comment.CommentText}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="no-comments">Chưa có bình luận nào. Hãy là người đầu tiên!</div>
                )}
            </div>
            
            {/* Modal Báo cáo Bình luận sử dụng Component dùng chung */}
            <ReportModal 
                isOpen={isReportModalOpen}
                title="Báo cáo bình luận"
                onClose={() => setIsReportModalOpen(false)}
                onSubmit={handleReportSubmit}
            />

            {/* Input gửi bình luận */}
            <div className="quick-comment-input-container">
                <input 
                    type="text" 
                    value={commentInput} 
                    onChange={(e) => setCommentInput(e.target.value)} 
                    onKeyDown={handleKeyDown}
                    placeholder="Viết bình luận..." 
                    className="comment-input-mini" 
                />
                <button 
                    onClick={handleSendComment} 
                    className="send-comment-mini"
                    disabled={!commentInput.trim()}
                >
                    <Send size={14} />
                </button>
            </div>
        </div>
    );
};

export default CommentSection;