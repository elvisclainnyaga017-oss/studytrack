const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = 3000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'studytrack',
    port: 3306,
    dateStrings: true
});

db.connect((error) => {
    if (error) {
        console.error('Database connection failed:', error);
        return;
    }
    console.log('Database connected successfully.');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'studytrack-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(express.static(path.join(__dirname, 'Public')));

const profilePicturesDirectory = path.join(
    __dirname,
    'uploads',
    'profile-pictures'
);

if (!fs.existsSync(profilePicturesDirectory)) {
    fs.mkdirSync(profilePicturesDirectory, { recursive: true });
}

const profileStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, profilePicturesDirectory);
    },

    filename: function (req, file, callback) {
        const extension = path.extname(file.originalname).toLowerCase();

        const filename =
            `profile-${req.session.userId}-${Date.now()}${extension}`;

        callback(null, filename);
    }
});

const uploadProfilePicture = multer({
    storage: profileStorage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: function (req, file, callback) {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(
                new Error(
                    'Only JPG, PNG, WEBP and GIF images are allowed.'
                )
            );
        }
    }
});

app.use(
    '/uploads/profile-pictures',
    express.static(profilePicturesDirectory)
);

function requireLogin(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({
            message: 'Not logged in'
        });
    }

    next();
}


/* =========================================================
   HOME
   ========================================================= */

app.get('/', (req, res) => {
    res.sendFile(
        path.join(__dirname, 'Public', 'login.html')
    );
});


/* =========================================================
   AUTHENTICATION
   ========================================================= */

app.post('/api/register', async (req, res) => {
    try {
        const {
            full_name,
            email,
            password
        } = req.body;

        if (!full_name || !email || !password) {
            return res.status(400).json({
                message: 'Please fill in all required fields.'
            });
        }

        const cleanName = full_name.trim();
        const cleanEmail = email.trim().toLowerCase();

        const [existingUsers] = await db.promise().query(
            'SELECT id FROM users WHERE email = ?',
            [cleanEmail]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                message: 'An account with this email already exists.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.promise().query(
            `INSERT INTO users
             (full_name, email, password_hash)
             VALUES (?, ?, ?)`,
            [
                cleanName,
                cleanEmail,
                hashedPassword
            ]
        );

        res.status(201).json({
            message: 'Registration successful.',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Registration error:', error);

        res.status(500).json({
            message: 'Registration failed.'
        });
    }
});


app.post('/api/login', async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Please enter your email and password.'
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        const [users] = await db.promise().query(
            `SELECT
                id,
                full_name,
                email,
                password_hash
             FROM users
             WHERE email = ?`,
            [cleanEmail]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: 'Invalid email or password.'
            });
        }

        const user = users[0];

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: 'Invalid email or password.'
            });
        }

        req.session.userId = user.id;
        req.session.userName = user.full_name;
        req.session.userEmail = user.email;

        req.session.save((sessionError) => {
            if (sessionError) {
                console.error(
                    'Session save error:',
                    sessionError
                );

                return res.status(500).json({
                    message: 'Login failed.'
                });
            }

            res.json({
                message: 'Login successful.',

                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email
                }
            });
        });

    } catch (error) {
        console.error('Login error:', error);

        res.status(500).json({
            message: 'Login failed.'
        });
    }
});


app.get('/api/me', requireLogin, async (req, res) => {
    try {
        const [users] = await db.promise().query(
            `SELECT
                id,
                full_name,
                email
             FROM users
             WHERE id = ?`,
            [req.session.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: 'User not found.'
            });
        }

        res.json(users[0]);

    } catch (error) {
        console.error(
            'Get current user error:',
            error
        );

        res.status(500).json({
            message: 'Failed to load user.'
        });
    }
});


app.post('/api/logout', (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error('Logout error:', error);

            return res.status(500).json({
                message: 'Logout failed.'
            });
        }

        res.json({
            message: 'Logout successful.'
        });
    });
});


/* =========================================================
   PROFILE
   ========================================================= */

app.get('/api/profile', requireLogin, async (req, res) => {
    try {
        const [profiles] = await db.promise().query(
            `SELECT
                id,
                user_id,
                phone,
                bio,
                avatar_url,
                created_at,
                updated_at
             FROM profiles
             WHERE user_id = ?`,
            [req.session.userId]
        );

        if (profiles.length === 0) {
            return res.json({
                profile: null
            });
        }

        res.json({
            profile: profiles[0]
        });

    } catch (error) {
        console.error('Get profile error:', error);

        res.status(500).json({
            message: 'Failed to load profile.'
        });
    }
});


app.post('/api/profile', requireLogin, async (req, res) => {
    try {
        const {
            phone,
            bio
        } = req.body;

        const [existingProfiles] = await db.promise().query(
            `SELECT id
             FROM profiles
             WHERE user_id = ?`,
            [req.session.userId]
        );

        if (existingProfiles.length === 0) {
            await db.promise().query(
                `INSERT INTO profiles
                 (user_id, phone, bio)
                 VALUES (?, ?, ?)`,
                [
                    req.session.userId,
                    phone || null,
                    bio || null
                ]
            );

        } else {
            await db.promise().query(
                `UPDATE profiles
                 SET phone = ?,
                     bio = ?
                 WHERE user_id = ?`,
                [
                    phone || null,
                    bio || null,
                    req.session.userId
                ]
            );
        }

        res.json({
            message: 'Profile saved successfully.'
        });

    } catch (error) {
        console.error('Save profile error:', error);

        res.status(500).json({
            message: 'Failed to save profile.'
        });
    }
});


app.post(
    '/api/profile/picture',
    requireLogin,
    uploadProfilePicture.single('profile_picture'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    message: 'Please select an image.'
                });
            }

            const avatarUrl =
                `/uploads/profile-pictures/${req.file.filename}`;

            const [existingProfiles] = await db.promise().query(
                `SELECT
                    id,
                    avatar_url
                 FROM profiles
                 WHERE user_id = ?`,
                [req.session.userId]
            );

            if (existingProfiles.length === 0) {
                await db.promise().query(
                    `INSERT INTO profiles
                     (user_id, avatar_url)
                     VALUES (?, ?)`,
                    [
                        req.session.userId,
                        avatarUrl
                    ]
                );

            } else {
                const oldAvatar =
                    existingProfiles[0].avatar_url;

                await db.promise().query(
                    `UPDATE profiles
                     SET avatar_url = ?
                     WHERE user_id = ?`,
                    [
                        avatarUrl,
                        req.session.userId
                    ]
                );

                if (
                    oldAvatar &&
                    oldAvatar.startsWith(
                        '/uploads/profile-pictures/'
                    )
                ) {
                    const oldFilename =
                        path.basename(oldAvatar);

                    const oldFilePath =
                        path.join(
                            profilePicturesDirectory,
                            oldFilename
                        );

                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                    }
                }
            }

            res.json({
                message:
                    'Profile picture uploaded successfully.',

                avatar_url: avatarUrl
            });

        } catch (error) {
            console.error(
                'Profile picture upload error:',
                error
            );

            res.status(500).json({
                message:
                    'Failed to upload profile picture.'
            });
        }
    }
);


/* =========================================================
   GOALS
   ========================================================= */

app.get('/api/goals', requireLogin, async (req, res) => {
    try {
        const [goals] = await db.promise().query(
            `SELECT
                id,
                user_id,
                title,
                description,
                deadline,
                current_value,
                target_value,
                unit,
                status,
                created_at,
                updated_at
             FROM goals
             WHERE user_id = ?
             ORDER BY id DESC`,
            [req.session.userId]
        );

        res.json(goals);

    } catch (error) {
        console.error('Get goals error:', error);

        res.status(500).json({
            message: 'Failed to load goals.'
        });
    }
});


app.post('/api/goals', requireLogin, async (req, res) => {
    try {
        const {
            title,
            description,
            deadline,
            current_value,
            target_value,
            unit
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: 'Goal title is required.'
            });
        }

        const cleanCurrentValue =
            current_value === undefined ||
                current_value === null ||
                current_value === ''
                ? 0
                : Number(current_value);

        const cleanTargetValue =
            target_value === undefined ||
                target_value === null ||
                target_value === ''
                ? 100
                : Number(target_value);

        if (
            !Number.isFinite(cleanCurrentValue) ||
            cleanCurrentValue < 0
        ) {
            return res.status(400).json({
                message:
                    'Current progress must be a valid number of 0 or greater.'
            });
        }

        if (
            !Number.isFinite(cleanTargetValue) ||
            cleanTargetValue <= 0
        ) {
            return res.status(400).json({
                message:
                    'Target value must be a valid number greater than 0.'
            });
        }

        if (cleanCurrentValue > cleanTargetValue) {
            return res.status(400).json({
                message:
                    'Current progress cannot be greater than the target value.'
            });
        }

        const goalStatus =
            cleanCurrentValue >= cleanTargetValue
                ? 'Completed'
                : cleanCurrentValue > 0
                    ? 'In Progress'
                    : 'Not Started';

        const [result] = await db.promise().query(
            `INSERT INTO goals
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
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.session.userId,
                title.trim(),
                description || null,
                deadline || null,
                cleanCurrentValue,
                cleanTargetValue,
                unit || null,
                goalStatus
            ]
        );

        res.status(201).json({
            message: 'Goal created successfully.',
            goalId: result.insertId
        });

    } catch (error) {
        console.error('Create goal error:', error);

        res.status(500).json({
            message: 'Failed to create goal.'
        });
    }
});


app.put('/api/goals/:id', requireLogin, async (req, res) => {
    try {
        const {
            title,
            description,
            deadline,
            current_value,
            target_value,
            unit
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: 'Goal title is required.'
            });
        }

        const cleanCurrentValue =
            current_value === undefined ||
                current_value === null ||
                current_value === ''
                ? 0
                : Number(current_value);

        const cleanTargetValue =
            target_value === undefined ||
                target_value === null ||
                target_value === ''
                ? 100
                : Number(target_value);

        if (
            !Number.isFinite(cleanCurrentValue) ||
            cleanCurrentValue < 0
        ) {
            return res.status(400).json({
                message:
                    'Current progress must be a valid number of 0 or greater.'
            });
        }

        if (
            !Number.isFinite(cleanTargetValue) ||
            cleanTargetValue <= 0
        ) {
            return res.status(400).json({
                message:
                    'Target value must be a valid number greater than 0.'
            });
        }

        if (cleanCurrentValue > cleanTargetValue) {
            return res.status(400).json({
                message:
                    'Current progress cannot be greater than the target value.'
            });
        }

        const goalStatus =
            cleanCurrentValue >= cleanTargetValue
                ? 'Completed'
                : cleanCurrentValue > 0
                    ? 'In Progress'
                    : 'Not Started';

        const [result] = await db.promise().query(
            `UPDATE goals
             SET
                title = ?,
                description = ?,
                deadline = ?,
                current_value = ?,
                target_value = ?,
                unit = ?,
                status = ?
             WHERE id = ?
             AND user_id = ?`,
            [
                title.trim(),
                description || null,
                deadline || null,
                cleanCurrentValue,
                cleanTargetValue,
                unit || null,
                goalStatus,
                req.params.id,
                req.session.userId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Goal not found.'
            });
        }

        res.json({
            message: 'Goal updated successfully.'
        });

    } catch (error) {
        console.error('Update goal error:', error);

        res.status(500).json({
            message: 'Failed to update goal.'
        });
    }
});


app.put(
    '/api/goals/:id/progress',
    requireLogin,
    async (req, res) => {
        try {
            const progress =
                Number(req.body.progress);

            if (
                !Number.isFinite(progress) ||
                progress < 0 ||
                progress > 100
            ) {
                return res.status(400).json({
                    message:
                        'Progress must be between 0 and 100.'
                });
            }

            const [goalRows] = await db.promise().query(
                `SELECT target_value
                 FROM goals
                 WHERE id = ?
                 AND user_id = ?`,
                [
                    req.params.id,
                    req.session.userId
                ]
            );

            if (goalRows.length === 0) {
                return res.status(404).json({
                    message: 'Goal not found.'
                });
            }

            const targetValue =
                Number(goalRows[0].target_value);

            if (
                !Number.isFinite(targetValue) ||
                targetValue <= 0
            ) {
                return res.status(400).json({
                    message:
                        'This goal has an invalid target value.'
                });
            }

            const newCurrentValue =
                (targetValue * progress) / 100;

            const goalStatus =
                progress >= 100
                    ? 'Completed'
                    : progress > 0
                        ? 'In Progress'
                        : 'Not Started';

            const [result] = await db.promise().query(
                `UPDATE goals
                 SET
                    current_value = ?,
                    status = ?
                 WHERE id = ?
                 AND user_id = ?`,
                [
                    newCurrentValue,
                    goalStatus,
                    req.params.id,
                    req.session.userId
                ]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: 'Goal not found.'
                });
            }

            res.json({
                message:
                    'Goal progress updated successfully.',

                progress: progress,

                current_value:
                    newCurrentValue,

                target_value:
                    targetValue,

                status:
                    goalStatus
            });

        } catch (error) {
            console.error(
                'Update goal progress error:',
                error
            );

            res.status(500).json({
                message:
                    'Failed to update goal progress.'
            });
        }
    }
);


app.delete(
    '/api/goals/:id',
    requireLogin,
    async (req, res) => {
        try {
            const [result] = await db.promise().query(
                `DELETE FROM goals
                 WHERE id = ?
                 AND user_id = ?`,
                [
                    req.params.id,
                    req.session.userId
                ]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: 'Goal not found.'
                });
            }

            res.json({
                message: 'Goal deleted successfully.'
            });

        } catch (error) {
            console.error(
                'Delete goal error:',
                error
            );

            res.status(500).json({
                message:
                    'Failed to delete goal.'
            });
        }
    }
);


/* =========================================================
   TASKS
   ========================================================= */

app.get('/api/tasks', requireLogin, async (req, res) => {
    try {
        const [tasks] = await db.promise().query(
            `SELECT *
             FROM tasks
             WHERE user_id = ?
             ORDER BY id DESC`,
            [req.session.userId]
        );

        res.json(tasks);

    } catch (error) {
        console.error('Get tasks error:', error);

        res.status(500).json({
            message: 'Failed to load tasks.'
        });
    }
});


app.post('/api/tasks', requireLogin, async (req, res) => {
    try {
        const {
            title,
            description,
            due_date,
            priority,
            status
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: 'Task title is required.'
            });
        }

        const [result] = await db.promise().query(
            `INSERT INTO tasks
             (
                user_id,
                title,
                description,
                due_date,
                priority,
                status
             )
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                req.session.userId,
                title.trim(),
                description || null,
                due_date || null,
                priority || 'Medium',
                status || 'Pending'
            ]
        );

        res.status(201).json({
            message: 'Task created successfully.',
            taskId: result.insertId
        });

    } catch (error) {
        console.error('Create task error:', error);

        res.status(500).json({
            message: 'Failed to create task.'
        });
    }
});


/* =========================================================
   HABITS
   ========================================================= */

app.get('/api/habits', requireLogin, async (req, res) => {
    try {
        const [habits] = await db.promise().query(
            `SELECT *
             FROM habits
             WHERE user_id = ?
             ORDER BY id DESC`,
            [req.session.userId]
        );

        res.json(habits);

    } catch (error) {
        console.error('Get habits error:', error);

        res.status(500).json({
            message: 'Failed to load habits.'
        });
    }
});


/* =========================================================
   REMINDERS
   ========================================================= */

app.get(
    '/api/reminders',
    requireLogin,
    async (req, res) => {
        try {
            const [reminders] =
                await db.promise().query(
                    `SELECT *
                     FROM reminders
                     WHERE user_id = ?
                     ORDER BY id DESC`,
                    [req.session.userId]
                );

            res.json(reminders);

        } catch (error) {
            console.error(
                'Get reminders error:',
                error
            );

            res.status(500).json({
                message:
                    'Failed to load reminders.'
            });
        }
    }
);


/* =========================================================
   FOCUS SESSIONS
   ========================================================= */

app.get(
    '/api/focus',
    requireLogin,
    async (req, res) => {
        try {
            const [sessions] =
                await db.promise().query(
                    `SELECT *
                     FROM focus_sessions
                     WHERE user_id = ?
                     ORDER BY id DESC`,
                    [req.session.userId]
                );

            res.json(sessions);

        } catch (error) {
            console.error(
                'Get focus sessions error:',
                error
            );

            res.status(500).json({
                message:
                    'Failed to load focus sessions.'
            });
        }
    }
);


/* =========================================================
   ERROR HANDLER
   ========================================================= */

app.use((error, req, res, next) => {
    console.error(
        'Server error:',
        error
    );

    if (error instanceof multer.MulterError) {
        return res.status(400).json({
            message: error.message
        });
    }

    if (error && error.message) {
        return res.status(400).json({
            message: error.message
        });
    }

    res.status(500).json({
        message:
            'An unexpected server error occurred.'
    });
});


/* =========================================================
   START SERVER
   ========================================================= */

app.listen(PORT, () => {
    console.log(
        '=========================================='
    );

    console.log(
        'STUDYTRACK SERVER'
    );

    console.log(
        '=========================================='
    );

    console.log(
        `Server running on http://localhost:${PORT}`
    );

    console.log(
        'Database: studytrack'
    );

    console.log(
        'Profile uploads: uploads/profile-pictures'
    );

    console.log(
        '=========================================='
    );
});