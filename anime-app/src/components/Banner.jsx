import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 

function Banner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const banners = [
    {
      id: 1,
      title: "Attack on Titan",
      subTitle: "The Final Season",
      desc: "Chứng kiến cuộc hành trình cuối cùng của Eren Yeager. Cuộc chiến giữa Marley và Paradis đang đi đến hồi kết.",
      img: "https://static0.srcdn.com/wordpress/wp-content/uploads/2025/11/attack-on-titan-s-titan-different-titan-types.jpg?w=1600&h=900&fit=crop",
    },
    {
      id: 2,
      title: "Demon Slayer",
      subTitle: "Hashira Training Arc",
      desc: "Tanjiro đến gặp Trụ cột Hội đồng để chuẩn bị cho cuộc chiến sắp tới với Muzan Kibutsuji.",
      img: "https://wibu.com.vn/wp-content/uploads/2025/03/tru-cot-thanh-guom-diet-quy.jpg",
    },
    {
      id: 3,
      title: "One Piece",
      subTitle: "Egghead Island Arc",
      desc: "Băng Mũ Rơm đặt chân lên hòn đảo tương lai của Tiến sĩ Vegapunk, mở ra những bí mật chấn động.",
      img: "https://cdn-media.sforum.vn/storage/app/media/ctvseo_14/loki-one-piece/loki-one-piece-thumbnail.jpg",
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer); 
  }, [banners.length]);

  // Hàm xử lý điều hướng
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="relative w-full h-[500px] bg-black overflow-hidden">
      {banners.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Ảnh nền */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={{ backgroundImage: `url('${item.img}')` }}
          ></div>

          {/* Lớp phủ Gradient giúp text dễ đọc hơn */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>

          {/* Nội dung chính */}
          <div className="relative z-20 flex flex-col justify-center h-full px-10 space-y-4 max-w-[700px]">
            <span className="px-2 py-1 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-red-300 w-max uppercase">
              Trending Now
            </span>
            
            <h2 className="text-5xl font-extrabold text-white leading-tight">
              {item.title}: <br />
              <span className="text-red-700">{item.subTitle}</span>
            </h2>

            <p className="text-gray-300 text-lg line-clamp-3">
              {item.desc}
            </p>

            <div className="flex space-x-4">
              <button 
                onClick={() => handleNavigation(`/anime/${item.id}`)}
                className="px-6 py-3 font-bold text-white bg-red-700 hover:bg-red-800 transition rounded-md shadow-lg"
              >
                Xem ngay
              </button>

              <button 
                onClick={() => handleNavigation('/community')}
                className="px-6 py-3 font-bold text-white bg-gray-700/50 hover:bg-gray-600 transition rounded-md border border-gray-400 backdrop-blur-sm"
              >
                 Tới Cộng Đồng
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Nút tròn điều hướng (Dots) */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-red-700 w-8" : "bg-gray-500 w-3"
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
}

export default Banner;