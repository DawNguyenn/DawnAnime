import React from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import '../../Styles/EditPostModal.css';

const EditPostModal = ({ 
    editContent, setEditContent, 
    editImageUrls, setEditImageUrls, 
    onClose, onSubmit 
}) => {

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains('epm-overlay')) {
            onClose();
        }
    };

    const addImageField = () => {
        if (editImageUrls.length < 10) {
            setEditImageUrls([...editImageUrls, ""]);
        }
    };

    const handleImageChange = (index, value) => {
        const newImages = [...editImageUrls];
        newImages[index] = value;
        setEditImageUrls(newImages);
    };

    const removeImageField = (index) => {
        const newImages = editImageUrls.filter((_, i) => i !== index);
        setEditImageUrls(newImages);
    };

    return (
        <div className="edit-modal-overlay epm-overlay" onClick={handleOverlayClick}>
            <div className="edit-modal-content epm-content" onClick={(e) => e.stopPropagation()}>
                
                <div className="epm-header">
                    <h3>Chỉnh sửa bài viết</h3>
                    <button 
                        type="button" 
                        className="epm-close-modal" 
                        onClick={onClose}
                    >
                        <X size={20}/>
                    </button>
                </div>

                <form className="epm-form" onSubmit={onSubmit}>
                    {/* Phần nội dung text */}
                    <div className="epm-input-group">
                        <label>Nội dung bài viết</label>
                        <textarea 
                            value={editContent} 
                            onChange={(e) => setEditContent(e.target.value)} 
                            placeholder="Nội dung bài viết..."
                            rows="4"
                            required
                        />
                    </div>

                    {/* Phần quản lý danh sách ảnh */}
                    <div className="epm-input-group">
                        <div className="epm-label-flex">
                            <label>Hình ảnh ({editImageUrls.length}/10)</label>
                            {editImageUrls.length < 10 && (
                                <button 
                                    type="button" 
                                    className="epm-add-img-btn" 
                                    onClick={addImageField}
                                >
                                    <Plus size={14}/> Thêm ảnh
                                </button>
                            )}
                        </div>
                        
                        <div className="epm-image-list">
                            {editImageUrls.map((url, index) => (
                                <div key={index} className="epm-image-input-item">
                                    <input 
                                        type="text" 
                                        value={url} 
                                        onChange={(e) => handleImageChange(index, e.target.value)} 
                                        placeholder={`Link hình ảnh #${index + 1}`}
                                        className="epm-image-input"
                                    />
                                    <button 
                                        type="button" 
                                        className="epm-remove-img-btn"
                                        onClick={() => removeImageField(index)}
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            ))}
                            {editImageUrls.length === 0 && (
                                <p className="epm-no-img-text">Chưa có hình ảnh nào cho bài viết này.</p>
                            )}
                        </div>
                    </div>

                    <div className="epm-footer">
                        <button type="button" className="epm-btn-cancel" onClick={onClose}>Hủy</button>
                        <button 
                            type="submit" 
                            className="epm-btn-save" 
                            disabled={!editContent.trim()}
                        >
                            Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPostModal;