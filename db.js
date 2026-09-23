const mysql = require('mysql2');


// ========================================
// DATABASE CONNECTION
// ========================================

const db = mysql.createConnection({

    host: 'localhost',

    user: 'root',

    password: '',

    database: 'studytrack',

    port: 3306,

    // Keep MySQL DATE values as YYYY-MM-DD strings.
    // This prevents JavaScript timezone conversion.
    dateStrings: true

});


// ========================================
// CONNECT TO DATABASE
// ========================================

db.connect((err) => {

    if (err) {

        console.error(
            'Database connection failed:',
            err.message
        );

        return;
    }


    console.log(
        'Connected to StudyTrack MySQL database!'
    );
});


// ========================================
// EXPORT DATABASE CONNECTION
// ========================================

module.exports = db;