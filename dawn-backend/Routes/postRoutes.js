const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../dbConfig');
const { verifyToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// ==========================================
// 1. LẤY BÀI VIẾT CỘNG ĐỒNG
// ==========================================
router.get('/community', async (req, res) => {
    let currentUserId = 0;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
            currentUserId = decoded.id;
        } catch (err) {
            currentUserId = 0;
        }
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('currentUserId', sql.Int, currentUserId)
            .query(`
                SELECT 
                    p.PostID, p.Content, p.ImageUrl, 
                    CONVERT(VARCHAR, p.CreatedAt, 126) as CreatedAt,
                    p.Status, p.UserID,
                    u.Username, u.Level, u.AvatarURL,
                    (SELECT COUNT(*) FROM PostLikes WHERE PostID = p.PostID) as LikesCount,
                    (SELECT COUNT(*) FROM PostDislikes WHERE PostID = p.PostID) as DislikesCount,
                    (SELECT COUNT(*) FROM Comments WHERE PostID = p.PostID) as CommentsCount,
                    CASE WHEN EXISTS(SELECT 1 FROM PostLikes WHERE PostID = p.PostID AND UserID = @currentUserId) THEN 1 ELSE 0 END as UserLiked,
                    CASE WHEN EXISTS(SELECT 1 FROM PostDislikes WHERE PostID = p.PostID AND UserID = @currentUserId) THEN 1 ELSE 0 END as UserDisliked
                FROM Posts p
                INNER JOIN Users u ON p.UserID = u.UserID
                WHERE p.Status = 1
                ORDER BY p.CreatedAt DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error("Lỗi lấy bài viết:", err);
        res.status(500).json({ message: "Lỗi hệ thống khi tải bài viết." });
    }
});

// ==========================================
// 2. CHỈNH SỬA BÀI VIẾT (Đã đồng bộ mảng ảnh)
// ==========================================
router.put('/:id', verifyToken, async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;
    const { content, imageUrl } = req.body; // Frontend gửi imageUrl là mảng []

    if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Nội dung bài viết không được để trống!" });
    }

    try {
        const pool = await poolPromise;
        
        // Kiểm tra quyền sở hữu bài viết
        const checkPost = await pool.request()
            .input('pId', sql.Int, postId)
            .query('SELECT UserID FROM Posts WHERE PostID = @pId');

        if (checkPost.recordset.length === 0) return res.status(404).json({ message: "Không tìm thấy bài viết!" });
        if (checkPost.recordset[0].UserID !== userId) return res.status(403).json({ message: "Bạn không có quyền sửa bài này!" });

        // CHUYỂN ĐỔI: Lưu mảng ảnh thành chuỗi JSON để không làm hỏng cấu trúc dữ liệu
        const imageString = Array.isArray(imageUrl) ? JSON.stringify(imageUrl) : imageUrl;

        await pool.request()
            .input('pId', sql.Int, postId)
            .input('content', sql.NVarChar, content)
            .input('img', sql.NVarChar, imageString || null)
            .query(`
                UPDATE Posts 
                SET Content = @content, ImageUrl = @img, UpdatedAt = GETDATE()
                WHERE PostID = @pId
            `);

        res.json({ message: "Cập nhật thành công!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ==========================================
// 3. XÓA BÀI VIẾT
// ==========================================
router.delete('/:id', verifyToken, async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;
    try {
        const pool = await poolPromise;
        const checkPost = await pool.request()
            .input('pId', sql.Int, postId)
            .query('SELECT UserID FROM Posts WHERE PostID = @pId');

        if (checkPost.recordset.length === 0) return res.status(404).json({ message: "Không tìm thấy!" });
        if (checkPost.recordset[0].UserID !== userId) return res.status(403).json({ message: "Không có quyền!" });

        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            const request = new sql.Request(transaction);
            request.input('pId', sql.Int, postId);
            // Xóa hết dữ liệu liên quan để tránh lỗi khóa ngoại (Foreign Key)
            await request.query('DELETE FROM PostLikes WHERE PostID = @pId');
            await request.query('DELETE FROM PostDislikes WHERE PostID = @pId');
            await request.query('DELETE FROM Comments WHERE PostID = @pId');
            await request.query('DELETE FROM Reports WHERE TargetType = \'Post\' AND TargetID = @pId');
            await request.query('DELETE FROM Posts WHERE PostID = @pId');
            
            await transaction.commit();
            res.json({ message: "Đã xóa bài viết thành công!" });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ==========================================
// 4. TƯƠNG TÁC (LIKE & DISLIKE)
// ==========================================
router.post('/:id/like', verifyToken, async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;
    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            const request = new sql.Request(transaction);
            request.input('pId', sql.Int, postId).input('uId', sql.Int, userId);
            await request.query('DELETE FROM PostDislikes WHERE PostID = @pId AND UserID = @uId');
            const checkLike = await request.query('SELECT 1 FROM PostLikes WHERE PostID = @pId AND UserID = @uId');
            if (checkLike.recordset.length > 0) {
                await request.query('DELETE FROM PostLikes WHERE PostID = @pId AND UserID = @uId');
            } else {
                await request.query('INSERT INTO PostLikes (PostID, UserID, CreatedAt) VALUES (@pId, @uId, GETDATE())');
            }
            const finalData = await request.query(`
                SELECT 
                    (SELECT COUNT(*) FROM PostLikes WHERE PostID = @pId) as newLikes,
                    (SELECT COUNT(*) FROM PostDislikes WHERE PostID = @pId) as newDislikes,
                    CASE WHEN EXISTS(SELECT 1 FROM PostLikes WHERE PostID = @pId AND UserID = @uId) THEN 1 ELSE 0 END as UserLiked,
                    CASE WHEN EXISTS(SELECT 1 FROM PostDislikes WHERE PostID = @pId AND UserID = @uId) THEN 1 ELSE 0 END as UserDisliked
            `);
            await transaction.commit();
            res.json(finalData.recordset[0]);
        } catch (err) { await transaction.rollback(); throw err; }
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/dislike', verifyToken, async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;
    try {
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
            const request = new sql.Request(transaction);
            request.input('pId', sql.Int, postId).input('uId', sql.Int, userId);
            await request.query('DELETE FROM PostLikes WHERE PostID = @pId AND UserID = @uId');
            const checkDislike = await request.query('SELECT 1 FROM PostDislikes WHERE PostID = @pId AND UserID = @uId');
            if (checkDislike.recordset.length > 0) {
                await request.query('DELETE FROM PostDislikes WHERE PostID = @pId AND UserID = @uId');
            } else {
                await request.query('INSERT INTO PostDislikes (PostID, UserID, CreatedAt) VALUES (@pId, @uId, GETDATE())');
            }
            const finalData = await request.query(`
                SELECT 
                    (SELECT COUNT(*) FROM PostLikes WHERE PostID = @pId) as newLikes,
                    (SELECT COUNT(*) FROM PostDislikes WHERE PostID = @pId) as newDislikes,
                    CASE WHEN EXISTS(SELECT 1 FROM PostLikes WHERE PostID = @pId AND UserID = @uId) THEN 1 ELSE 0 END as UserLiked,
                    CASE WHEN EXISTS(SELECT 1 FROM PostDislikes WHERE PostID = @pId AND UserID = @uId) THEN 1 ELSE 0 END as UserDisliked
            `);
            await transaction.commit();
            res.json(finalData.recordset[0]);
        } catch (err) { await transaction.rollback(); throw err; }
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ==========================================
// 5. ĐĂNG BÀI MỚI (Hỗ trợ lưu mảng ảnh JSON)
// ==========================================
router.post('/', verifyToken, async (req, res) => {
    const { content, imageUrl } = req.body; // imageUrl là mảng []
    if (!content?.trim()) return res.status(400).json({ message: "Nội dung không được để trống!" });
    
    try {
        const pool = await poolPromise;
        
        // CHUYỂN ĐỔI: Chuyển mảng ảnh thành chuỗi JSON
        const imageString = Array.isArray(imageUrl) ? JSON.stringify(imageUrl) : imageUrl;

        await pool.request()
            .input('userId', sql.Int, req.user.id)
            .input('content', sql.NVarChar, content)
            .input('img', sql.NVarChar, imageString || null)
            .query(`INSERT INTO Posts (UserID, Content, ImageUrl, Status, CreatedAt) VALUES (@userId, @content, @img, 0, GETDATE())`);
        
        res.status(201).json({ message: "Bài viết đã được gửi và đang chờ duyệt!" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 6. LẤY DANH SÁCH BÌNH LUẬN
router.get('/:id/comments', async (req, res) => {
    const postId = req.params.id;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('pId', sql.Int, postId)
            .query(`
                SELECT
                    c.CommentID, c.CommentText, c.UserID,
                    CONVERT(VARCHAR, c.CreatedAt, 126) as CreatedAt,
                    u.Username, u.Level, u.AvatarURL
                FROM Comments c
                INNER JOIN Users u ON c.UserID = u.UserID
                WHERE c.PostID = @pId
                ORDER BY c.CreatedAt DESC
            `);
        res.json(result.recordset);
    } catch (err) { res.status(500).json({ message: "Không thể tải bình luận." }); }
});

// 7. GỬI BÌNH LUẬN MỚI
router.post('/:id/comments', verifyToken, async (req, res) => {
    const { commentText } = req.body;
    if (!commentText?.trim()) return res.status(400).json({ message: "Nội dung trống!" });
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('pId', sql.Int, req.params.id)
            .input('uId', sql.Int, req.user.id)
            .input('txt', sql.NVarChar, commentText)
            .query('INSERT INTO Comments (PostID, UserID, CommentText, CreatedAt) VALUES (@pId, @uId, @txt, GETDATE())');
        res.status(201).json({ message: "Đã bình luận!" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 8. CHỈNH SỬA BÌNH LUẬN
router.put('/comments/:commentId', verifyToken, async (req, res) => {
    const { commentId } = req.params;
    const { commentText } = req.body;
    const userId = req.user.id;
    if (!commentText?.trim()) return res.status(400).json({ message: "Nội dung không được để trống!" });
    try {
        const pool = await poolPromise;
        const checkOwner = await pool.request()
            .input('cId', sql.Int, commentId)
            .query('SELECT UserID FROM Comments WHERE CommentID = @cId');
        if (checkOwner.recordset.length === 0) return res.status(404).json({ message: "Bình luận không tồn tại!" });
        if (checkOwner.recordset[0].UserID !== userId) return res.status(403).json({ message: "Bạn không có quyền sửa bình luận này!" });
        await pool.request()
            .input('cId', sql.Int, commentId)
            .input('txt', sql.NVarChar, commentText)
            .query('UPDATE Comments SET CommentText = @txt WHERE CommentID = @cId');
        res.json({ message: "Cập nhật bình luận thành công!" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// 9. XÓA BÌNH LUẬN
router.delete('/comments/:commentId', verifyToken, async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id;
    try {
        const pool = await poolPromise;
        const checkOwner = await pool.request()
            .input('cId', sql.Int, commentId)
            .query('SELECT UserID FROM Comments WHERE CommentID = @cId');
        if (checkOwner.recordset.length === 0) return res.status(404).json({ message: "Bình luận không tồn tại!" });
        if (checkOwner.recordset[0].UserID !== userId) return res.status(403).json({ message: "Bạn không có quyền xóa bình luận này!" });
        await pool.request()
            .input('cId', sql.Int, commentId)
            .query('DELETE FROM Comments WHERE CommentID = @cId');
        res.json({ message: "Đã xóa bình luận!" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;