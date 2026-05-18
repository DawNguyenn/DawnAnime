import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom'; // Cần thêm dòng này
import { X, AlertTriangle } from 'lucide-react';
import '../../Styles/ReportModal.css';

const reportOptions = [
    "Nội dung nhạy cảm / Bạo lực",
    "Spam / Quảng cáo trái phép",
    "Ngôn từ thù ghét / Xúc phạm",
    "Vi phạm bản quyền Anime",
    "Thông tin sai lệch",
    "Khác"
];

const ReportModal = ({ isOpen, onClose, onSubmit, title }) => {
    const [reason, setReason] = useState("");

    // Khóa cuộn trang khi mở Modal để tránh hiện tượng nhấp nháy khi cuộn
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!reason) return;
        onSubmit(reason);
        setReason(""); 
    };

    // Sử dụng Portal để render Modal trực tiếp vào body
    return ReactDOM.createPortal(
        <div className="report-modal-overlay" onClick={onClose}>
            <div className="report-modal" onClick={(e) => e.stopPropagation()}>
                <div className="report-modal-header">
                    <h3><AlertTriangle size={18} style={{ color: '#f97316' }} /> {title}</h3>
                    <button className="close-x" onClick={onClose}><X size={20}/></button>
                </div>
                <div className="report-modal-body">
                    <p>Tại sao bạn muốn báo cáo nội dung này?</p>
                    <div className="report-options">
                        {reportOptions.map((opt, i) => (
                            <label key={i} className="report-option-item">
                                <input 
                                    type="radio" 
                                    name="reportReason" 
                                    value={opt} 
                                    checked={reason === opt}
                                    onChange={(e) => setReason(e.target.value)}
                                />
                                <span className="radio-label">{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="report-modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Hủy bỏ</button>
                    <button className="btn-submit" onClick={handleConfirm} disabled={!reason}>Gửi báo cáo</button>
                </div>
            </div>
        </div>,
        document.body // Đưa ra ngoài cùng của DOM
    );
};

export default ReportModal;