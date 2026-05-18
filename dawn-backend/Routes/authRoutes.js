const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sql, poolPromise } = require('../dbConfig');
const { JWT_SECRET, verifyToken } = require('../middleware/auth');

// ==========================================
// 1. ĐĂNG NHẬP (POST /login)
// ==========================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ Email và mật khẩu" });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT * FROM Users WHERE Email = @email');

        const user = result.recordset[0];
        if (!user) return res.status(404).json({ message: "Email không tồn tại!" });

        const isMatch = await bcrypt.compare(password, user.PasswordHash);
        if (!isMatch) return res.status(400).json({ message: "Mật khẩu không chính xác!" });

        const token = jwt.sign(
            { id: user.UserID, role: user.RoleID }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: { 
                UserID: user.UserID,
                Username: user.Username, 
                Email: user.Email,
                RoleID: user.RoleID, 
                Level: Number(user.Level || 1), 
                exp: Number(user.exp || 0),
                AvatarURL: user.AvatarURL || null,
                Bio: user.Bio || null
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi kết nối cơ sở dữ liệu!" });
    }
});

// ==========================================
// 2. LẤY THÔNG TIN CÁ NHÂN (GET /me)
// ==========================================
router.get('/me', verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('userId', sql.Int, req.user.id)
            .query(`
                SELECT UserID, Username, Email, RoleID, 
                       ISNULL([Level], 1) AS [Level], 
                       ISNULL(exp, 0) AS exp, 
                       AvatarURL, Bio, FacebookURL 
                FROM Users WHERE UserID = @userId
            `);

        if (result.recordset.length === 0) return res.status(404).json({ message: "Không tìm thấy người dùng" });
        
        const userData = result.recordset[0];
        userData.Level = Number(userData.Level);
        userData.exp = Number(userData.exp);

        res.json(userData);
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server: " + err.message });
    }
});

// ==========================================
// 3. CẬP NHẬT PROFILE (PUT /update-profile)
// ==========================================
router.put('/update-profile', verifyToken, async (req, res) => {
    const Username = (req.body.Username || "").trim();
    const AvatarURL = (req.body.AvatarURL || "").trim();
    const Bio = (req.body.Bio || "").trim();
    const userId = req.user.id;

    if (!Username) return res.status(400).json({ message: "Tên không được để trống!" });

    try {
        const pool = await poolPromise;
        
        // Kiểm tra trùng tên (trừ chính mình)
        const checkUser = await pool.request()
            .input('user', sql.NVarChar, Username)
            .input('uId', sql.Int, userId)
            .query('SELECT UserID FROM Users WHERE Username = @user AND UserID != @uId');

        if (checkUser.recordset.length > 0) return res.status(400).json({ message: "Tên này đã tồn tại!" });

        await pool.request()
            .input('uId', sql.Int, userId)
            .input('user', sql.NVarChar, Username)
            .input('avt', sql.NVarChar, AvatarURL || null)
            .input('bio', sql.NVarChar, Bio || null)
            .query('UPDATE Users SET Username = @user, AvatarURL = @avt, Bio = @bio WHERE UserID = @uId');

        // Lấy lại data sau cập nhật
        const updatedResult = await pool.request()
            .input('uId', sql.Int, userId)
            .query('SELECT UserID, Username, Email, RoleID, ISNULL([Level], 1) AS [Level], ISNULL(exp, 0) AS exp, AvatarURL, Bio FROM Users WHERE UserID = @uId');

        const updatedUser = updatedResult.recordset[0];
        updatedUser.Level = Number(updatedUser.Level);
        updatedUser.exp = Number(updatedUser.exp);

        res.json({ message: "Cập nhật thành công!", user: updatedUser });
    } catch (err) {
        res.status(500).json({ message: "Lỗi SQL: " + err.message });
    }
});

// ==========================================
// 4. BẢNG XẾP HẠNG (GET /top-rankers)
// ==========================================
router.get('/top-rankers', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT TOP 10 UserID, Username, 
                       ISNULL([Level], 1) AS [Level], 
                       ISNULL(exp, 0) AS exp, AvatarURL 
                FROM Users ORDER BY [Level] DESC, exp DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: "Lỗi lấy bảng xếp hạng" });
    }
});

module.exports = router;