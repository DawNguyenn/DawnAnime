import React, { useState, useContext, useEffect } from 'react';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom'; 
import Header from './components/Header';
import Banner from './components/Banner';
import AnimeList from './components/AnimeList';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import Rules from './components/Rules';
import AdminDashboard from './components/AdminDashboard';
import Community from './components/Community/Community';
import Profile from './components/Profile';
import Ranking from './components/Ranking'; 

import { UserContext, UserProvider } from './UserContext';

function AppContent() {
  const { user, setUser } = useContext(UserContext);
  const location = useLocation(); 
  const navigate = useNavigate(); 
  
  const [authMode, setAuthMode] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    const path = location.pathname;
    if (path === '/community') {
      setActiveTab('community');
    } else if (path === '/rules') {
      setActiveTab('rules');
    } else if (path === '/profile') {
      setActiveTab('profile');
    } else if (path === '/ranking') {
      setActiveTab('ranking');
    } else if (path === '/') {
      setActiveTab('home');
      if (!searchKeyword) setSearchKeyword(""); 
    }
  }, [location.pathname, searchKeyword]);

  const handleNavigation = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') navigate('/');
    else navigate(`/${tab}`);
    setSearchKeyword(""); 
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    setUser(null);
    handleNavigation('home'); 
    setAuthMode(null);
  };

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    if (keyword) {
      setActiveTab("home");
      navigate('/'); 
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderMainContent = () => {
    const isAdmin = user?.RoleID === 1 || user?.role === 1;

    if (activeTab === 'admin' && isAdmin) {
      return <AdminDashboard onLogout={handleLogout} />;
    }

    if (searchKeyword && searchKeyword.trim() !== "") {
      return (
        <div className="pt-4">
          <div className="px-6 md:px-10 flex justify-between items-center pt-10">
            <h2 className="text-xl text-white">
              Kết quả cho: <span className="text-red-600 font-bold">"{searchKeyword}"</span>
            </h2>
            <button 
              onClick={() => setSearchKeyword("")}
              className="text-gray-400 hover:text-white text-sm underline transition-all"
            >
              Quay lại trang chủ
            </button>
          </div>
          <AnimeList 
            title="Kết quả tìm kiếm" 
            type="search" 
            keyword={searchKeyword} 
            user={user} 
            onOpenLogin={() => setAuthMode('login')}
          />
        </div>
      );
    }

    switch (activeTab) {
      case 'rules':
        return <Rules />;
      case 'community':
        return <Community user={user} setActiveTab={handleNavigation} />; 
      case 'ranking':
        return (
          <div className="py-10 min-h-screen bg-black">
            <Ranking />
          </div>
        );
      case 'profile':
        return user ? (
          <Profile user={user} setUser={setUser} />
        ) : (
          <div className="text-white text-center py-20">
            <p className="mb-4">Vui lòng đăng nhập để xem hồ sơ!</p>
            <button 
              onClick={() => setAuthMode('login')}
              className="px-6 py-2 bg-red-600 rounded-full font-bold hover:bg-red-700 transition-all"
            >
              Đăng nhập ngay
            </button>
          </div>
        );
      default:
        return (
          <>
            <Banner />
            <div className="space-y-10">
              <AnimeList title="Anime Phổ Biến" type="bypopularity" user={user} onOpenLogin={() => setAuthMode('login')} />
              <AnimeList title="Anime Đang Chiếu" type="airing" user={user} onOpenLogin={() => setAuthMode('login')} />
              <AnimeList title="Phim Sắp Ra Mắt" type="upcoming" user={user} onOpenLogin={() => setAuthMode('login')} />
            </div>
          </>
        );
    }
  };

  const isAdminView = activeTab === 'admin' && (user?.RoleID === 1 || user?.role === 1);

  return (
    <div className="bg-black min-h-screen pb-10 relative selection:bg-red-600 selection:text-white">
      {!isAdminView && (
        <Header 
          user={user} 
          onLogout={handleLogout} 
          onOpenLogin={() => setAuthMode('login')} 
          onOpenRegister={() => setAuthMode('register')}
          onSearch={handleSearch} 
          setActiveTab={handleNavigation} 
          activeTab={activeTab}      
        />
      )}
      
      <main className={isAdminView ? "" : "min-h-[70vh]"}>
        {renderMainContent()}
      </main>

      {!isAdminView && <Footer />}

      {authMode === 'login' && (
        <Login 
          onClose={() => setAuthMode(null)} 
          onSwitchRegister={() => setAuthMode('register')}
        />
      )}

      {authMode === 'register' && (
        <Register 
          onClose={() => setAuthMode(null)} 
          onSwitchLogin={() => setAuthMode('login')}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter> 
      <UserProvider>
        <AppContent />
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;