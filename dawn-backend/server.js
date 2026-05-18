const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// --- IMPORT ROUTES ---
const userRoutes = require('./Routes/userRoutes');
const postRoutes = require('./Routes/postRoutes');
const adminRoutes = require('./Routes/adminRoutes');
const authRoutes = require('./Routes/authRoutes');
const reportRoutes = require('./Routes/reportRoutes');

// --- SỬ DỤNG ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);

app.use((err, req, res, next) => {
    console.error(" Lỗi hệ thống:", err.stack);
    res.status(500).json({ message: "Server gặp sự cố, thử lại sau nhé!" });
});

module.exports = app;