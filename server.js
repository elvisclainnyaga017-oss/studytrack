// ==========================================
// STUDYTRACK - MAIN NODE.JS SERVER
// ==========================================

// ==========================================
// IMPORT PACKAGES
// ==========================================

const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const path = require("path");

const db = require("./db");

// ==========================================
// CREATE EXPRESS APPLICATION
// ==========================================

const app = express();

const PORT = 3000;

// ==========================================
// MIDDLEWARE
// ==========================================

// Allow Node.js to read JSON sent by the frontend
app.use(express.json());

// Allow Node.js to read form data
app.use(express.urlencoded({ extended: true }));

// ==========================================
// SESSION CONFIGURATION
// ==========================================

app.use(
    session({
        secret: "studytrack-secret-key-change-later",
        resave: false,
        saveUninitialized: false,

        cookie: {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24
        }
    })
);

// ==========================================
// SERVE FRONTEND FILES
// ==========================================

// All files inside the Public folder can be opened
// by the browser.

app.use(express.static(path.join(__dirname, "Public")));

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Check whether the user is logged in
function requireLogin(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Not logged in"
        });
    }

    next();
}


// Convert an empty value to null
function emptyToNull(value) {
    if (value === undefined || value === "") {
        return null;
    }

    return value;
}


// ==========================================
// HOME PAGE
// ==========================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "Public", "login.html"));
});


// ==========================================
// AUTHENTICATION
// ==========================================

// ------------------------------------------
// REGISTER
// ------------------------------------------

app.post("/api/register", async (req, res) => {
    try {
        const { full_name, email, password } = req.body;

        // Validate required information
        if (!full_name || !email || !password) {
            return res.status(400).json({
                message: "Full name, email and password are required."
            });
        }

        // Check whether email already exists
        const [existingUsers] = await db.promise().query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                message: "An account with this email already exists."
            });
        }

        // Encrypt password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const [result] = await db.promise().query(
            `
            INSERT INTO users
            (full_name, email, password_hash)
            VALUES (?, ?, ?)
            `,
            [full_name, email, passwordHash]
        );

        // Create matching profile
        await db.promise().query(
            `
            INSERT INTO profiles
            (id, full_name)
            VALUES (?, ?)
            `,
            [result.insertId, full_name]
        );

        res.status(201).json({
            message: "User registered successfully",
            user_id: result.insertId
        });

    } catch (error) {
        console.error("Register error:", error);

        res.status(500).json({
            message: "Registration failed."
        });
    }
});


// ------------------------------------------
// LOGIN
// ------------------------------------------

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        // Find user
        const [users] = await db.promise().query(
            `
            SELECT id, full_name, email, password_hash
            FROM users
            WHERE email = ?
            `,
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const user = users[0];

        // Check password
        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // Store user ID in session
        req.session.userId = user.id;

        res.json({
            message: "Login successful",
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Login failed."
        });
    }
});


// ------------------------------------------
// CURRENT USER
// ------------------------------------------

app.get("/api/me", requireLogin, async (req, res) => {
    try {
        const [users] = await db.promise().query(
            `
            SELECT id, full_name, email
            FROM users
            WHERE id = ?
            `,
            [req.session.userId]
        );

        if (users.length === 0) {
            req.session.destroy();

            return res.status(401).json({
                message: "User not found."
            });
        }

        res.json({
            user: users[0]
        });

    } catch (error) {
        console.error("Get user error:", error);

        res.status(500).json({
            message: "Could not load user."
        });
    }
});


// ------------------------------------------
// LOGOUT
// ------------------------------------------

app.post("/api/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error("Logout error:", error);

            return res.status(500).json({
                message: "Logout failed."
            });
        }

        res.json({
            message: "Logged out successfully."
        });
    });
});


// ==========================================
// GOALS
// ==========================================

// ------------------------------------------
// GET GOALS
// ------------------------------------------

app.get("/api/goals", requireLogin, async (req, res) => {
    try {
        const [goals] = await db.promise().query(
            `
            SELECT *
            FROM goals
            WHERE user_id = ?
            ORDER BY created_at DESC
            `,
            [req.session.userId]
        );

        res.json({
            goals
        });

    } catch (error) {
        console.error("Get goals error:", error);

        res.status(500).json({
            message: "Could not load goals."
        });
    }
});


// ------------------------------------------
// CREATE GOAL
// ------------------------------------------

app.post("/api/goals", requireLogin, async (req, res) => {
    try {
        const {
            title,
            description,
            deadline,
            current_value,
            target_value,
            unit
        } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "Goal title is required."
            });
        }

        let status = "Not Started";

        const current = Number(current_value || 0);
        const target = Number(target_value || 100);

        if (current >= target) {
            status = "Completed";
        } else if (current > 0) {
            status = "In Progress";
        }

        const [result] = await db.promise().query(
            `
            INSERT INTO goals
            (
                user_id,
                title,
                description,
                deadline,
                current_value,
                target_value,
                unit,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                req.session.userId,
                title,
                emptyToNull(description),
                emptyToNull(deadline),
                current,
                target,
                emptyToNull(unit),
                status
            ]
        );

        res.status(201).json({
            message: "Goal created successfully.",
            goal_id: result.insertId
        });

    } catch (error) {
        console.error("Create goal error:", error);

        res.status(500).json({
            message: "Could not create goal."
        });
    }
});


// ------------------------------------------
// UPDATE GOAL
// ------------------------------------------

app.put("/api/goals/:id", requireLogin, async (req, res) => {
    try {
        const goalId = req.params.id;

        const {
            title,
            description,
            deadline,
            target_value,
            unit
        } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "Goal title is required."
            });
        }

        const [result] = await db.promise().query(
            `
            UPDATE goals
            SET
                title = ?,
                description = ?,
                deadline = ?,
                target_value = ?,
                unit = ?
            WHERE id = ?
            AND user_id = ?
            `,
            [
                title,
                emptyToNull(description),
                emptyToNull(deadline),
                Number(target_value || 100),
                emptyToNull(unit),
                goalId,
                req.session.userId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Goal not found."
            });
        }

        // Recalculate status
        const [goals] = await db.promise().query(
            `
            SELECT current_value, target_value
            FROM goals
            WHERE id = ?
            AND user_id = ?
            `,
            [goalId, req.session.userId]
        );

        if (goals.length > 0) {
            const current = Number(goals[0].current_value || 0);
            const target = Number(goals[0].target_value || 100);

            let status = "Not Started";

            if (current >= target) {
                status = "Completed";
            } else if (current > 0) {
                status = "In Progress";
            }

            await db.promise().query(
                `
                UPDATE goals
                SET status = ?
                WHERE id = ?
                AND user_id = ?
                `,
                [status, goalId, req.session.userId]
            );
        }

        res.json({
            message: "Goal updated successfully."
        });

    } catch (error) {
        console.error("Update goal error:", error);

        res.status(500).json({
            message: "Could not update goal."
        });
    }
});


// ------------------------------------------
// UPDATE GOAL PROGRESS
// ------------------------------------------

app.put("/api/goals/:id/progress", requireLogin, async (req, res) => {
    try {
        const goalId = req.params.id;
        const currentValue = Number(req.body.current_value);

        if (Number.isNaN(currentValue)) {
            return res.status(400).json({
                message: "Current value must be a number."
            });
        }

        const [goals] = await db.promise().query(
            `
            SELECT target_value
            FROM goals
            WHERE id = ?
            AND user_id = ?
            `,
            [goalId, req.session.userId]
        );

        if (goals.length === 0) {
            return res.status(404).json({
                message: "Goal not found."
            });
        }

        const targetValue = Number(goals[0].target_value || 100);

        let status = "Not Started";

        if (currentValue >= targetValue) {
            status = "Completed";
        } else if (currentValue > 0) {
            status = "In Progress";
        }

        await db.promise().query(
            `
            UPDATE goals
            SET
                current_value = ?,
                status = ?
            WHERE id = ?
            AND user_id = ?
            `,
            [
                currentValue,
                status,
                goalId,
                req.session.userId
            ]
        );

        res.json({
            message: "Goal progress updated successfully."
        });

    } catch (error) {
        console.error("Goal progress error:", error);

        res.status(500).json({
            message: "Could not update goal progress."
        });
    }
});


// ------------------------------------------
// DELETE GOAL
// ------------------------------------------

app.delete("/api/goals/:id", requireLogin, async (req, res) => {
    try {
        const [result] = await db.promise().query(
            `
            DELETE FROM goals
            WHERE id = ?
            AND user_id = ?
            `,
            [
                req.params.id,
                req.session.userId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Goal not found."
            });
        }

        res.json({
            message: "Goal deleted successfully."
        });

    } catch (error) {
        console.error("Delete goal error:", error);

        res.status(500).json({
            message: "Could not delete goal."
        });
    }
});


// ==========================================
// TASKS
// ==========================================

// ------------------------------------------
// GET TASKS
// ------------------------------------------

app.get("/api/tasks", requireLogin, async (req, res) => {
    try {
        const [tasks] = await db.promise().query(
            `
            SELECT *
            FROM tasks
            WHERE user_id = ?
            ORDER BY
                CASE
                    WHEN status = 'Completed' THEN 2
                    ELSE 1
                END,
                due_date ASC,
                created_at DESC
            `,
            [req.session.userId]
        );

        res.json({
            tasks
        });

    } catch (error) {
        console.error("Get tasks error:", error);

        res.status(500).json({
            message: "Could not load tasks."
        });
    }
});


// ------------------------------------------
// CREATE TASK
// ------------------------------------------

app.post("/api/tasks", requireLogin, async (req, res) => {
    try {
        const {
            title,
            description,
            due_date,
            priority
        } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "Task title is required."
            });
        }

        const [result] = await db.promise().query(
            `
            INSERT INTO tasks
            (
                user_id,
                title,
                description,
                due_date,
                priority,
                status
            )
            VALUES (?, ?, ?, ?, ?, 'Pending')
            `,
            [
                req.session.userId,
                title,
                emptyToNull(description),
                emptyToNull(due_date),
                priority || "Medium"
            ]
        );

        res.status(201).json({
            message: "Task created successfully.",
            task_id: result.insertId
        });

    } catch (error) {
        console.error("Create task error:", error);

        res.status(500).json({
            message: "Could not create task."
        });
    }
});


// ------------------------------------------
// UPDATE TASK
// ------------------------------------------

app.put("/api/tasks/:id", requireLogin, async (req, res) => {
    try {
        const {
            title,
            description,
            due_date,
            priority,
            status
        } = req.body;

        const [result] = await db.promise().query(
            `
            UPDATE tasks
            SET
                title = ?,
                description = ?,
                due_date = ?,
                priority = ?,
                status = ?
            WHERE id = ?
            AND user_id = ?
            `,
            [
                title,
                emptyToNull(description),
                emptyToNull(due_date),
                priority || "Medium",
                status || "Pending",
                req.params.id,
                req.session.userId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Task not found."
            });
        }

        res.json({
            message: "Task updated successfully."
        });

    } catch (error) {
        console.error("Update task error:", error);

        res.status(500).json({
            message: "Could not update task."
        });
    }
});


// ------------------------------------------
// DELETE TASK
// ------------------------------------------

app.delete("/api/tasks/:id", requireLogin, async (req, res) => {
    try {
        const [result] = await db.promise().query(
            `
            DELETE FROM tasks
            WHERE id = ?
            AND user_id = ?
            `,
            [
                req.params.id,
                req.session.userId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Task not found."
            });
        }

        res.json({
            message: "Task deleted successfully."
        });

    } catch (error) {
        console.error("Delete task error:", error);

        res.status(500).json({
            message: "Could not delete task."
        });
    }
});


// ==========================================
// HABITS
// ==========================================

// ------------------------------------------
// GET HABITS
// ------------------------------------------

app.get("/api/habits", requireLogin, async (req, res) => {
    try {
        const [habits] = await db.promise().query(
            `
            SELECT *
            FROM habits
            WHERE user_id = ?
            ORDER BY created_at DESC
            `,
            [req.session.userId]
        );

        res.json({
            habits
        });

    } catch (error) {
        console.error("Get habits error:", error);

        res.status(500).json({
            message: "Could not load habits."
        });
    }
});


// ------------------------------------------
// CREATE HABIT
// ------------------------------------------

app.post("/api/habits", requireLogin, async (req, res) => {
    try {
        const {
            name,
            description,
            frequency,
            start_date
        } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Habit name is required."
            });
        }

        if (!start_date) {
            return res.status(400).json({
                message: "Start date is required."
            });
        }

        const [result] = await db.promise().query(
            `
            INSERT INTO habits
            (
                user_id,
                name,
                description,
                frequency,
                start_date,
                status
            )
            VALUES (?, ?, ?, ?, ?, 'Active')
            `,
            [
                req.session.userId,
                name,
                emptyToNull(description),
                frequency || "Daily",
                start_date
            ]
        );

        res.status(201).json({
            message: "Habit created successfully.",
            habit_id: result.insertId
        });

    } catch (error) {
        console.error("Create habit error:", error);

        res.status(500).json({
            message: "Could not create habit."
        });
    }
});


// ------------------------------------------
// UPDATE HABIT
// ------------------------------------------

app.put("/api/habits/:id", requireLogin, async (req, res) => {
    try {
        const {
            name,
            description,
            frequency,
            start_date,
            status
        } = req.body;

        const [result] = await db.promise().query(
            `
            UPDATE habits
            SET
                name = ?,
                description = ?,
                frequency = ?,
                start_date = ?,
                status = ?
            WHERE id = ?
            AND user_id = ?
            `,
            [
                name,
                emptyToNull(description),
                frequency || "Daily",
                start_date,
                status || "Active",
                req.params.id,
                req.session.userId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Habit not found."
            });
        }

        res.json({
            message: "Habit updated successfully."
        });

    } catch (error) {
        console.error("Update habit error:", error);

        res.status(500).json({
            message: "Could not update habit."
        });
    }
});


// ------------------------------------------
// DELETE HABIT
// ------------------------------------------

app.delete("/api/habits/:id", requireLogin, async (req, res) => {
    try {
        const [result] = await db.promise().query(
            `
            DELETE FROM habits
            WHERE id = ?
            AND user_id = ?
            `,
            [
                req.params.id,
                req.session.userId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Habit not found."
            });
        }

        res.json({
            message: "Habit deleted successfully."
        });

    } catch (error) {
        console.error("Delete habit error:", error);

        res.status(500).json({
            message: "Could not delete habit."
        });
    }
});


// ==========================================
// REMINDERS
// ==========================================

// ------------------------------------------
// GET REMINDERS
// ------------------------------------------

app.get("/api/reminders", requireLogin, async (req, res) => {
    try {
        const [reminders] = await db.promise().query(
            `
            SELECT *
            FROM reminders
            WHERE user_id = ?
            ORDER BY reminder_date ASC, reminder_time ASC
            `,
            [req.session.userId]
        );

        res.json({
            reminders
        });

    } catch (error) {
        console.error("Get reminders error:", error);

        res.status(500).json({
            message: "Could not load reminders."
        });
    }
});


// ------------------------------------------
// CREATE REMINDER
// ------------------------------------------

app.post("/api/reminders", requireLogin, async (req, res) => {
    try {
        const {
            title,
            description,
            reminder_date,
            reminder_time
        } = req.body;

        if (!title || !reminder_date || !reminder_time) {
            return res.status(400).json({
                message: "Title, date and time are required."
            });
        }

        const [result] = await db.promise().query(
            `
            INSERT INTO reminders
            (
                user_id,
                title,
                description,
                reminder_date,
                reminder_time,
                status
            )
            VALUES (?, ?, ?, ?, ?, 'Pending')
            `,
            [
                req.session.userId,
                title,
                emptyToNull(description),
                reminder_date,
                reminder_time
            ]
        );

        res.status(201).json({
            message: "Reminder created successfully.",
            reminder_id: result.insertId
        });

    } catch (error) {
        console.error("Create reminder error:", error);

        res.status(500).json({
            message: "Could not create reminder."
        });
    }
});


// ------------------------------------------
// UPDATE REMINDER
// ------------------------------------------

app.put("/api/reminders/:id", requireLogin, async (req, res) => {
    try {
        const {
            title,
            description,
            reminder_date,
            reminder_time,
            status
        } = req.body;

        const [result] = await db.promise().query(
            `
            UPDATE reminders
            SET
                title = ?,
                description = ?,
                reminder_date = ?,
                reminder_time = ?,
                status = ?
            WHERE id = ?
            AND user_id = ?
            `,
            [
                title,
                emptyToNull(description),
                reminder_date,
                reminder_time,
                status || "Pending",
                req.params.id,
                req.session.userId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Reminder not found."
            });
        }

        res.json({
            message: "Reminder updated successfully."
        });

    } catch (error) {
        console.error("Update reminder error:", error);

        res.status(500).json({
            message: "Could not update reminder."
        });
    }
});


// ------------------------------------------
// DELETE REMINDER
// ------------------------------------------

app.delete("/api/reminders/:id", requireLogin, async (req, res) => {
    try {
        const [result] = await db.promise().query(
            `
            DELETE FROM reminders
            WHERE id = ?
            AND user_id = ?
            `,
            [
                req.params.id,
                req.session.userId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Reminder not found."
            });
        }

        res.json({
            message: "Reminder deleted successfully."
        });

    } catch (error) {
        console.error("Delete reminder error:", error);

        res.status(500).json({
            message: "Could not delete reminder."
        });
    }
});


// ==========================================
// FOCUS / POMODORO
// ==========================================

// ------------------------------------------
// GET FOCUS HISTORY
// ------------------------------------------

app.get("/api/focus", requireLogin, async (req, res) => {
    try {
        const [focusSessions] = await db.promise().query(
            `
            SELECT *
            FROM focus_sessions
            WHERE user_id = ?
            ORDER BY start_time DESC
            `,
            [req.session.userId]
        );

        res.json({
            focus_sessions: focusSessions
        });

    } catch (error) {
        console.error("Get focus sessions error:", error);

        res.status(500).json({
            message: "Could not load focus history."
        });
    }
});


// ------------------------------------------
// START FOCUS SESSION
// ------------------------------------------

app.post("/api/focus/start", requireLogin, async (req, res) => {
    try {
        const {
            session_type,
            duration_minutes,
            task_id
        } = req.body;

        const duration = Number(duration_minutes || 25);

        const [result] = await db.promise().query(
            `
            INSERT INTO focus_sessions
            (
                user_id,
                task_id,
                session_type,
                start_time,
                duration_minutes,
                status
            )
            VALUES (?, ?, ?, NOW(), ?, 'In Progress')
            `,
            [
                req.session.userId,
                task_id || null,
                session_type || "Focus",
                duration
            ]
        );

        res.status(201).json({
            message: "Focus session started.",
            session_id: result.insertId
        });

    } catch (error) {
        console.error("Start focus error:", error);

        res.status(500).json({
            message: "Could not start focus session."
        });
    }
});


// ------------------------------------------
// COMPLETE FOCUS SESSION
// ------------------------------------------

app.put("/api/focus/:id/complete", requireLogin, async (req, res) => {
    try {
        const [result] = await db.promise().query(
            `
            UPDATE focus_sessions
            SET
                end_time = NOW(),
                status = 'Completed'
            WHERE id = ?
            AND user_id = ?
            `,
            [
                req.params.id,
                req.session.userId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Focus session not found."
            });
        }

        res.json({
            message: "Focus session completed."
        });

    } catch (error) {
        console.error("Complete focus error:", error);

        res.status(500).json({
            message: "Could not complete focus session."
        });
    }
});


// ==========================================
// ERROR HANDLER
// ==========================================

app.use((error, req, res, next) => {
    console.error("Server error:", error);

    res.status(500).json({
        message: "Internal server error."
    });
});


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
    console.log("==========================================");
    console.log("STUDYTRACK SERVER");
    console.log("==========================================");
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("Database: studytrack");
    console.log("==========================================");
});