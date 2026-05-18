import React from 'react';
import '../../Styles/PostImageGrid.css';

const PostImageGrid = ({ imageUrl, handleImgError, onImageClick }) => {
    const images = Array.isArray(imageUrl) ? imageUrl : [];

    if (images.length === 0) return null;

    const displayImages = images.slice(0, 4);
    const totalCount = images.length;

    return (
        <div className={`post-image-grid count-${displayImages.length}`}>
            {displayImages.map((url, index) => (
                <div 
                    key={index} 
                    className="grid-item" 
                    onClick={() => onImageClick(index)}
                >
                    <img 
                        src={url} 
                        alt="DAWNANIME post content" 
                        className="actual-img"
                        onError={(e) => {
                            if (handleImgError) handleImgError(e);
                            else e.target.src = 'https://placehold.co/600x400?text=DAWN+Image+Error';
                        }} 
                        loading="lazy"
                    />
                    
                    {/* Hiện số lượng ảnh còn lại nếu tổng số ảnh lớn hơn 4 */}
                    {index === 3 && totalCount > 4 && (
                        <div className="image-overlay">
                            <span>+{totalCount - 4}</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default PostImageGrid;