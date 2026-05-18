import React from 'react';
import { FaFacebookF, FaFacebookSquare, FaDiscord, FaYoutube, FaTelegramPlane } from 'react-icons/fa';
import '../Styles/Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#060606] text-gray-400 py-12 border-t border-gray-800 relative overflow-hidden">
      {/* Hiệu ứng ánh sáng đỏ mờ góc Footer */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Cột 1: Giới thiệu */}
          <div className="space-y-5 text-center md:text-left">
            <h2 
              className="text-red-600 text-3xl font-black tracking-tighter uppercase cursor-pointer inline-block"
              onClick={scrollToTop}
            >
              Dawn<span className="text-white">Anime</span>
            </h2>
            <p className="text-sm leading-relaxed text-gray-500 italic">
              "Nơi cảm xúc thăng hoa cùng những thước phim Anime chất lượng nhất."
            </p>
            <p className="text-xs leading-relaxed">
              Cộng đồng giao lưu Anime hàng đầu Việt Nam. Cập nhật Trailer phim mới nhất, chia sẻ cảm nhận và kết nối đam mê.
            </p>
          </div>

          {/* Cột 2: Khám phá */}
          <div className="text-center md:text-left">
            <h3 className="text-white font-bold mb-6 uppercase text-xs tracking-[0.2em] border-b border-red-600/30 pb-2 inline-block md:block">Khám phá</h3>
            <ul className="space-y-3 text-sm">
              {['Phim Mới', 'Lịch Chiếu', 'Xếp Hạng', 'Top Trending'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-red-600 hover:translate-x-1 transition-all duration-300 block">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ */}
          <div className="text-center md:text-left">
            <h3 className="text-white font-bold mb-6 uppercase text-xs tracking-[0.2em] border-b border-red-600/30 pb-2 inline-block md:block">Hỗ trợ</h3>
            <ul className="space-y-3 text-sm">
              {['Câu hỏi thường gặp', 'Liên hệ', 'Chính sách bảo mật', 'Điều khoản sử dụng'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-red-600 hover:translate-x-1 transition-all duration-300 block">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 4: Theo dõi */}
          <div className="text-center md:text-left">
            <h3 className="text-white font-bold mb-6 uppercase text-xs tracking-[0.2em] border-b border-red-600/30 pb-2 inline-block md:block">Kết nối với Dawn</h3>
            <div className="flex justify-center md:justify-start space-x-4 mb-6">
              <SocialIcon 
                href="https://www.facebook.com/IamDawNguyenn/" 
                icon={<FaFacebookF />} 
                color="hover:bg-[#1877F2]" 
                label="Fanpage"
              />
              <SocialIcon 
                href="https://www.facebook.com/groups/animetrendwatch" 
                icon={<FaFacebookSquare />} 
                color="hover:bg-[#4267B2]" 
                label="Group"
              />
              <SocialIcon 
                href="#" 
                icon={<FaDiscord />} 
                color="hover:bg-[#5865F2]" 
                label="Discord"
              />
              <SocialIcon 
                href="#" 
                icon={<FaTelegramPlane />} 
                color="hover:bg-[#0088cc]" 
                label="Telegram"
              />
            </div>
            <div className="bg-gray-900/50 p-4 rounded-xl border border-white/5">
              <p className="text-[10px] uppercase font-bold text-gray-500 mb-2">Đăng ký nhận thông báo</p>
              <form className="flex">
                <input 
                  type="email" 
                  placeholder="Email của bạn..." 
                  className="bg-black border border-gray-800 text-[11px] px-3 py-2 rounded-l-lg focus:outline-none focus:border-red-600 w-full transition-all"
                />
                <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-r-lg transition-colors">
                  <FaTelegramPlane size={14} />
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Bản quyền & Footer Bottom */}
        <div className="mt-16 pt-8 border-t border-gray-800/50 flex flex-col md:flex-row justify-between items-center text-[10px] md:text-xs">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <p className="text-gray-400 font-medium">
              © {currentYear} <span className="text-red-600 font-bold">DawnAnime</span>. All rights reserved.
            </p>
            <p className="text-gray-600 mt-1">Góc nhỏ của Dawn - Nơi lan tỏa đam mê Anime.</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-500 italic">Made with ❤️ for Daw Nguyenn</span>
            <div className="h-4 w-[1px] bg-gray-800"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ href, icon, color, label }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noreferrer"
      title={label}
      className={`w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center transition-all duration-300 text-gray-400 hover:text-white shadow-lg active:scale-90 border border-white/5 ${color}`}
    >
      {React.cloneElement(icon, { size: 18 })}
    </a>
  );
}

export default Footer;