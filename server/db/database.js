// ==========================================
// STUDYTRACK - MYSQL DATABASE CONNECTION
// ==========================================

// Import the MySQL package
const mysql = require("mysql2/promise");


// ==========================================
// CREATE A CONNECTION POOL
// ==========================================

// A connection pool allows our Node.js server
// to communicate with MySQL efficiently.

const pool = mysql.createPool({
    host: "localhost",

    user: "root",

    password: "",

    database: "studytrack",

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0
});


// ==========================================
// EXPORT THE DATABASE CONNECTION
// ==========================================

module.exports = pool;