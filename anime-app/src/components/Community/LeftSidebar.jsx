import React, { useContext } from 'react';
import { UserContext } from '../../UserContext';
import '../../Styles/LeftSidebar.css';

const LeftSidebar = ({ activeTab, setActiveTab }) => {
  const { user } = useContext(UserContext);

  const handleNavigation = (tabName) => {
    if (setActiveTab) {
      setActiveTab(tabName);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Xử lý thông tin user
  const username = user?.Username || user?.username || "Người dùng";
  const avatar = user?.AvatarURL || user?.avatar;
  const level = user?.Level || user?.level || 1;
  const currentExp = Number(user?.exp || user?.CurrentEXP || 0); 
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff`;
  const expPercentage = Math.min((currentExp / 1000) * 100, 100);

  const menuItems = [
    { id: 'home', icon: '🏠', label: 'Trang chủ' },
    { id: 'community', icon: '👥', label: 'Cộng đồng' },
    { id: 'ranking', icon: '🔥', label: 'Xếp hạng' },
    { id: 'rules', icon: '🔖', label: 'Quy tắc' },
    { id: 'settings', icon: '⚙️', label: 'Cài đặt' }
  ];

  return (
    <aside className="sidebar left-sidebar">
      {/* Card Profile: Chỉ hiển thị trên Desktop (đã điều khiển bằng CSS display:none ở mobile) */}
      <div className="sidebar-card user-mini-profile">
        <div className="profile-link-wrapper" onClick={() => handleNavigation('profile')}>
          <div className="avatar-wrapper">
            <img src={avatar || defaultAvatar} alt="avatar" className="sidebar-avatar" />
            <span className="user-badge-main">Lv.{level}</span>
          </div>
          <h4 className="user-name-sidebar">{username}</h4>
        </div>
        <div className="exp-section">
          <div className="exp-bar-container">
            <div className="exp-bar-fill" style={{ width: `${expPercentage}%` }}></div>
          </div>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <button 
            key={item.id}
            className={`menu-item ${activeTab === item.id ? 'active' : ''}`} 
            onClick={() => handleNavigation(item.id)}
          >
             <span className="m-icon">{item.icon}</span>
             <span className="m-text">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default LeftSidebar;