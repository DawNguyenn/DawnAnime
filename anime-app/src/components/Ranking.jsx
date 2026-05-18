import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Trophy, Medal, Star, Loader2, ChevronDown } from 'lucide-react';
import { UserContext } from '../UserContext';

const Ranking = () => {
    const { topRankers, setTopRankers } = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [visibleCount, setVisibleCount] = useState(5);

    useEffect(() => {
        const fetchRankingData = async () => {
            if (!topRankers || topRankers.length === 0) {
                try {
                    setLoading(true);
                    const response = await axios.get('http://localhost:5000/api/auth/top-rankers');
                    setTopRankers(response.data);
                } catch (error) {
                    console.error("Lỗi khi tải bảng xếp hạng:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchRankingData();
    }, [topRankers, setTopRankers]);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 5);
    };

    const getRankIcon = (index) => {
        switch (index) {
            case 0: return <Trophy className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" size={32} />;
            case 1: return <Medal className="text-gray-300" size={28} />;
            case 2: return <Medal className="text-amber-600" size={26} />;
            default: return <span className="font-black text-zinc-600 w-8 text-center text-lg">{index + 1}</span>;
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[40px] overflow-hidden border border-zinc-800/50 my-10 transition-all duration-500">
            {/* Header phong cách DAWN ANIME */}
            <div className="bg-gradient-to-br from-red-900 via-red-600 to-zinc-900 p-10 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-5xl font-black flex items-center gap-4 italic tracking-tighter">
                        <div className="bg-yellow-400 p-2 rounded-xl rotate-12 shadow-lg">
                            <Star fill="black" className="text-black" size={28} />
                        </div>
                        BẢNG XẾP HẠNG
                    </h2>
                    <p className="text-red-100 text-sm mt-3 font-bold opacity-90 uppercase tracking-[0.3em] flex items-center gap-2">
                        <span className="w-8 h-[2px] bg-red-400"></span>
                        Huyền thoại DAWN ANIME
                    </p>
                </div>
                <Trophy size={180} className="absolute -right-10 -bottom-10 text-white/5 -rotate-12" />
            </div>

            <div className="p-8 bg-zinc-900 min-h-[500px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[400px] gap-6">
                        <div className="relative">
                            <Loader2 className="animate-spin text-red-500" size={60} />
                            <div className="absolute inset-0 blur-xl bg-red-500/20 animate-pulse"></div>
                        </div>
                        <p className="text-zinc-400 font-bold tracking-widest animate-bounce">ĐANG TRUY XUẤT DỮ LIỆU...</p>
                    </div>
                ) : topRankers && topRankers.length > 0 ? (
                    <div className="space-y-4">
                        {/* Chỉ render số lượng user dựa trên visibleCount */}
                        {topRankers.slice(0, visibleCount).map((item, index) => (
                            <div 
                                key={item.UserID || index} 
                                className={`group flex items-center justify-between p-6 rounded-3xl transition-all duration-300 border ${
                                    index === 0 
                                    ? 'bg-gradient-to-r from-zinc-800/80 to-zinc-900 border-yellow-500/40 shadow-xl' 
                                    : 'bg-zinc-800/20 border-zinc-800/50 hover:bg-zinc-800/40 hover:border-zinc-700'
                                }`}
                            >
                                <div className="flex items-center gap-6">
                                    <div className="flex-shrink-0 w-12 flex justify-center items-center transform group-hover:scale-110 transition-transform">
                                        {getRankIcon(index)}
                                    </div>

                                    <div className="relative">
                                        <img 
                                            src={item.AvatarURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.Username)}&background=random`} 
                                            alt={item.Username} 
                                            className={`w-16 h-16 rounded-2xl border-2 object-cover transform transition-all group-hover:rotate-3 ${
                                                index === 0 ? 'border-yellow-400 shadow-lg shadow-yellow-500/20' : 'border-zinc-700'
                                            }`}
                                        />
                                        {index < 3 && (
                                            <div className="absolute -top-2 -right-2 bg-red-600 text-[9px] font-black px-2 py-1 rounded-lg text-white border-2 border-zinc-900 shadow-lg">
                                                TOP
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <p className={`text-2xl font-black tracking-tight ${index === 0 ? 'text-yellow-400' : 'text-zinc-100'}`}>
                                            {item.Username}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] bg-zinc-950 text-zinc-500 px-2 py-0.5 rounded font-mono border border-zinc-800">
                                                #{String(item.UserID || 0).padStart(4, '0')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right flex flex-col items-end">
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-4xl font-black italic tracking-tighter ${index === 0 ? 'text-yellow-400' : 'text-red-500'}`}>
                                            {(item.exp || 0).toLocaleString()}
                                        </span>
                                        <span className="text-[10px] font-black text-zinc-600">XP</span>
                                    </div>
                                    <div className="bg-zinc-950 px-4 py-1 rounded-xl border border-zinc-800 mt-2 shadow-inner">
                                        <span className="text-[11px] text-zinc-400 font-black italic uppercase">
                                            LV. {item.Level || 1}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Nút Xem Thêm - Chỉ hiện nếu còn dữ liệu ẩn */}
                        {visibleCount < topRankers.length && (
                            <button 
                                onClick={handleLoadMore}
                                className="w-full mt-8 py-5 flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-white transition-all group"
                            >
                                <span className="text-xs font-black uppercase tracking-[0.4em] group-hover:tracking-[0.6em] transition-all">Xem thêm danh sách</span>
                                <ChevronDown className="animate-bounce group-hover:text-red-500" size={24} />
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-zinc-700">
                        <Star size={64} className="mb-4 opacity-10 rotate-12" />
                        <p className="font-black text-xl uppercase tracking-widest opacity-30">Chưa có dữ liệu</p>
                    </div>
                )}
            </div>

            <div className="p-8 bg-zinc-950/80 border-t border-zinc-800/50 text-center">
                <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                    Hệ thống tự động xếp hạng theo Level & Kinh nghiệm <br/> 
                    Cập nhật thời gian thực từ máy chủ DAWN
                </p>
            </div>
        </div>
    );
};

export default Ranking;