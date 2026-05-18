# 🌅 DAWNANIME - Anime Community & Ranking Platform

[![React](https://img.shields.io/badge/Front--end-React%20%7C%20Vite-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![NodeJS](https://img.shields.io/badge/Back--end-Node.js%20%7C%20Express-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![SQLServer](https://img.shields.io/badge/Database-SQL%20Server-red?style=for-the-badge&logo=microsoft-sql-server)](https://www.microsoft.com/sql-server)

**DAWNANIME** là một nền tảng mạng xã hội và quản lý thông tin dành riêng cho cộng đồng người yêu thích Anime/Manga. Dự án được xây dựng theo mô hình Full-stack (Monorepo), tích hợp hệ thống tính điểm tương tác, bảng xếp hạng và quản lý cơ sở dữ liệu quan hệ chặt chẽ.

---

## 📌 Tính Năng Chính Dự Án

- **👤 Hệ thống Người dùng:** Đăng ký, đăng nhập (bảo mật mật khẩu băm), quản lý thông tin cá nhân (Avatar, Bio, liên kết Facebook), hệ thống cấp độ (Level, EXP).
- **📝 Mạng xã hội thu nhỏ:** Cho phép người dùng đăng bài viết kèm hình ảnh, tương tác Thích (Like), Không thích (Dislikes) và bình luận (Comments) theo thời gian thực.
- **🏆 Hệ thống Xếp hạng (Ranking):** Bảng vinh danh dựa trên cấp độ và mức độ tương tác của người dùng.
- **🔔 Hệ thống Thông báo:** Cập nhật thông báo tự động trong ứng dụng khi có tương tác mới.
- **🛡️ Quản trị viên (Admin Panel):** Hệ thống gửi báo cáo (Report) bài viết vi phạm, phân quyền người dùng (Roles).

---

## 📁 Cấu Trúc Thư Mục Dự Án (Monorepo)

Dự án được tổ chức gọn gàng trong một kho lưu trữ duy nhất:

```text
dawnanime-project/
├── 📁 anime-app/             # SOURCE CODE FRONT-END (React, Vite, Tailwind)
│   ├── 📁 src/
│   │   ├── 📁 components/    # Các thành phần giao diện tái sử dụng
│   │   ├── App.jsx           # Component chính quản lý luồng
│   │   └── main.jsx
│   └── package.json
│
├── 📁 dawn-backend/          # SOURCE CODE BACK-END (Node.js, Express)
│   ├── 📁 src/
│   │   ├── 📁 controllers/   # Xử lý logic API
│   │   ├── 📁 routes/        # Định tuyến các đường dẫn API
│   │   └── server.js         # File chạy chính của server
│   └── package.json
│
└── 📁 database/              # CƠ SỞ DỮ LIỆU (SQL Server Scripts)
    ├── schema.sql            # Script khởi tạo cấu trúc toàn bộ bảng 
    └── data_seed.sql         # Script chèn dữ liệu mẫu để chạy thử
