import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from "../../UserContext";
import '../../Styles/RightSidebar.css';

const RightSidebar = ({ setActiveTab }) => {
    // 1. Lấy dữ liệu và hàm cập nhật từ Context dùng chung
    const { topRankers, setTopRankers } = useContext(UserContext);
    
    const [trendingAnime, setTrendingAnime] = useState([]);
    const [loadingAnime, setLoadingAnime] = useState(true);
    const [loadingRank, setLoadingRank] = useState(true);
    
    const navigate = useNavigate();
    const location = useLocation();

    // 2. Lấy dữ liệu Anime Thịnh Hành từ Jikan API
    useEffect(() => {
        const fetchTrendingAnime = async () => {
            try {
                setLoadingAnime(true);
                const response = await axios.get('https://api.jikan.moe/v4/top/anime?filter=airing&limit=5');
                const formattedAnime = response.data.data.map(anime => ({
                    id: anime.mal_id,
                    title: anime.title_vietnamese || anime.title_english || anime.title,
                    image: anime.images.jpg.image_url,
                    score: anime.score || 'N/A'
                }));
                setTrendingAnime(formattedAnime);
            } catch (err) {
                console.error("Lỗi Jikan API:", err);
            } finally {
                setLoadingAnime(false);
            }
        };
        fetchTrendingAnime();
    }, []);

    // 3. Lấy dữ liệu Bảng xếp hạng
    useEffect(() => {
        const fetchTopRankers = async () => {
            try {
                setLoadingRank(true);
                const response = await axios.get('http://localhost:5000/api/auth/top-rankers');
                // Cập nhật vào Context (Backend trả về: Level, exp, Username, AvatarURL)
                setTopRankers(response.data);
            } catch (err) {
                console.error("Lỗi khi lấy Rankers:", err);
            } finally {
                setLoadingRank(false);
            }
        };

        // Luôn fetch lại dữ liệu nếu danh sách đang trống, hoặc khi chuyển đổi route
        // Điều này giúp sửa lỗi mất danh sách khi quay lại từ Profile
        if (!topRankers || topRankers.length === 0) {
            fetchTopRankers();
        } else {
            setLoadingRank(false);
        }
    }, [location.pathname, setTopRankers]); 

    // 4. Hàm xử lý điều hướng sang trang Ranking
    const handleNavigationToRanking = () => {
        navigate('/ranking'); 
        if (setActiveTab) {
            setActiveTab('ranking');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    };

    return (
        <aside className="sidebar right-sidebar">
            {/* Khối Bảng Xếp Hạng Top DAWN ANIME */}
            <div className="sidebar-card">
                <h3 className="sidebar-title">
                    <span>🏆 Top <span style={{ color: '#ff4500' }}>DAWN</span> ANIME</span>
                </h3>
                
                <div className="ranking-list min-h-[100px]">
                    {loadingRank && topRankers.length === 0 ? (
                        <div className="text-gray-500 text-[10px] p-4 text-center italic animate-pulse">
                            Đang cập nhật xếp hạng...
                        </div>
                    ) : (
                        topRankers.slice(0, 5).map((user, index) => (
                            <div key={user.UserID || index} className="rank-item flex items-center justify-between mb-2 p-1.5 hover:bg-[#252525] rounded-xl transition-all border border-transparent hover:border-zinc-800">
                                <div className="rank-info flex items-center overflow-hidden">
                                    <span className={`rank-number r-${index + 1} font-black mr-2 w-5 text-center text-xs`}>
                                        {index + 1}
                                    </span>
                                    <img 
                                        src={user.AvatarURL || user.Avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.Username)}&background=random`} 
                                        alt="avt" 
                                        className="w-8 h-8 rounded-full mr-2 object-cover border border-zinc-700"
                                        onError={(e) => {
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.Username)}&background=random`;
                                        }}
                                    />
                                    <span className="rank-name text-zinc-100 text-xs line-clamp-1 font-semibold">
                                        {user.Username}
                                    </span>
                                </div>
                                
                                <div className="rank-stats text-right flex-shrink-0 ml-2">
                                    <p className="rank-lv font-mono text-[9px] text-orange-500 font-black italic">
                                        Lv.{user.Level || 1}
                                    </p>
                                    <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-tighter">
                                        {user.exp || 0} XP
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                
                <button 
                    className="view-more-link w-full text-center py-2 text-zinc-500 font-bold uppercase text-[9px] mt-2 transition-all hover:text-white border-t border-zinc-800/50 hover:bg-zinc-800/20 rounded-b-lg" 
                    onClick={handleNavigationToRanking}
                >
                    Xem tất cả bảng xếp hạng
                </button>
            </div>

            {/* Khối Anime Thịnh Hành */}
            <div className="sidebar-card mt-6">
                <h3 className="sidebar-title">📺 Anime Thịnh Hành</h3>
                <div className="trending-list">
                    {loadingAnime ? (
                        <div className="text-gray-500 text-[10px] p-4 text-center animate-pulse italic">Đang nạp dữ liệu...</div>
                    ) : (
                        trendingAnime.map((anime) => (
                            <div 
                                key={anime.id} 
                                className="anime-mini-card flex gap-3 mb-4 hover:bg-[#252525] p-2 rounded-lg transition-all cursor-pointer border border-transparent hover:border-zinc-800"
                                onClick={() => navigate(`/anime/${anime.id}`)}
                            >
                                <img src={anime.image} alt={anime.title} className="w-10 h-14 object-cover rounded shadow-md flex-shrink-0 border border-zinc-800" />
                                <div className="anime-mini-info flex flex-col justify-center overflow-hidden">
                                    <p className="anime-mini-title text-[11px] font-semibold text-zinc-200 line-clamp-2 leading-tight">
                                        {anime.title}
                                    </p>
                                    <span className="text-orange-500 text-[9px] font-bold mt-1 tracking-widest">⭐ {anime.score}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </aside>
    );
};

export default RightSidebar;