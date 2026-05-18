import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from "../UserContext.jsx";
import { Save, RefreshCcw, Edit3, XCircle, Star } from 'lucide-react'; 
import '../Styles/Profile.css';

const Profile = () => {
    const { user, setUser } = useContext(UserContext);
    
    const [userData, setUserData] = useState(user || {});
    const [isEditing, setIsEditing] = useState(false);
    
    const [newName, setNewName] = useState('');
    const [newAvatar, setNewAvatar] = useState('');
    const [newBio, setNewBio] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setUserData(user);
            setNewName(user.Username || '');
            setNewAvatar(user.AvatarURL || '');
            setNewBio(user.Bio || '');
        }
    }, [user]);

    const currentExp = Number(userData.exp || 0); 
    const nextLevelExp = (userData.Level || 1) * 1000;
    const expPercentage = Math.min((currentExp / nextLevelExp) * 100, 100);

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!newName.trim()) {
            alert("Tên hiển thị không được để trống!");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put('http://localhost:5000/api/auth/update-profile', 
                { 
                    Username: newName.trim(), 
                    AvatarURL: newAvatar.trim(), 
                    Bio: newBio.trim() 
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data && res.data.user) {
                const updated = res.data.user;
                setUserData(updated);
                setUser(updated);
                setIsEditing(false);
                alert("Hồ sơ DAWN ANIME đã được cập nhật!");
            }
        } catch (err) {
            console.error("Lỗi cập nhật:", err);
            alert(err.response?.data?.message || "Cập nhật thất bại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-card">
                {/* Header: Avatar & Rank Info */}
                <div className="avatar-wrapper relative">
                    <img 
                        src={userData.AvatarURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.Username)}&background=random`} 
                        alt="Profile" 
                        className={`profile-avatar-img border-4 ${currentExp > 5000 ? 'border-yellow-400' : 'border-red-600'}`} 
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                    />
                    {userData.Level >= 10 && (
                        <div className="absolute -bottom-2 -right-2 bg-yellow-400 p-1.5 rounded-lg shadow-lg">
                            <Star fill="black" size={16} />
                        </div>
                    )}
                </div>

                <div className="profile-display-info" style={{ textAlign: 'center' }}>
                    <div className="profile-level-badge">CẤP {userData.Level || 1}</div>
                    <h2 className="user-name-title italic uppercase font-black tracking-tighter">
                        {userData.Username || "Thành viên"}
                    </h2>
                    
                    {/* Thanh kinh nghiệm đồng bộ với Ranking*/}
                    <div className="exp-bar-outer mt-4">
                        <div className="exp-bar-container bg-zinc-800 h-4 rounded-full overflow-hidden border border-zinc-700 shadow-inner">
                            <div 
                                className="exp-bar-fill bg-gradient-to-r from-red-600 to-red-400 h-full transition-all duration-1000 ease-out relative" 
                                style={{ width: `${expPercentage}%` }}
                            >
                                {expPercentage > 10 && (
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-2 px-1">
                            <p className="exp-text text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                                Kinh nghiệm: <strong>{currentExp.toLocaleString()}</strong> XP
                            </p>
                            <p className="text-[10px] font-black text-red-500 uppercase">
                                {expPercentage.toFixed(1)}%
                            </p>
                        </div>
                    </div>
                </div>

                <hr className="my-6 border-zinc-800" />

                {/* Phần thông tin chi tiết */}
                {!isEditing ? (
                    <div className="view-mode-content space-y-4">
                        <div className="info-item bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                            <label className="text-[10px] uppercase text-zinc-500 font-black block mb-1">Email liên kết</label>
                            <span className="text-zinc-200 font-medium">{userData.Email || "Chưa cập nhật"}</span>
                        </div>
                        <div className="info-item bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                            <label className="text-[10px] uppercase text-zinc-500 font-black block mb-1">Tiểu sử</label>
                            <p className="bio-text text-zinc-400 italic">
                                {userData.Bio || "Người dùng này chưa để lại lời giới thiệu nào..."}
                            </p>
                        </div>
                        <button 
                            className="edit-toggle-btn w-full flex items-center justify-center gap-2 py-4 bg-zinc-100 text-black font-black uppercase rounded-2xl hover:bg-red-600 hover:text-white transition-all" 
                            onClick={() => setIsEditing(true)}
                        >
                            <Edit3 size={18} /> Chỉnh sửa hồ sơ
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleUpdate} className="profile-edit-form space-y-4">
                        <div className="input-group">
                            <label className="text-xs font-bold text-zinc-400 ml-1">Tên hiển thị *</label>
                            <input 
                                className="w-full bg-zinc-800 border-zinc-700 rounded-xl p-3 text-white focus:border-red-500 transition-colors"
                                type="text" 
                                value={newName} 
                                onChange={(e) => setNewName(e.target.value)} 
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="text-xs font-bold text-zinc-400 ml-1">Link ảnh đại diện (URL)</label>
                            <input 
                                className="w-full bg-zinc-800 border-zinc-700 rounded-xl p-3 text-white focus:border-red-500 transition-colors"
                                type="text" 
                                value={newAvatar} 
                                onChange={(e) => setNewAvatar(e.target.value)} 
                            />
                        </div>

                        <div className="input-group">
                            <label className="text-xs font-bold text-zinc-400 ml-1">Tiểu sử cá nhân</label>
                            <textarea 
                                className="w-full bg-zinc-800 border-zinc-700 rounded-xl p-3 text-white focus:border-red-500 transition-colors min-h-[100px]"
                                value={newBio} 
                                onChange={(e) => setNewBio(e.target.value)} 
                                maxLength={500}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button 
                                type="button" 
                                className="flex-1 py-3 flex items-center justify-center gap-2 bg-zinc-800 text-zinc-400 font-bold rounded-xl hover:bg-zinc-700 transition-all" 
                                onClick={() => setIsEditing(false)}
                                disabled={loading}
                            >
                                <XCircle size={18} /> Hủy
                            </button>
                            <button 
                                type="submit" 
                                className="flex-[2] py-3 flex items-center justify-center gap-2 bg-red-600 text-white font-black uppercase rounded-xl hover:bg-red-500 shadow-lg shadow-red-600/20 transition-all" 
                                disabled={loading}
                            >
                                {loading ? <RefreshCcw className="animate-spin" size={18} /> : <Save size={18} />}
                                {loading ? "Đang lưu..." : "Lưu thay đổi"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Profile;