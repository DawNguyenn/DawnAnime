import React, { useEffect, useState, useCallback } from 'react';
import { IoClose } from 'react-icons/io5';

// Thêm prop 'keyword' vào component
function AnimeList({ title, type = "bypopularity", delay = 0, user, onOpenLogin, keyword = "" }) {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [youtubeId, setYoutubeId] = useState(null);
  const [translatedSynopsis, setTranslatedSynopsis] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    
    const fetchAnime = async () => {
      try {
        if (page === 1) {
          setLoading(true);
          // Chỉ delay khi load trang chủ để tránh Rate Limit, không delay khi tìm kiếm để UX nhanh hơn
          if (!keyword) await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          setIsFetchingMore(true);
        }

        const baseUrl = keyword 
          ? `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(keyword)}&order_by=popularity&sort=asc`
          : `https://api.jikan.moe/v4/top/anime?filter=${type}`;

        const response = await fetch(
          `${baseUrl}&limit=24&page=${page}`,
          { signal: controller.signal }
        );
        const result = await response.json();

        if (result.data) {
          setAnimes((prev) => (page === 1 ? result.data : [...prev, ...result.data]));
          setHasMore(result.pagination?.has_next_page || false);
        }
      } catch (error) {
        if (error.name !== 'AbortError') console.error("Lỗi tải Anime:", error);
      } finally {
        setLoading(false);
        setIsFetchingMore(false);
      }
    };

    fetchAnime();
    return () => controller.abort();
  }, [type, page, delay, keyword]);

  useEffect(() => {
    setPage(1);
    setAnimes([]);
  }, [type, keyword]);

  const handleWatchNow = (anime) => {
    const id = anime.trailer?.youtube_id;
    if (id) {
      setYoutubeId(id);
    } else {
      const rawUrl = anime.trailer?.url || anime.trailer?.embed_url;
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = rawUrl?.match(regExp);
      const extractedId = (match && match[2].length === 11) ? match[2] : null;
      if (extractedId) setYoutubeId(extractedId);
      else alert("Phim này chưa có Trailer trực tiếp!");
    }
  };

  const translateText = useCallback(async (text) => {
    if (!text) return "";
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(text)}`;
      const response = await fetch(url);
      const data = await response.json();
      return data[0].map(item => item[0]).join("");
    } catch { return text; }
  }, []);

  useEffect(() => {
    if (selectedAnime?.synopsis) {
      translateText(selectedAnime.synopsis).then(setTranslatedSynopsis);
    }
  }, [selectedAnime, translateText]);

  const handleCloseModal = () => {
    setSelectedAnime(null);
    setYoutubeId(null);
    setTranslatedSynopsis("");
  };

  // UI Skeleton Loading
  if (loading && page === 1) {
    return (
      <div className="px-4 md:px-10 mb-10">
        <div className="h-8 w-48 bg-gray-800 animate-pulse rounded mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-gray-800 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="text-white px-4 md:px-10 mb-10 pt-12">
      <h2 className="text-2xl font-bold uppercase mb-6 text-red-600 border-l-4 border-red-600 pl-4">
        {keyword ? `Kết quả cho: ${keyword}` : title}
      </h2>

      {/* Hiển thị thông báo nếu không tìm thấy kết quả */}
      {!loading && animes.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          Không tìm thấy Anime nào phù hợp với từ khóa này.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {animes.map((anime) => (
          <div 
            key={anime.mal_id} 
            className="group cursor-pointer" 
            onClick={() => user ? setSelectedAnime(anime) : onOpenLogin()}
          >
            <div className="relative overflow-hidden rounded-lg aspect-[2/3] bg-gray-900 shadow-md border border-gray-800">
              <img 
                src={anime.images.jpg.large_image_url} 
                alt={anime.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                loading="lazy"
              />
              <div className="absolute top-2 right-2 bg-red-600 px-2 py-1 rounded text-[10px] font-bold shadow-lg">
                ★ {anime.score || "N/A"}
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full font-bold">Chi tiết</span>
              </div>
            </div>
            <p className="mt-2 text-sm font-medium line-clamp-2 group-hover:text-red-500 transition-colors">
              {anime.title_english || anime.title}
            </p>
          </div>
        ))}
      </div>

      {/* Modal & Pagination (Giữ nguyên) */}
      {selectedAnime && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4" onClick={handleCloseModal}>
          <div className="bg-[#141414] w-full max-w-5xl rounded-xl overflow-hidden relative border border-gray-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-4 z-20 text-white bg-black/50 rounded-full p-2 hover:bg-red-600 transition" onClick={handleCloseModal}>
              <IoClose size={24} />
            </button>
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-2/3 bg-black aspect-video">
                {youtubeId ? (
                  <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&modestbranding=1&rel=0`} title="Trailer" frameBorder="0" allowFullScreen></iframe>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center relative">
                    <img src={selectedAnime.images.jpg.large_image_url} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="" />
                    <button onClick={() => handleWatchNow(selectedAnime)} className="relative z-10 bg-red-600 px-8 py-3 rounded-full font-bold uppercase hover:scale-110 transition shadow-xl">Xem Trailer Ngay</button>
                  </div>
                )}
              </div>
              <div className="lg:w-1/3 p-6 space-y-4 max-h-[500px] overflow-y-auto">
                <h2 className="text-xl font-bold text-white uppercase">{selectedAnime.title}</h2>
                <div className="flex flex-wrap gap-2 text-[10px]">
                  <span className="bg-red-600 px-2 py-1 rounded font-bold">★ {selectedAnime.score}</span>
                  <span className="bg-gray-800 px-2 py-1 rounded uppercase">{selectedAnime.type}</span>
                </div>
                <div className="text-xs text-gray-300 italic">
                  <p className="text-red-600 font-bold mb-1 uppercase not-italic">Nội dung tóm tắt:</p>
                  {translatedSynopsis || "Đang tải cốt truyện..."}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {hasMore && (
        <div className="flex justify-center mt-10">
          <button 
            onClick={() => setPage(p => p + 1)} 
            className="bg-red-600 hover:bg-red-700 px-10 py-2 rounded-full font-bold transition-all shadow-lg"
            disabled={isFetchingMore}
          >
            {isFetchingMore ? "Đang tải..." : "Xem thêm"}
          </button>
        </div>
      )}
    </div>
  );
}

export default AnimeList;