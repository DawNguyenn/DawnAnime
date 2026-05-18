const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sql, poolPromise } = require('../dbConfig');
const { JWT_SECRET, verifyToken } = require('../middleware/auth');
// ==========================================
// 1. BÁO CÁO BÀI VIẾT/BÌNH LUẬN (POST /api/reports)
// ==========================================
router.post('/', verifyToken, async (req, res) => {
    const { targetType, targetId, reason } = req.body;
    const reporterId = req.user.id;

    if (!reason) return res.status(400).json({ message: "Vui lòng chọn lý do báo cáo!" });

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('uId', sql.Int, reporterId)
            .input('type', sql.NVarChar, targetType)
            .input('tId', sql.Int, targetId)
            .input('reason', sql.NVarChar, reason)
            .query(`
                INSERT INTO Reports (ReporterID, TargetType, TargetID, Reason) 
                VALUES (@uId, @type, @tId, @reason)
            `);
        res.json({ message: "Cảm ơn bạn! Báo cáo đã được gửi tới quản trị viên." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;