const jwt = require('jsonwebtoken');
require('dotenv').config();

// Đảm bảo Secret Key đồng bộ với file tạo Token (login)
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

/**
 * 1. HÀM XÁC THỰC TOKEN (Middleware)
 * Kiểm tra tính hợp lệ của Token trước khi cho phép truy cập các API cần bảo mật
 */
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        
        // 1. Kiểm tra header có tồn tại và bắt đầu bằng 'Bearer ' không
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false,
                message: "Bạn chưa đăng nhập hoặc thiếu Token xác thực!" 
            });
        }

        // 2. Trích xuất token
        const tokenParts = authHeader.split(' ');
        const token = tokenParts[1];

        if (!token || token === 'null' || token === 'undefined') {
            return res.status(401).json({ success: false, message: "Token không tồn tại!" });
        }

        // 3. Xác thực token
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                console.error("❌ Lỗi xác thực Token:", err.name, "-", err.message);
                
                if (err.name === 'JsonWebTokenError') {
                    return res.status(403).json({ success: false, message: "Token bị hỏng hoặc không đúng định dạng!" });
                }
                if (err.name === 'TokenExpiredError') {
                    return res.status(403).json({ success: false, message: "Phiên đăng nhập đã hết hạn!" });
                }
                
                return res.status(403).json({ success: false, message: "Token không hợp lệ!" });
            }

            // Gán thông tin user (id, role) vào request để các route sau sử dụng
            req.user = decoded; 
            next();
        });
    } catch (error) {
        console.error("❌ Lỗi hệ thống Middleware:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống xác thực!" });
    }
};

/**
 * 2. HÀM KIỂM TRA QUYỀN ADMIN
 * Chỉ cho phép tiếp tục nếu user có RoleID là 1 (Admin)
 */
const isAdmin = (req, res, next) => {
    // Chúng ta đã thống nhất dùng RoleID hoặc role là 1 cho Admin
    const userRole = req.user?.role || req.user?.RoleID;

    if (req.user && Number(userRole) === 1) {
        next(); 
    } else {
        return res.status(403).json({ 
            success: false,
            message: "Truy cập bị từ chối: Bạn không có quyền quản trị!" 
        });
    }
};

module.exports = { verifyToken, isAdmin, JWT_SECRET };