const app = require('./server');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

if (app && typeof app.listen === 'function') {
    app.listen(PORT, () => {
        console.log(`\n=================================================`);
        console.log(`✅ [DAWN ANIME] Server đang bay tại: http://localhost:${PORT}`);
        console.log(`🚀 Chào Đạt, hệ thống đã sẵn sàng "cook"`);
        console.log(`📂 Routes đã nạp: /api/auth, /api/posts, /api/admin`);
        console.log(`=================================================\n`);
    });
} else {
    console.error("❌ Lỗi: 'app' export từ server.js bị hỏng rồi Đạt ơi!");
}