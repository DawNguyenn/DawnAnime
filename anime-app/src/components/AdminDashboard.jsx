import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  FaUsers, FaClipboardCheck, FaSignOutAlt,
  FaCheck, FaTrash, FaHome, FaFileAlt, FaSync, FaExclamationTriangle, FaTimes
} from 'react-icons/fa';
import PostImageGrid from './Community/PostImageGrid';
import '../Styles/AdminDashboard.css';

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const API_BASE = 'http://localhost:5000/api/admin';

  const parseImages = (imageSource) => {
    if (!imageSource) return [];
    try {
      const parsed = typeof imageSource === 'string' ? JSON.parse(imageSource) : imageSource;
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      return [imageSource];
    }
  };

  const handleImgError = (e) => {
    e.target.src = 'https://placehold.co/600x400?text=Image+Error';
  };

  const fetchContent = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return onLogout();

    setLoading(true);
    let endpoint = '/pending-posts';
    if (activeTab === 'all') endpoint = '/all-posts';
    if (activeTab === 'users') endpoint = '/users';
    if (activeTab === 'reports') endpoint = '/reports';

    try {
      const res = await axios.get(`${API_BASE}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data || []);
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
      if (err.response?.status === 401 || err.response?.status === 403) onLogout();
    } finally {
      setLoading(false);
    }
  }, [activeTab, onLogout]);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  const handleAction = async (postId, newStatus) => {
    try {
      setActionLoading(postId);
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/update-post-status`, { postId, newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(prev => prev.filter(item => item.PostID !== postId));
    } catch (err) { 
      alert("Thao tác thất bại!"); 
    } finally { 
      setActionLoading(null); 
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm("Xóa vĩnh viễn bài viết này?")) return;
    try {
      setActionLoading(postId);
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/delete-post/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(prev => prev.filter(item => item.PostID !== postId));
    } catch (err) { 
      alert("Không thể xóa!"); 
    } finally { 
      setActionLoading(null); 
    }
  };

  const dismissReport = async (reportId) => {
    try {
      setActionLoading(`report-dismiss-${reportId}`);
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE}/reports/${reportId}/dismiss`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(prev => prev.filter(item => item.ReportID !== reportId));
    } catch (err) {
      alert("Không thể bỏ qua báo cáo!");
    } finally {
      setActionLoading(null);
    }
  };

  const resolveReport = async (reportId) => {
    if (!window.confirm("Xác nhận nội dung vi phạm và xóa vĩnh viễn?")) return;
    try {
      setActionLoading(`report-resolve-${reportId}`);
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/reports/${reportId}/resolve`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(prev => prev.filter(item => item.ReportID !== reportId));
    } catch (err) { 
      alert("Lỗi khi xử lý vi phạm!"); 
    } finally { 
      setActionLoading(null); 
    }
  };

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="sidebar-logo">DAWN <span>ADMIN</span></div>
        <nav className="sidebar-nav">
          <button className="btn-home" onClick={() => window.location.href = '/'}><FaHome /> Trang chủ</button>
          <button className={activeTab === 'pending' ? 'active' : ''} onClick={() => setActiveTab('pending')}><FaClipboardCheck /> Chờ duyệt</button>
          <button className={activeTab === 'all' ? 'active' : ''} onClick={() => setActiveTab('all')}><FaFileAlt /> Kho bài viết</button>
          <button className={activeTab === 'reports' ? 'active-orange' : ''} onClick={() => setActiveTab('reports')}><FaExclamationTriangle /> Trung tâm tố cáo</button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}><FaUsers /> Thành viên</button>
        </nav>
        <button className="btn-logout" onClick={onLogout}><FaSignOutAlt /> Thoát</button>
      </aside>

      <main className="admin-main">
        <header className="main-header">
          <h2>
            {activeTab === 'pending' ? "Hàng đợi phê duyệt" :
              activeTab === 'all' ? "Quản lý bài viết" :
                activeTab === 'reports' ? "Báo cáo vi phạm" : "Quản lý người dùng"}
          </h2>
          <button onClick={fetchContent} className={`btn-refresh ${loading ? 'animate-spin' : ''}`}><FaSync /></button>
        </header>

        {loading ? (
          <div className="admin-loading-state">Đang truy xuất dữ liệu...</div>
        ) : (
          <div className="content-list">
            {/* RENDER BÀI VIẾT (PENDING & ALL) */}
            {(activeTab === 'pending' || activeTab === 'all') && data.map(post => {
              const images = parseImages(post.ImageUrl);
              return (
                <div key={post.PostID} className={`admin-card ${actionLoading === post.PostID ? 'loading' : ''}`}>
                  <div className="card-body">
                    <div className="card-meta">
                      <span className="username">@{post.Username}</span>
                      <span className="date">{new Date(post.CreatedAt).toLocaleString('vi-VN')}</span>
                    </div>
                    <p className="post-text">{post.Content}</p>
                    {images.length > 0 && (
                      <div className="admin-post-media">
                        <PostImageGrid imageUrl={images} handleImgError={handleImgError} />
                      </div>
                    )}
                  </div>
                  <div className="card-actions">
                    {activeTab === 'pending' ? (
                      <>
                        <button className="btn-icon approve" title="Duyệt bài" onClick={() => handleAction(post.PostID, 1)}><FaCheck /></button>
                        <button className="btn-icon reject" title="Từ chối" onClick={() => handleAction(post.PostID, 2)}><FaTimes /></button>
                      </>
                    ) : (
                      <button className="btn-icon delete" title="Xóa bài" onClick={() => deletePost(post.PostID)}><FaTrash /></button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* RENDER TRUNG TÂM TỐ CÁO */}
            {activeTab === 'reports' && data.map(report => {
              const reportImages = parseImages(report.TargetImageUrl);
              const isProcessing = actionLoading === `report-resolve-${report.ReportID}` || actionLoading === `report-dismiss-${report.ReportID}`;
              
              return (
                <div key={report.ReportID} className={`admin-card report-card ${isProcessing ? 'loading' : ''}`}>
                  <div className="card-body">
                    <div className="card-meta">
                      <span className="report-badge">{report.TargetType === 'Post' ? 'BÀI VIẾT' : 'BÌNH LUẬN'}</span>
                      <span className="date">Báo cáo bởi: <strong>@{report.ReporterName}</strong></span>
                    </div>
                    <div className="report-target-content">
                        <strong>Nội dung bị tố cáo:</strong>
                        <p>"{report.TargetContent || "Nội dung không khả dụng"}"</p>
                    </div>

                    {report.TargetType === 'Post' && reportImages.length > 0 && (
                      <div className="admin-post-media">
                        <PostImageGrid imageUrl={reportImages} handleImgError={handleImgError} />
                      </div>
                    )}
                    <p className="report-reason">⚠️ <strong>Lý do:</strong> {report.Reason}</p>
                  </div>
                  <div className="card-actions">
                    {/* Nút Bỏ qua báo cáo */}
                    <button className="btn-icon approve" title="Bỏ qua (Nội dung hợp lệ)" onClick={() => dismissReport(report.ReportID)}>
                      <FaCheck />
                    </button>
                    {/* Nút Xóa nội dung vi phạm */}
                    <button className="btn-icon reject" title="Xác nhận vi phạm & Xóa" onClick={() => resolveReport(report.ReportID)}>
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* RENDER USERS */}
            {activeTab === 'users' && (
              <div className="table-wrapper">
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>Thành viên</th>
                      <th>Email</th>
                      <th>Cấp độ & EXP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map(user => (
                      <tr key={user.UserID}>
                        <td className="user-tag">@{user.Username}</td>
                        <td className="user-email">{user.Email}</td>
                        <td>
                          <div className="exp-info">
                            <span className="level-text">Level {user.Level}</span>
                            <span className="exp-text">{user.exp || 0}/1000</span>
                          </div>
                          <div className="exp-container">
                            <div className="exp-fill" style={{ width: `${Math.min(((user.exp || 0) / 1000) * 100, 100)}%` }}></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;