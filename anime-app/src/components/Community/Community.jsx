import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import LeftSidebar from "./LeftSidebar.jsx";
import CreatePost from "./CreatePost.jsx";
import PostCard from "./PostCard.jsx"; 
import RightSidebar from "./RightSidebar.jsx";
import EditPostModal from "./EditPostModal.jsx";
import { UserContext } from '../../UserContext';
import '../../Styles/Community.css';

const Community = ({ setActiveTab }) => {
    const { user, loading } = useContext(UserContext) || { user: null, loading: false };
    const [posts, setPosts] = useState([]);
    
    const [isExpanded, setIsExpanded] = useState(false);
    const [content, setContent] = useState('');
    const [imageUrls, setImageUrls] = useState([]); 
    const [activeMenu, setActiveMenu] = useState(null);
    const [showComments, setShowComments] = useState({});
    const [postComments, setPostComments] = useState({});
    const [commentInput, setCommentInput] = useState({});
    
    const [editingPost, setEditingPost] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [editImageUrls, setEditImageUrls] = useState([]); 

    useEffect(() => { fetchPosts(); }, []);

    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/posts/community', {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            if (res.data) setPosts(res.data);
        } catch (err) { console.error("Lỗi fetch posts:", err); }
    };

    // --- XỬ LÝ BÀI VIẾT (POST) ---
    const handlePost = async () => {
        if (!content.trim() && imageUrls.length === 0) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/posts', 
                { content, imageUrl: imageUrls },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Đã đăng bài, chờ duyệt!");
            setContent(''); setImageUrls([]); setIsExpanded(false);
            fetchPosts();
        } catch (err) { alert("Lỗi đăng bài"); }
    };

    const handleEditOpen = (post) => {
        setEditingPost(post);
        setEditContent(post.Content);
        let imgs = [];
        if (Array.isArray(post.ImageUrl)) {
            imgs = [...post.ImageUrl];
        } else if (post.ImageUrl) {
            try {
                const parsed = JSON.parse(post.ImageUrl);
                imgs = Array.isArray(parsed) ? parsed : [post.ImageUrl];
            } catch (e) {
                imgs = post.ImageUrl.split(',');
            }
        }
        setEditImageUrls(imgs.map(u => String(u).trim()).filter(u => u !== ""));
    };

    const handleUpdatePost = async (e) => {
        if (e) e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/posts/${editingPost.PostID}`, 
                { content: editContent, imageUrl: editImageUrls },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPosts(prev => prev.map(p => 
                p.PostID === editingPost.PostID 
                ? { ...p, Content: editContent, ImageUrl: editImageUrls } : p
            ));
            alert("Cập nhật thành công!");
            setEditingPost(null);
        } catch (err) { alert("Lỗi cập nhật bài viết"); }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Bạn có chắc muốn xóa bài viết này?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPosts(prev => prev.filter(p => p.PostID !== postId));
        } catch (err) { alert("Lỗi xóa bài"); }
    };

    const handleInteraction = async (postId, type) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`http://localhost:5000/api/posts/${postId}/${type}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const { newLikes, newDislikes, UserLiked, UserDisliked } = res.data;
            setPosts(prev => prev.map(p => p.PostID === postId ? { ...p, LikesCount: newLikes, DislikesCount: newDislikes, UserLiked, UserDisliked } : p));
        } catch (err) { console.error("Lỗi tương tác:", err); }
    };

    const handleReportPost = async (postId, reason) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return alert("Bạn cần đăng nhập để thực hiện báo cáo!");

            const response = await axios.post('http://localhost:5000/api/reports', {
                targetType: 'Post',
                targetId: postId,
                reason: reason
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data) {
                alert(response.data.message); 
            }
        } catch (err) {
            console.error("Lỗi Report Post:", err.response?.data);
            alert(err.response?.data?.message || "Không thể gửi báo cáo vào lúc này.");
        }
    };

    const handleReportComment = async (postId, commentId, reason) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return alert("Bạn cần đăng nhập để thực hiện báo cáo!");

            const response = await axios.post('http://localhost:5000/api/reports', {
                targetType: 'Comment',
                targetId: commentId,
                reason: reason
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data) {
                alert(response.data.message);
            }
        } catch (err) {
            console.error("Lỗi Report Comment:", err.response?.data);
            alert(err.response?.data?.message || "Lỗi khi báo cáo bình luận.");
        }
    };

    // --- XỬ LÝ BÌNH LUẬN (COMMENT) ---
    const fetchComments = async (postId) => {
        const isShowing = showComments[postId];
        setShowComments(prev => ({ ...prev, [postId]: !isShowing }));
        if (!isShowing) {
            try {
                const res = await axios.get(`http://localhost:5000/api/posts/${postId}/comments`);
                setPostComments(prev => ({ ...prev, [postId]: res.data }));
            } catch (err) { console.error("Lỗi lấy bình luận:", err); }
        }
    };

    const handleSendComment = async (postId) => {
        const text = commentInput[postId];
        if (!text?.trim()) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/posts/${postId}/comments`, 
                { commentText: text }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCommentInput(prev => ({ ...prev, [postId]: '' }));
            const res = await axios.get(`http://localhost:5000/api/posts/${postId}/comments`);
            setPostComments(prev => ({ ...prev, [postId]: res.data }));
            setPosts(prev => prev.map(p => p.PostID === postId ? { ...p, CommentsCount: (p.CommentsCount || 0) + 1 } : p));
        } catch (err) { alert("Lỗi gửi bình luận"); }
    };

    const handleDeleteComment = async (postId, commentId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/posts/comments/${commentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPostComments(prev => ({
                ...prev,
                [postId]: prev[postId].filter(c => c.CommentID !== commentId)
            }));
            setPosts(prev => prev.map(p => p.PostID === postId ? { ...p, CommentsCount: Math.max(0, p.CommentsCount - 1) } : p));
        } catch (err) { alert("Lỗi xóa bình luận"); }
    };

    const handleUpdateComment = async (postId, commentId, newText) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/posts/comments/${commentId}`, 
                { commentText: newText },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPostComments(prev => ({
                ...prev,
                [postId]: prev[postId].map(c => c.CommentID === commentId ? { ...c, CommentText: newText } : c)
            }));
        } catch (err) { alert("Lỗi cập nhật bình luận"); }
    };

    const handleImgError = (e) => { e.target.src = '/assets/default-avatar.png'; };

    if (loading) return <div className="loading-screen">Đang tải DAWNANIME...</div>;

    return (
        <div className="community-container">
            <LeftSidebar setActiveTab={setActiveTab} />
            
            <main className="main-feed">
                <CreatePost 
                    isExpanded={isExpanded} setIsExpanded={setIsExpanded}
                    content={content} setContent={setContent}
                    imageUrls={imageUrls} setImageUrls={setImageUrls}
                    handlePost={handlePost}
                />

                <div className="posts-list">
                    {posts.length > 0 ? (
                        posts.map(post => (
                            <PostCard 
                                key={post.PostID} 
                                post={post}
                                activeMenu={activeMenu} 
                                setActiveMenu={setActiveMenu}
                                handleInteraction={handleInteraction}
                                handleDeletePost={handleDeletePost}
                                setEditingPost={handleEditOpen}
                                showComments={showComments}
                                fetchComments={fetchComments}
                                postComments={postComments}
                                commentInput={commentInput}
                                setCommentInput={setCommentInput}
                                handleSendComment={handleSendComment}
                                handleDeleteComment={handleDeleteComment}
                                handleUpdateComment={handleUpdateComment}
                                onReportPost={handleReportPost}         
                                onReportComment={handleReportComment}   
                                handleImgError={handleImgError}
                                currentUserId={user?.UserID}
                            />
                        ))
                    ) : (
                        <div className="empty-feed">Chưa có bài viết nào trong cộng đồng.</div>
                    )}
                </div>
            </main>

            <RightSidebar />
            
            {editingPost && (
                <EditPostModal 
                    editContent={editContent} setEditContent={setEditContent}
                    editImageUrls={editImageUrls} setEditImageUrls={setEditImageUrls}
                    onClose={() => setEditingPost(null)}
                    onSubmit={handleUpdatePost}
                />
            )}
        </div>
    );
};

export default Community;