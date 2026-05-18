import React, { useState } from 'react';
import { IoShieldCheckmark, IoHeart, IoStar, IoChevronDown, IoChevronUp } from 'react-icons/io5';
import '../Styles/Rules.css'; 

function Rules() {
  const [openIndex, setOpenIndex] = useState(0);

  const ruleSections = [
    {
      title: "Văn hóa ứng xử",
      icon: <IoHeart className="text-amber-500" size={26} />,
      content: [
        "Tôn trọng lẫn nhau: Tuyệt đối không công kích cá nhân hoặc xúc phạm thành viên khác.",
        "Không Spoiler: Luôn sử dụng thẻ cảnh báo khi thảo luận về tình tiết mới của Anime/Manga.",
        "Ngôn từ văn minh: Giữ gìn sự trong sáng của tiếng Việt, không dùng từ ngữ thô tục."
      ]
    },
    {
      title: "Cống hiến & Bảng xếp hạng",
      icon: <IoStar className="text-yellow-400" size={26} />,
      content: [
        "Đăng bài viết chất lượng: Mỗi bài viết hữu ích sẽ được cộng +10 EXP.",
        "Tương tác tích cực: Nhận Tim từ người dùng khác giúp tăng uy tín cá nhân.",
        "Hình phạt vi phạm: Tùy mức độ sẽ bị trừ EXP hoặc khóa tài khoản vĩnh viễn."
      ]
    },
    {
      title: "Quy định đăng bài",
      icon: <IoShieldCheckmark className="text-amber-600" size={26} />,
      content: [
        "Nội dung phù hợp: Chỉ đăng các chủ đề liên quan đến Anime, Manga và Văn hóa Nhật Bản.",
        "An toàn cộng đồng: Không đăng ảnh nhạy cảm (18+), bạo lực hoặc nội dung gây hấn.",
        "Chống Spam: Không quảng cáo, không gắn link lừa đảo hoặc lặp lại bài viết."
      ]
    }
  ];

  return (
    <div className="rules-container animate-fadeIn">
      <div className="rules-header">
        <h1 className="rules-title">Quy tắc cộng đồng</h1>
        <p className="rules-subtitle">
          Hãy cùng xây dựng một <span className="text-amber-500 font-bold">Dawn Anime</span> văn minh và bền vững.
        </p>
      </div>

      <div className="space-y-4">
        {ruleSections.map((section, index) => (
          <div 
            key={index} 
            className={`rule-card ${openIndex === index ? 'rule-card-open' : 'rule-card-closed'}`}
          >
            <button 
              onClick={() => setOpenIndex(openIndex === index ? null : index)} 
              className="rule-button"
            >
              <div className="rule-info">
                <span className="filter drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">
                    {section.icon}
                </span>
                <span className={`rule-title-text ${openIndex === index ? 'text-amber-500' : 'text-white'}`}>
                  {section.title}
                </span>
              </div>
              {openIndex === index ? 
                <IoChevronUp className="text-amber-500" /> : 
                <IoChevronDown className="text-gray-500" />
              }
            </button>

            {openIndex === index && (
              <div className="rule-content-wrapper">
                <ul className="rule-list">
                  {section.content.map((item, i) => (
                    <li key={i} className="rule-item">
                      <span className="rule-bullet">✦</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Rules;