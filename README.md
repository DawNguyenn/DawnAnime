#  DAWNANIME - Nền tảng mạng xã hội và quản lý Anime

Dự án phát triển website cộng đồng dành cho người yêu thích Anime/Manga, tích hợp hệ thống bảng xếp hạng (ranking), tương tác bài viết và quản lý cơ sở dữ liệu.

## 🚀 Công nghệ sử dụng
- **Front-end:** React.js, Vite, Tailwind CSS
- **Back-end:** Node.js, Express
- **Database:** SQL Server (MSSQL)

## 📁 Cấu trúc thư mục dự án
- `/frontend`: Mã nguồn giao diện người dùng (React)
- `/backend`: Mã nguồn xử lý API và Logic (Node.js)
- `/database`: Các file script cấu trúc bảng (.sql)

## 🛠️ Hướng dẫn cài đặt và chạy ứng dụng

### 1. Cấu hình Database
- Vào thư mục `/database`, chạy file `schema.sql` trên SQL Server Management Studio để tạo cấu trúc bảng.

### 2. Chạy Back-end
```bash
cd backend
npm install
node index.js

### 3. Chạy Front-end
cd frontend
npm install
npm run dev

📝 Tính năng chính đã hoàn thành
[x] Hệ thống đăng ký / đăng nhập tài khoản.

[x] Tạo bài viết (Post), thích (Like), bình luận (Comment).

[x] Bảng xếp hạng (Ranking) Anime.

[x] Hệ thống thông báo (Notification).
