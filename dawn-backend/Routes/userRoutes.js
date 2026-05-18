const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sql, poolPromise } = require('../dbConfig');
const { JWT_SECRET, verifyToken } = require('../middleware/auth');

// ==========================================
// 1. ĐĂNG KÝ (POST /api/auth/register)
// ==========================================
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Kiểm tra dữ liệu đầu vào
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: "Vui lòng điền đủ thông tin!" });
        }

        const pool = await poolPromise;

        // Kiểm tra Email hoặc Username đã tồn tại chưa (không phân biệt hoa thường)
        const checkUser = await pool.request()
            .input('email', sql.NVarChar, email)
            .input('user', sql.NVarChar, username)
            .query('SELECT Email, Username FROM Users WHERE Email = @email OR Username = @user');

        if (checkUser.recordset.length > 0) {
            const existing = checkUser.recordset[0];
            if (existing.Email.toLowerCase() === email.toLowerCase()) {
                return res.status(400).json({ success: false, message: "Email này đã được sử dụng!" });
            }
            if (existing.Username.toLowerCase() === username.toLowerCase()) {
                return res.status(400).json({ success: false, message: "Tên đăng nhập này đã tồn tại!" });
            }
        }

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Lưu User mới vào SQL Server (Mặc định RoleID: 2, Level: 1, exp: 0)
        await pool.request()
            .input('user', sql.NVarChar, username)
            .input('email', sql.NVarChar, email)
            .input('pass', sql.NVarChar, hashedPassword)
            .query(`
                INSERT INTO Users (Username, Email, PasswordHash, RoleID, [Level], exp) 
                VALUES (@user, @email, @pass, 2, 1, 0)
            `);

        res.status(201).json({ 
            success: true, 
            message: `Đăng ký thành công! Chào mừng ${username} đến với DawnAnime.` 
        });

    } catch (err) {
        console.error("❌ Lỗi Register:", err.message);
        res.status(500).json({ success: false, message: "Lỗi hệ thống khi đăng ký!" });
    }
});



module.exports = router;