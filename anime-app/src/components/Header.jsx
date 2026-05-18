import React, { useState, useContext, useEffect } from 'react'; 
import { 
  IoClose, IoSearch, IoSettingsSharp, IoPersonSharp, 
  IoArrowBack, IoMenu, IoHome, IoPeople, 
  IoStatsChart, IoDocumentText, IoArrowUp 
} from 'react-icons/io5';
import { UserContext } from '../UserContext'; 
import '../Styles/Header.css';

function Header({ onLogout, onOpenLogin, onOpenRegister, onSearch, setActiveTab, activeTab }) {
  const { user } = useContext(UserContext); 
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false); 
  const [showBackToTop, setShowBackToTop] = useState(false);

  const isAdmin = user?.RoleID === 1 || user?.role === 1;
  const userAvatar = user?.AvatarURL || user?.avatar;
  const userName = user?.Username || user?.username;

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
      setActiveTab('home'); 
      setIsMobileSearchOpen(false);
      setIsFabOpen(false);
    }
  };

  const navLinks = [
    { name: "Trang Chủ", id: "home", icon: <IoHome /> },
    { name: "Cộng Đồng", id: "community", icon: <IoPeople /> },
    { name: "Xếp Hạng", id: "ranking", icon: <IoStatsChart /> },
    { name: "Quy Tắc", id: "rules", icon: <IoDocumentText /> },
  ];

  if (isAdmin) {
    navLinks.push({ name: "Quản Trị", id: "admin", icon: <IoSettingsSharp /> });
  }

  const handleTabClick = (id) => {
    setActiveTab(id);
    setSearchTerm(""); 
    onSearch("");       
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileSearchOpen(false);
    setIsFabOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-[100] w-full p-4 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 md:px-10">
        
        {/* MOBILE SEARCH OVERLAY */}
        {isMobileSearchOpen && (
          <div className="fixed inset-0 bg-black z-[110] flex items-center px-4 animate-slideDown">
            <button onClick={() => setIsMobileSearchOpen(false)} className="text-white mr-4">
              <IoArrowBack size={24} />
            </button>
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center bg-gray-900 rounded-full px-4 py-2 border border-red-600">
              <input 
                autoFocus
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm anime..." 
                className="bg-transparent text-white outline-none w-full text-base" 
              />
              <button type="submit" className="text-red-600">
                <IoSearch size={20} />
              </button>
            </form>
          </div>
        )}

        <div className="flex items-center space-x-12">
          <h2 
            className="text-2xl md:text-3xl font-black tracking-tighter uppercase select-none group cursor-pointer"
            onClick={() => handleTabClick('home')} 
          >
            <span className="text-red-600 group-hover:text-red-500 transition-colors">Dawn</span>
            <span className="text-white">Anime</span>
          </h2>
          
          <nav className="hidden lg:block">
            <ul className="flex items-center space-x-6">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <button 
                    onClick={() => handleTabClick(link.id)}
                    className={`text-sm font-medium transition uppercase tracking-wider pb-1 flex items-center gap-2 ${
                      activeTab === link.id 
                      ? 'text-red-600 border-b-2 border-red-600' 
                      : 'text-gray-300 hover:text-red-600'
                    } ${link.id === 'admin' ? 'text-orange-500 hover:text-orange-400' : ''}`}
                  >
                    {link.id === 'admin' && <IoSettingsSharp size={14} />}
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center space-x-3 md:space-x-6">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileSearchOpen(true)}
              className="flex md:hidden text-gray-400 hover:text-red-600 p-2"
            >
              <IoSearch size={24} />
            </button>

            <form 
              onSubmit={handleSearchSubmit}
              className="hidden md:flex items-center bg-gray-900 border border-gray-700 rounded-full px-4 py-1 focus-within:border-red-600 transition"
            >
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm anime..." 
                className="bg-transparent text-sm text-white py-1 outline-none w-40 lg:w-64" 
              />
              <button type="submit" className="text-gray-400 hover:text-red-600 ml-2">
                <IoSearch size={20} />
              </button>
            </form>
          </div>

          {user ? (
            <div className="flex items-center space-x-3 md:space-x-4 border-l border-gray-700 pl-4 md:pl-6">
              <div 
                className={`profile-trigger flex items-center gap-3 cursor-pointer group transition-all p-1 rounded-lg ${activeTab === 'profile' ? 'bg-red-600/10' : ''}`}
                onClick={() => handleTabClick('profile')}
              >
                <div className="text-right hidden sm:block">
                  <p className={`text-[9px] uppercase font-black leading-none ${isAdmin ? 'text-orange-500' : 'text-gray-500'}`}>
                    {isAdmin ? 'Quản trị viên' : 'Thành viên'}
                  </p>
                  <p className={`text-sm font-bold transition-colors ${activeTab === 'profile' ? 'text-red-600' : 'text-white group-hover:text-red-600'}`}>
                    {userName}
                  </p>
                </div>
                <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full border-2 overflow-hidden transition-all ${activeTab === 'profile' ? 'border-red-600 scale-105 shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'border-gray-700 group-hover:border-red-600'}`}>
                  {userAvatar ? (
                    <img src={userAvatar} alt="avt" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white">
                      <IoPersonSharp size={18} />
                    </div>
                  )}
                </div>
              </div>
              <button onClick={onLogout} className="text-gray-400 hover:text-red-600 text-[10px] md:text-[11px] font-bold uppercase transition-all">Thoát</button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 md:space-x-4 border-l border-gray-700 pl-4 md:pl-6">
              <button onClick={onOpenLogin} className="text-white text-xs md:text-sm font-bold hover:text-red-600 uppercase transition-colors">Đăng nhập</button>
              <button onClick={onOpenRegister} className="bg-red-600 hover:bg-red-700 text-white text-[10px] md:text-[11px] font-bold px-3 md:px-5 py-2 rounded-lg uppercase active:scale-95 transition-all">Đăng ký</button>
            </div>
          )}
        </div>
      </header>

      {/* --- NÚT CUỘN TRANG NHANH (BACK TO TOP) --- */}
      <div 
        className={`fixed bottom-28 right-8 z-[195] transition-all duration-300 transform ${
          showBackToTop ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center hover:bg-red-600 hover:border-red-600 transition-all shadow-2xl group"
        >
          <IoArrowUp size={24} className="group-hover:-translate-y-1 transition-transform" />
        </button>
      </div>

      {/* --- MOBILE FAB (MENU ĐIỀU HƯỚNG TRÒN) --- */}
      <div className="lg:hidden fixed bottom-8 right-6 z-[200]">
        {isFabOpen && (
          <div className="flex flex-col-reverse items-end mb-4 space-y-reverse space-y-4 animate-fabPop">
            {navLinks.map((link) => (
              <div key={link.id} className="flex items-center gap-3">
                <span className={`bg-black/90 text-[10px] font-bold px-3 py-1 rounded-md border uppercase tracking-widest shadow-xl ${link.id === 'admin' ? 'text-orange-500 border-orange-500/50' : 'text-white border-white/10'}`}>
                  {link.name}
                </span>
                <button
                  onClick={() => handleTabClick(link.id)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl border-2 transition-all active:scale-90 ${
                    activeTab === link.id 
                    ? 'bg-red-600 border-white text-white' 
                    : link.id === 'admin' 
                      ? 'bg-gray-900 border-orange-500 text-orange-500' 
                      : 'bg-gray-900 border-red-600 text-red-600'
                  }`}
                >
                  {React.cloneElement(link.icon, { size: 20 })}
                </button>
              </div>
            ))}
          </div>
        )}

        <button 
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`w-16 h-16 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center transition-all duration-500 z-[201] ${isFabOpen ? 'bg-white text-black rotate-[360deg]' : 'bg-red-600 text-white'}`}
        >
          {isFabOpen ? <IoClose size={32} /> : <IoMenu size={32} />}
        </button>
      </div>

      {/* Overlay mờ nền */}
      {isFabOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-[190] animate-fadeIn" 
          onClick={() => setIsFabOpen(false)}
        ></div>
      )}
    </>
  );
}

export default Header;