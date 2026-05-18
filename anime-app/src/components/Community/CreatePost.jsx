 import React, { useContext, useState } from 'react';
import { ImageIcon, X, Send, Plus } from 'lucide-react';
import { UserContext } from '../../UserContext';

const CreatePost = ({ 
    isExpanded, 
    setIsExpanded, 
    content, 
    setContent, 
    imageUrls = [], // Default value là mảng rỗng
    setImageUrls, 
    handlePost 
}) => {
    const { user } = useContext(UserContext);
    const [tempLink, setTempLink] = useState(""); 

    // Hàm đóng form và reset link tạm
    const closeForm = (e) => {
        if (e) e.stopPropagation();
        setIsExpanded(false);
        setTempLink(""); 
    };

    // Thêm link ảnh vào danh sách bài viết
    const addImageLink = () => {
        const link = tempLink.trim();
        if (!link) return;

        // Đảm bảo logic luôn làm việc với mảng
        const currentImages = Array.isArray(imageUrls) ? imageUrls : [];
        
        if (currentImages.length >= 10) {
            alert("Bạn chỉ có thể đăng tối đa 10 ảnh!");
            return;
        }

        // Cập nhật mảng ảnh mới
        setImageUrls([...currentImages, link]);
        setTempLink("");
    };

    // Xóa một ảnh cụ thể theo index
    const removeImage = (indexToRemove) => {
        if (!Array.isArray(imageUrls)) return;
        setImageUrls(imageUrls.filter((_, index) => index !== indexToRemove));
    };

    // Xử lý thông tin User từ Context
    const username = user?.Username || user?.username || 'Người dùng';
    const avatar = user?.AvatarURL || user?.avatar;
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff`;

    const handleImgError = (e) => {
        e.target.src = defaultAvatar;
    };

    // Kiểm tra số lượng ảnh an toàn
    const imageCount = Array.isArray(imageUrls) ? imageUrls.length : 0;

    return (
        <>
            {/* 1. Thanh trigger ban đầu (Click để mở modal) */}
            <div className="create-post-trigger bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 mb-6 flex items-center gap-4 cursor-pointer hover:bg-[#252525] transition-all" 
                 onClick={() => setIsExpanded(true)}>
                <img 
                    src={avatar || defaultAvatar} 
                    alt="Avatar" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-orange-500/20" 
                    onError={handleImgError} 
                />
                <div className="trigger-input flex-1 text-gray-400 text-sm">
                    Bạn đang nghĩ gì thế, {username}?
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                    <ImageIcon size={22} className="text-orange-500" />
                    <span className="hidden sm:inline text-xs font-medium">Ảnh ({imageCount})</span>
                </div>
            </div>

            {/* 2. Modal đăng bài khi được mở */}
            {isExpanded && (
                <div 
                    className="create-post-overlay fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" 
                    onClick={closeForm}
                >
                    <div 
                        className="create-post-modal bg-[#1a1a1a] w-full max-w-lg rounded-2xl shadow-2xl animate-pop-in border border-gray-800 overflow-hidden" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Modal */}
                        <div className="modal-header flex items-center justify-between p-4 border-b border-gray-800">
                            <h3 className="text-lg font-bold text-white">Tạo bài viết mới</h3>
                            <button className="p-2 hover:bg-gray-800 rounded-full text-gray-400" onClick={closeForm}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* User Profile Info */}
                        <div className="modal-user-info flex items-center gap-3 p-4">
                            <img 
                                src={avatar || defaultAvatar} 
                                alt="Avatar" 
                                className="w-11 h-11 rounded-full object-cover border-2 border-orange-500" 
                                onError={handleImgError} 
                            />
                            <div>
                                <span className="font-bold block text-white">{username}</span>
                                <div className="text-[10px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded-md inline-block">🌐 Công khai</div>
                            </div>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); handlePost(); }}>
                            {/* Vùng nhập nội dung bài viết */}
                            <textarea 
                                autoFocus 
                                value={content} 
                                onChange={(e) => setContent(e.target.value)} 
                                placeholder="Chia sẻ cảm nhận của bạn về Anime..." 
                                className="modal-textarea w-full p-4 bg-transparent text-white resize-none focus:outline-none min-h-[120px] text-lg"
                            />

                            {/* Khu vực xem trước các ảnh đã chọn */}
                            {Array.isArray(imageUrls) && imageUrls.length > 0 && (
                                <div className="image-preview-grid flex flex-wrap gap-2 px-4 mb-4 max-h-[180px] overflow-y-auto">
                                    {imageUrls.map((url, index) => (
                                        <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-700 group">
                                            <img src={url} alt={`preview-${index}`} className="w-full h-full object-cover" />
                                            <button 
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12} color="white" />
                                            </button>
                                        </div>
                                    ))}
                                    {imageUrls.length < 10 && (
                                        <div className="w-20 h-20 border-2 border-dashed border-gray-800 rounded-lg flex items-center justify-center text-gray-600 text-[10px]">
                                            {imageUrls.length}/10
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* Ô nhập Link ảnh */}
                            <div className="mx-4 mb-6">
                                <div className="image-input-container flex items-center gap-2 p-3 border border-gray-800 rounded-xl bg-[#0f0f0f] focus-within:border-orange-500 transition-colors">
                                    <ImageIcon size={18} className="text-orange-500" />
                                    <input 
                                        type="text" 
                                        value={tempLink} 
                                        onChange={(e) => setTempLink(e.target.value)} 
                                        onKeyDown={(e) => { 
                                            if(e.key === 'Enter') { 
                                                e.preventDefault(); 
                                                addImageLink(); 
                                            } 
                                        }}
                                        placeholder={imageCount >= 10 ? "Đã đạt tối đa 10 ảnh" : "Dán link ảnh (JPG, PNG) rồi Enter..."} 
                                        disabled={imageCount >= 10}
                                        className="bg-transparent w-full focus:outline-none text-sm text-gray-300 placeholder:text-gray-600"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={addImageLink}
                                        disabled={!tempLink.trim() || imageCount >= 10}
                                        className="p-1.5 bg-orange-500/10 text-orange-500 rounded-lg hover:bg-orange-500 hover:text-white disabled:opacity-0 transition-all"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1 ml-2">
                                    * Dán link ảnh từ Pinterest, Facebook hoặc Host ảnh bất kỳ.
                                </p>
                            </div>

                            {/* Nút gửi bài viết */}
                            <div className="p-4 border-t border-gray-800">
                                <button 
                                    type="submit" 
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 disabled:bg-gray-800 disabled:text-gray-500 transition-all active:scale-[0.98]" 
                                    disabled={!content.trim() && imageCount === 0}
                                >
                                    <Send size={18} /> ĐĂNG BÀI VIẾT
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default CreatePost; 