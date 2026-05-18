const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../dbConfig');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Áp dụng middleware bảo mật cho toàn bộ các route admin
router.use(verifyToken, isAdmin);

// --- 1. DANH SÁCH BÀI CHỜ DUYỆT (Status = 0) ---
router.get('/pending-posts', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                p.PostID, p.UserID, p.Content, p.ImageUrl, p.CreatedAt, p.Status, 
                ISNULL(u.Username, 'N/A') as Username
            FROM Posts p 
            LEFT JOIN Users u ON p.UserID = u.UserID 
            WHERE p.Status = 0 
            ORDER BY p.CreatedAt DESC
        `);
        res.json(result.recordset);
    } catch (err) { 
        console.error("Lỗi API pending-posts:", err.message);
        res.status(500).json({ message: "Lỗi tải bài viết chờ duyệt." }); 
    }
});

// --- 2. QUẢN LÝ KHO BÀI VIẾT ĐÃ DUYỆT (Status = 1) ---
router.get('/all-posts', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                p.PostID, p.UserID, p.Content, p.ImageUrl, p.CreatedAt, p.Status, 
                ISNULL(u.Username, 'N/A') as Username
            FROM Posts p 
            LEFT JOIN Users u ON p.UserID = u.UserID 
            WHERE p.Status = 1 
            ORDER BY p.CreatedAt DESC
        `);
        res.json(result.recordset);
    } catch (err) { 
        console.error("Lỗi API all-posts:", err.message);
        res.status(500).json({ message: "Lỗi tải kho bài viết." }); 
    }
});

// --- 3. DUYỆT/TỪ CHỐI BÀI + LOGIC CỘNG EXP ---
router.put('/update-post-status', async (req, res) => {
    const { postId, newStatus } = req.body; 
    if (!postId || isNaN(postId)) return res.status(400).json({ message: "ID không hợp lệ." });

    let transaction;
    try {
        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        const updateResult = await transaction.request()
            .input('id', sql.Int, postId)
            .input('status', sql.Int, newStatus)
            .query(`
                UPDATE Posts SET Status = @status, UpdatedAt = GETDATE() 
                OUTPUT inserted.UserID WHERE PostID = @id
            `);

        if (updateResult.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: "Bài viết không tồn tại." });
        }

        if (parseInt(newStatus) === 1) {
            const authorId = updateResult.recordset[0].UserID;
            const EXP_REWARD = 50; 
            await transaction.request()
                .input('authorId', sql.Int, authorId)
                .input('expReward', sql.Int, EXP_REWARD)
                .query(`
                    UPDATE Users SET 
                        Level = CASE WHEN (exp + @expReward) >= 1000 THEN Level + 1 ELSE Level END,
                        exp = CASE WHEN (exp + @expReward) >= 1000 THEN (exp + @expReward) - 1000 ELSE exp + @expReward END
                    WHERE UserID = @authorId
                `);
        }
        await transaction.commit();
        res.json({ success: true, message: "Xử lý thành công!" });
    } catch (err) {
        if (transaction) await transaction.rollback();
        res.status(500).json({ message: "Lỗi hệ thống cập nhật bài viết." });
    }
});

// --- 4. XÓA BÀI VIẾT (Xóa sạch các bảng liên quan) ---
router.delete('/delete-post/:id', async (req, res) => {
    let transaction;
    try {
        const pool = await poolPromise;
        const postId = req.params.id;
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        await transaction.request().input('id', sql.Int, postId).query('DELETE FROM PostLikes WHERE PostID = @id');
        await transaction.request().input('id', sql.Int, postId).query('DELETE FROM Comments WHERE PostID = @id');
        const result = await transaction.request().input('id', sql.Int, postId).query('DELETE FROM Posts WHERE PostID = @id');

        await transaction.commit();
        res.json({ success: true, message: "Đã xóa bài viết." });
    } catch (err) {
        if (transaction) await transaction.rollback();
        res.status(500).json({ message: "Lỗi hệ thống khi xóa bài viết." });
    }
});

// --- 5. DANH SÁCH TỐ CÁO (Sửa lỗi cột CommentText) ---
router.get('/reports', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                r.ReportID, r.ReporterID, r.TargetType, r.TargetID, r.Reason, r.Status, r.CreatedAt,
                u.Username as ReporterName,
                CASE 
                    WHEN r.TargetType = 'Post' THEN (SELECT TOP 1 Content FROM Posts WHERE PostID = r.TargetID)
                    WHEN r.TargetType = 'Comment' THEN (SELECT TOP 1 CommentText FROM Comments WHERE CommentID = r.TargetID)
                    ELSE NULL
                END as TargetContent
            FROM Reports r
            LEFT JOIN Users u ON r.ReporterID = u.UserID
            WHERE r.Status = 'Pending'
            ORDER BY r.CreatedAt DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error("Lỗi lấy tố cáo:", err.message);
        res.status(500).json({ message: "Lỗi SQL: " + err.message });
    }
});

// --- 6. BỎ QUA TỐ CÁO  ---
router.put('/reports/:id/dismiss', async (req, res) => {
    try {
        const pool = await poolPromise;
        const reportId = req.params.id;

        await pool.request()
            .input('id', sql.Int, reportId)
            .query("DELETE FROM Reports WHERE ReportID = @id");

        res.json({ 
            success: true, 
            message: "Đã bỏ qua báo cáo thành công." 
        });
    } catch (err) {
        console.error("Lỗi Backend Dismiss Report:", err);
        res.status(500).json({ message: "Lỗi thực thi hệ thống." });
    }
});

// --- 7. XỬ LÝ TỐ CÁO ---
router.delete('/reports/:id/resolve', async (req, res) => {
    let transaction;
    try {
        const pool = await poolPromise;
        const reportId = req.params.id;

        const reportData = await pool.request()
            .input('id', sql.Int, reportId)
            .query("SELECT TargetType, TargetID FROM Reports WHERE ReportID = @id");

        if (reportData.recordset.length === 0) return res.status(404).json({ message: "Không tìm thấy." });

        const { TargetType, TargetID } = reportData.recordset[0];
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        if (TargetType === 'Post') {
            await transaction.request().input('tid', sql.Int, TargetID).query("DELETE FROM PostLikes WHERE PostID = @tid");
            await transaction.request().input('tid', sql.Int, TargetID).query("DELETE FROM Comments WHERE PostID = @tid");
            await transaction.request().input('tid', sql.Int, TargetID).query("DELETE FROM Posts WHERE PostID = @tid");
        } else if (TargetType === 'Comment') {
            await transaction.request().input('tid', sql.Int, TargetID).query("DELETE FROM Comments WHERE CommentID = @tid");
        }

        await transaction.request()
            .input('tid', sql.Int, TargetID)
            .input('type', sql.NVarChar, TargetType)
            .query("UPDATE Reports SET Status = 'Resolved' WHERE TargetID = @tid AND TargetType = @type");

        await transaction.commit();
        res.json({ success: true, message: "Đã xóa nội dung vi phạm." });
    } catch (err) {
        if (transaction) await transaction.rollback();
        res.status(500).json({ message: "Lỗi hệ thống." });
    }
});

// --- 8. DANH SÁCH THÀNH VIÊN ---
router.get('/users', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT UserID, Username, Email, exp, Level, CreatedAt 
            FROM Users ORDER BY exp DESC, Level DESC
        `);
        res.json(result.recordset);
    } catch (err) { 
        res.status(500).json({ message: "Lỗi tải danh sách thành viên." }); 
    }
});

module.exports = router;