// ==========================================
// STUDYTRACK - DATABASE CONNECTION TEST
// ==========================================

// Import our MySQL connection
const db = require("./db/database");

// ==========================================
// TEST THE CONNECTION
// ==========================================

async function testDatabase() {
    try {
        // Ask MySQL to perform a simple test
        const [rows] = await db.query("SELECT 1 AS test");

        console.log("==================================");
        console.log("DATABASE CONNECTION SUCCESSFUL");
        console.log("==================================");
        console.log(rows);

    } catch (error) {

        console.log("==================================");
        console.log("DATABASE CONNECTION FAILED");
        console.log("==================================");
        console.error(error.message);

    } finally {

        // Close the database connection pool
        await db.end();
    }
}

// Run the test
testDatabase();