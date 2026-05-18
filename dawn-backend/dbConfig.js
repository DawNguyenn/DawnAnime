const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER, 
    database: process.env.DB_DATABASE,
    port: 1433, 
    options: {
        encrypt: false, 
        trustServerCertificate: true,
        enableArithAbort: true,
        useUTC: false 
    },
    connectionTimeout: 30000 
};

// Tạo pool promise
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('✅ Đã kết nối SQL Server thành công cho DAWN ANIME!');
        return pool;
    })
    .catch(err => {
        console.error('❌ Lỗi kết nối DB chi tiết: ', err.message);
        throw err; // QUAN TRỌNG: Phải throw lỗi để các file khác không bị treo khi gọi pool
    });

module.exports = { sql, poolPromise };