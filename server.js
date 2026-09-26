const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('./db');

const app = express();
const PORT = 3000;


/* ==========================================
   PROFILE IMAGE UPLOAD CONFIGURATION
========================================== */

const profilePicturesDirectory =
    path.join(
        __dirname,
        'uploads',
        'profile-pictures'
    );


fs.mkdirSync(
    profilePicturesDirectory,
    {
        recursive: true
    }
);


const profilePictureStorage =
    multer.diskStorage({

        destination: (req, file, callback) => {

            callback(
                null,
                profilePicturesDirectory
            );

        },

        filename: (req, file, callback) => {

            const extension =
                path.extname(
                    file.originalname
                ).toLowerCase();

            const uniqueName =
                `profile-${req.session.userId}-${Date.now()}${extension}`;

            callback(
                null,
                uniqueName
            );

        }

    });


const profilePictureUpload =
    multer({

        storage:
            profilePictureStorage,

        limits: {
            fileSize:
                5 * 1024 * 1024
        },

        fileFilter:
            (req, file, callback) => {

                const allowedTypes = [
                    'image/jpeg',
                    'image/png',
                    'image/webp'
                ];


                if (
                    allowedTypes.includes(
                        file.mimetype
                    )
                ) {

                    callback(
                        null,
                        true
                    );

                } else {

                    callback(
                        new Error(
                            'Only JPG, PNG and WebP images are allowed'
                        )
                    );

                }

            }

    });


/* ==========================================
   BASIC SERVER CONFIGURATION
========================================== */

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


app.use(
    session({
        secret: 'studytrack-secret-key',

        resave: false,

        saveUninitialized: false,

        cookie: {
            maxAge:
                24 * 60 * 60 * 1000
        }

    })
);


app.use(
    express.static(
        path.join(
            __dirname,
            'Public'
        )
    )
);


/*
    Serve uploaded profile pictures.
*/

app.use(
    '/uploads',
    express.static(
        path.join(
            __dirname,
            'uploads'
        )
    )
);


/* ==========================================
   LOGIN CHECK
========================================== */

function requireLogin(req, res, next) {

    if (!req.session.userId) {

        return res.status(401).json({
            message:
                'Not logged in'
        });

    }

    next();

}


/* ==========================================
   HELPER FUNCTION
========================================== */

function emptyToNull(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return null;

    }


    const trimmed =
        String(value).trim();


    return trimmed === ''
        ? null
        : trimmed;

}


/* ==========================================
   HOME PAGE
========================================== */

app.get('/', (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            'Public',
            'login.html'
        )
    );

});


/* ==========================================
   AUTHENTICATION
========================================== */


/* ---------- REGISTER ---------- */

app.post(
    '/api/register',
    async (req, res) => {

        try {

            const {
                full_name,
                email,
                password
            } = req.body;


            if (
                !full_name ||
                !email ||
                !password
            ) {

                return res.status(400).json({
                    message:
                        'Please fill in all fields'
                });

            }


            const [existingUsers] =
                await db.promise().query(
                    'SELECT id FROM users WHERE email = ?',
                    [email]
                );


            if (
                existingUsers.length > 0
            ) {

                return res.status(400).json({
                    message:
                        'Email already exists'
                });

            }


            const password_hash =
                await bcrypt.hash(
                    password,
                    10
                );


            const [result] =
                await db.promise().query(
                    `
                    INSERT INTO users
                    (full_name, email, password_hash)
                    VALUES (?, ?, ?)
                    `,
                    [
                        full_name,
                        email,
                        password_hash
                    ]
                );


            await db.promise().query(
                `
                INSERT INTO profiles
                (id, full_name)
                VALUES (?, ?)
                `,
                [
                    result.insertId,
                    full_name
                ]
            );


            res.status(201).json({
                message:
                    'Registration successful',

                user_id:
                    result.insertId
            });


        } catch (error) {

            console.error(
                'Registration error:',
                error
            );


            res.status(500).json({
                message:
                    'Registration failed'
            });

        }

    }
);


/* ---------- LOGIN ---------- */

app.post(
    '/api/login',
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;


            if (
                !email ||
                !password
            ) {

                return res.status(400).json({
                    message:
                        'Please enter your email and password'
                });

            }


            const [users] =
                await db.promise().query(
                    `
                    SELECT
                        id,
                        full_name,
                        email,
                        password_hash
                    FROM users
                    WHERE email = ?
                    `,
                    [email]
                );


            if (
                users.length === 0
            ) {

                return res.status(401).json({
                    message:
                        'Invalid email or password'
                });

            }


            const user =
                users[0];


            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password_hash
                );


            if (!passwordMatch) {

                return res.status(401).json({
                    message:
                        'Invalid email or password'
                });

            }


            req.session.userId =
                user.id;


            res.json({

                message:
                    'Login successful',

                user: {
                    id:
                        user.id,

                    full_name:
                        user.full_name,

                    email:
                        user.email
                }

            });


        } catch (error) {

            console.error(
                'Login error:',
                error
            );


            res.status(500).json({
                message:
                    'Login failed'
            });

        }

    }
);


/* ---------- CURRENT USER ---------- */

app.get(
    '/api/me',
    requireLogin,
    async (req, res) => {

        try {

            const [users] =
                await db.promise().query(
                    `
                    SELECT
                        id,
                        full_name,
                        email
                    FROM users
                    WHERE id = ?
                    `,
                    [req.session.userId]
                );


            if (
                users.length === 0
            ) {

                return res.status(404).json({
                    message:
                        'User not found'
                });

            }


            res.json({
                user:
                    users[0]
            });


        } catch (error) {

            console.error(
                'Get current user error:',
                error
            );


            res.status(500).json({
                message:
                    'Failed to get user information'
            });

        }

    }
);


/* ---------- LOGOUT ---------- */

app.post(
    '/api/logout',
    (req, res) => {

        req.session.destroy(
            (error) => {

                if (error) {

                    console.error(
                        'Logout error:',
                        error
                    );


                    return res.status(500).json({
                        message:
                            'Logout failed'
                    });

                }


                res.json({
                    message:
                        'Logout successful'
                });

            }
        );

    }
);


/* ==========================================
   PROFILE
========================================== */


/* ---------- GET PROFILE ---------- */

app.get(
    '/api/profile',
    requireLogin,
    async (req, res) => {

        try {

            const userId =
                req.session.userId;


            const [rows] =
                await db.promise().query(
                    `
                    SELECT
                        users.id,
                        users.full_name,
                        users.email,
                        profiles.university,
                        profiles.course,
                        profiles.avatar_url,
                        profiles.created_at,
                        profiles.updated_at
                    FROM users
                    LEFT JOIN profiles
                        ON users.id = profiles.id
                    WHERE users.id = ?
                    `,
                    [userId]
                );


            if (
                rows.length === 0
            ) {

                return res.status(404).json({
                    message:
                        'User not found'
                });

            }


            const profile =
                rows[0];


            /*
                If the user does not have a profile row,
                create one automatically.
            */

            if (
                profile.university === null &&
                profile.course === null &&
                profile.avatar_url === null &&
                profile.created_at === null
            ) {

                await db.promise().query(
                    `
                    INSERT INTO profiles
                    (id, full_name)
                    VALUES (?, ?)
                    `,
                    [
                        userId,
                        profile.full_name
                    ]
                );


                const [updatedRows] =
                    await db.promise().query(
                        `
                        SELECT
                            users.id,
                            users.full_name,
                            users.email,
                            profiles.university,
                            profiles.course,
                            profiles.avatar_url,
                            profiles.created_at,
                            profiles.updated_at
                        FROM users
                        LEFT JOIN profiles
                            ON users.id = profiles.id
                        WHERE users.id = ?
                        `,
                        [userId]
                    );


                return res.json({
                    profile:
                        updatedRows[0]
                });

            }


            res.json({
                profile
            });


        } catch (error) {

            console.error(
                'Get profile error:',
                error
            );


            res.status(500).json({
                message:
                    'Failed to get profile'
            });

        }

    }
);


/* ---------- UPDATE PROFILE ---------- */

app.put(
    '/api/profile',
    requireLogin,
    async (req, res) => {

        try {

            const userId =
                req.session.userId;


            const {
                full_name,
                university,
                course
            } = req.body;


            if (
                !full_name ||
                !String(full_name).trim()
            ) {

                return res.status(400).json({
                    message:
                        'Full name is required'
                });

            }


            const cleanFullName =
                String(
                    full_name
                ).trim();


            const cleanUniversity =
                emptyToNull(
                    university
                );


            const cleanCourse =
                emptyToNull(
                    course
                );


            /*
                Update the main users table.
            */

            await db.promise().query(
                `
                UPDATE users
                SET full_name = ?
                WHERE id = ?
                `,
                [
                    cleanFullName,
                    userId
                ]
            );


            /*
                Insert the profile if it does not exist.
                Otherwise update the existing profile.

                Notice that avatar_url is NOT changed here.
                Profile pictures are handled by the
                dedicated upload routes below.
            */

            await db.promise().query(
                `
                INSERT INTO profiles
                (
                    id,
                    full_name,
                    university,
                    course
                )
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    full_name = VALUES(full_name),
                    university = VALUES(university),
                    course = VALUES(course)
                `,
                [
                    userId,
                    cleanFullName,
                    cleanUniversity,
                    cleanCourse
                ]
            );


            /*
                Return the updated profile.
            */

            const [rows] =
                await db.promise().query(
                    `
                    SELECT
                        users.id,
                        users.full_name,
                        users.email,
                        profiles.university,
                        profiles.course,
                        profiles.avatar_url,
                        profiles.created_at,
                        profiles.updated_at
                    FROM users
                    LEFT JOIN profiles
                        ON users.id = profiles.id
                    WHERE users.id = ?
                    `,
                    [userId]
                );


            res.json({

                message:
                    'Profile updated successfully',

                profile:
                    rows[0]

            });


        } catch (error) {

            console.error(
                'Update profile error:',
                error
            );


            res.status(500).json({
                message:
                    'Failed to update profile'
            });

        }

    }
);


/* ---------- UPLOAD PROFILE PICTURE ---------- */

app.post(
    '/api/profile/avatar',
    requireLogin,
    (req, res) => {

        profilePictureUpload.single('avatar')(
            req,
            res,
            async (error) => {

                try {

                    if (error) {

                        if (
                            error instanceof
                            multer.MulterError
                        ) {

                            if (
                                error.code ===
                                'LIMIT_FILE_SIZE'
                            ) {

                                return res
                                    .status(400)
                                    .json({
                                        message:
                                            'Profile picture must be 5 MB or smaller'
                                    });

                            }


                            return res
                                .status(400)
                                .json({
                                    message:
                                        'Profile picture upload failed'
                                });

                        }


                        return res
                            .status(400)
                            .json({
                                message:
                                    error.message ||
                                    'Invalid profile picture'
                            });

                    }


                    if (!req.file) {

                        return res
                            .status(400)
                            .json({
                                message:
                                    'Please choose a profile picture'
                            });

                    }


                    const userId =
                        req.session.userId;


                    /*
                        Get the old picture so that
                        it can be removed after the
                        new picture is saved.
                    */

                    const [oldRows] =
                        await db.promise().query(
                            `
                            SELECT avatar_url
                            FROM profiles
                            WHERE id = ?
                            `,
                            [userId]
                        );


                    const oldAvatarUrl =
                        oldRows.length > 0
                            ? oldRows[0].avatar_url
                            : null;


                    const avatarUrl =
                        `/uploads/profile-pictures/${req.file.filename}`;


                    /*
                        Make sure a profile row exists.
                    */

                    await db.promise().query(
                        `
                        INSERT INTO profiles
                        (
                            id,
                            full_name,
                            avatar_url
                        )
                        SELECT
                            id,
                            full_name,
                            ?
                        FROM users
                        WHERE id = ?
                        ON DUPLICATE KEY UPDATE
                            avatar_url = VALUES(avatar_url)
                        `,
                        [
                            avatarUrl,
                            userId
                        ]
                    );


                    /*
                        Delete the previous uploaded
                        picture if it belongs to
                        StudyTrack.
                    */

                    if (
                        oldAvatarUrl &&
                        oldAvatarUrl.startsWith(
                            '/uploads/profile-pictures/'
                        )
                    ) {

                        const oldFileName =
                            path.basename(
                                oldAvatarUrl
                            );


                        const oldFilePath =
                            path.join(
                                profilePicturesDirectory,
                                oldFileName
                            );


                        if (
                            fs.existsSync(
                                oldFilePath
                            )
                        ) {

                            fs.unlinkSync(
                                oldFilePath
                            );

                        }

                    }


                    res.json({

                        message:
                            'Profile picture uploaded successfully',

                        avatar_url:
                            avatarUrl

                    });


                } catch (error) {

                    console.error(
                        'Profile picture upload error:',
                        error
                    );


                    /*
                        If something went wrong after
                        the file was saved, remove the
                        newly uploaded file.
                    */

                    if (
                        req.file &&
                        req.file.path &&
                        fs.existsSync(
                            req.file.path
                        )
                    ) {

                        fs.unlinkSync(
                            req.file.path
                        );

                    }


                    res.status(500).json({

                        message:
                            'Failed to save profile picture'

                    });

                }

            }
        );

    }
);


/* ---------- REMOVE PROFILE PICTURE ---------- */

app.delete(
    '/api/profile/avatar',
    requireLogin,
    async (req, res) => {

        try {

            const userId =
                req.session.userId;


            const [rows] =
                await db.promise().query(
                    `
                    SELECT avatar_url
                    FROM profiles
                    WHERE id = ?
                    `,
                    [userId]
                );


            if (
                rows.length === 0
            ) {

                return res.json({
                    message:
                        'No profile picture to remove'
                });

            }


            const avatarUrl =
                rows[0].avatar_url;


            await db.promise().query(
                `
                UPDATE profiles
                SET avatar_url = NULL
                WHERE id = ?
                `,
                [userId]
            );


            /*
                Only delete files that were
                uploaded by StudyTrack.
            */

            if (
                avatarUrl &&
                avatarUrl.startsWith(
                    '/uploads/profile-pictures/'
                )
            ) {

                const fileName =
                    path.basename(
                        avatarUrl
                    );


                const filePath =
                    path.join(
                        profilePicturesDirectory,
                        fileName
                    );


                if (
                    fs.existsSync(
                        filePath
                    )
                ) {

                    fs.unlinkSync(
                        filePath
                    );

                }

            }


            res.json({

                message:
                    'Profile picture removed successfully'

            });


        } catch (error) {

            console.error(
                'Remove profile picture error:',
                error
            );


            res.status(500).json({

                message:
                    'Failed to remove profile picture'

            });

        }

    }
);


/* ==========================================
   GOALS
========================================== */


/* ---------- GET GOALS ---------- */

app.get(
    '/api/goals',
    requireLogin,
    async (req, res) => {

        try {

            const [rows] =
                await db.promise().query(
                    `
                    SELECT *
                    FROM goals
                    WHERE user_id = ?
                    ORDER BY id DESC
                    `,
                    [req.session.userId]
                );


            res.json({
                goals:
                    rows
            });


        } catch (error) {

            console.error(
                'Get goals error:',
                error
            );


            res.status(500).json({
                message:
                    'Failed to get goals'
            });

        }

    }
);


/* ---------- CREATE GOAL ---------- */

app.post(
    '/api/goals',
    requireLogin,
    async (req, res) => {

        try {

            const {
                title,
                description,
                category,
                deadline
            } = req.body;


            if (!title) {

                return res.status(400).json({
                    message:
                        'Goal title is required'
                });

            }


            const [result] =
                await db.promise().query(
                    `
                    INSERT INTO goals
                    (
                        user_id,
                        title,
                        description,
                        category,
                        deadline,
                        progress
                    )
                    VALUES (?, ?, ?, ?, ?, 0)
                    `,
                    [
                        req.session.userId,
                        title,
                        emptyToNull(
                            description
                        ),
                        emptyToNull(
                            category
                        ),
                        emptyToNull(
                            deadline
                        )
                    ]
                );


            res.status(201).json({

                message:
                    'Goal created successfully',

                goal_id:
                    result.insertId

            });


        } catch (error) {

            console.error(
                'Create goal error:',
                error
            );


            res.status(500).json({
                message:
                    'Failed to create goal'
            });

        }

    }
);


/* ---------- UPDATE GOAL ---------- */

app.put(
    '/api/goals/:id',
    requireLogin,
    async (req, res) => {

        try {

            const {
                title,
                description,
                category,
                deadline
            } = req.body;


            const [result] =
                await db.promise().query(
                    `
                    UPDATE goals
                    SET
                        title = ?,
                        description = ?,
                        category = ?,
                        deadline = ?
                    WHERE id = ?
                    AND user_id = ?
                    `,
                    [
                        title,
                        emptyToNull(
                            description
                        ),
                        emptyToNull(
                            category
                        ),
                        emptyToNull(
                            deadline
                        ),
                        req.params.id,
                        req.session.userId
                    ]
                );


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({
                    message:
                        'Goal not found'
                });

            }


            res.json({
                message:
                    'Goal updated successfully'
            });


        } catch (error) {

            console.error(
                'Update goal error:',
                error
            );


            res.status(500).json({
                message:
                    'Failed to update goal'
            });

        }

    }
);


/* ---------- UPDATE GOAL PROGRESS ---------- */

app.put(
    '/api/goals/:id/progress',
    requireLogin,
    async (req, res) => {

        try {

            const {
                progress
            } = req.body;


            if (
                progress === undefined ||
                progress < 0 ||
                progress > 100
            ) {

                return res.status(400).json({
                    message:
                        'Progress must be between 0 and 100'
                });

            }


            const [result] =
                await db.promise().query(
                    `
                    UPDATE goals
                    SET progress = ?
                    WHERE id = ?
                    AND user_id = ?
                    `,
                    [
                        progress,
                        req.params.id,
                        req.session.userId
                    ]
                );


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({
                    message:
                        'Goal not found'
                });

            }


            res.json({
                message:
                    'Goal progress updated successfully'
            });


        } catch (error) {

            console.error(
                'Update goal progress error:',
                error
            );


            res.status(500).json({
                message:
                    'Failed to update goal progress'
            });

        }

    }
);


/* ---------- DELETE GOAL ---------- */

app.delete(
    '/api/goals/:id',
    requireLogin,
    async (req, res) => {

        try {

            const [result] =
                await db.promise().query(
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


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({
                    message:
                        'Goal not found'
                });

            }


            res.json({
                message:
                    'Goal deleted successfully'
            });


        } catch (error) {

            console.error(
                'Delete goal error:',
                error
            );


            res.status(500).json({
                message:
                    'Failed to delete goal'
            });

        }

    }
);


/* ==========================================
   TASKS
========================================== */


/* ---------- GET TASKS ---------- */

app.get(
    '/api/tasks',
    requireLogin,
    async (req, res) => {

        try {

            const [rows] =
                await db.promise().query(
                    `
                    SELECT *
                    FROM tasks
                    WHERE user_id = ?
                    ORDER BY id DESC
                    `,
                    [req.session.userId]
                );


            res.json({
                tasks:
                    rows
            });


        } catch (error) {

            console.error(
                'Get tasks error:',
                error
            );


            res.status(500).json({
                message:
                    'Failed to get tasks'
            });

        }

    }
);


/* ---------- CREATE TASK ---------- */

app.post(
    '/api/tasks',
    requireLogin,
    async (req, res) => {

        try {

            const {
                title,
                description,
                priority,
                due_date
            } = req.body;


            if (!title) {

                return res.status(400).json({
                    message:
                        'Task title is required'
                });

            }


            const [result] =
                await db.promise().query(
                    `
                    INSERT INTO tasks
                    (
                        user_id,
                        title,
                        description,
                        priority,
                        due_date
                    )
                    VALUES (?, ?, ?, ?, ?)
                    `,
                    [
                        req.session.userId,
                        title,
                        emptyToNull(
                            description
                        ),
                        emptyToNull(
                            priority
                        ),
                        emptyToNull(
                            due_date
                        )
                    ]
                );


            res.status(201).json({

                message:
                    'Task created successfully',

                task_id:
                    result.insertId

            });


        } catch (error) {

            console.error(
                'Create task error:',
                error
            );


            res.status(500).json({
                message:
                    'Failed to create task'
            });

        }

    }
);


/* ---------- UPDATE TASK ---------- */

app.put(
    '/api/tasks/:id',
    requireLogin,
    async (req, res) => {

        try {

            const {
                title,
                description,
                priority,
                due_date,
                completed
            } = req.body;


            const [result] =
                await db.promise().query(
                    `
                    UPDATE tasks
                    SET
                        title = ?,
                        description = ?,
                        priority = ?,
                        due_date = ?,
                        completed = ?
                    WHERE id = ?
                    AND user_id = ?
                    `,
                    [
                        title,
                        emptyToNull(
                            description
                        ),
                        emptyToNull(
                            priority
                        ),
                        emptyToNull(
                            due_date
                        ),
                        completed ? 1 : 0,
                        req.params.id,
                        req.session.userId
                    ]
                );


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({
                    message:
                        'Task not found'
                });

            }


            res.json({
                message:
                    'Task updated successfully'
            });


        } catch (error) {

            console.error(
                'Update task error:',
                error
            );


            res.status(500).json({
                message:
                    'Failed to update task'
            });

        }

    }
);


/* ---------- DELETE TASK ---------- */

app.delete(
    '/api/tasks/:id',
    requireLogin,
    async (req, res) => {

        try {

            const [result] =
                await db.promise().query(
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


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({
                    message:
                        'Task not found'
                });

            }


            res.json({
                message:
                    'Task deleted successfully'
            });


        } catch (error) {

            console.error(
                'Delete task error:',
                error
            );


            res.status(500).json({
                message:
                    'Failed to delete task'
            });

        }

    }
);


/* ==========================================
   HABITS
========================================== */


/* ---------- GET HABITS ---------- */

app.get(
    '/api/habits',
    requireLogin,
    async (req, res) => {

        try {

            const [rows] =
                await db.promise().query(
                    `
                    SELECT *
                    FROM habits
                    WHERE user_id = ?
                    ORDER BY id DESC
                    `,
                    [req.session.userId]
                );


            res.json({
                habits:
                    rows
            });


        } catch (error) {

            console.error(
                'Get habits error:',
                error
            );


            res.status(500).json({
                message:
                    'Failed to get habits'
            });

        }

    }
);


/* ---------- CREATE HABIT ---------- */

app.post(
    '/api/habits',
    requireLogin,
    async (req, res) => {

        try {

            const {
                name,
                description,
                frequency
            } = req.body;


            if (!name) {

                return res.status(400).json({
                    message:
                        'Habit name is required'
                });

            }


            const [result] =
                await db.promise().query(
                    `
                    INSERT INTO habits
                    (
                        user_id,
                        name,
                        description,
                        frequency
                    )
                    VALUES (?, ?, ?, ?)
                    `,
                    [
                        req.session.userId,
                        name,
                        emptyToNull(
                            description
                        ),
                        emptyToNull(
                            frequency
                        )
                    ]
                );


            res.status(201).json({

                message:
                    'Habit created successfully',

                habit_id:
                    result.insertId

            });


        } catch (error) {

            console.error(
                'Create habit error:',
                error
            );


            res.status(500).json({
                message:
                    'Failed to create habit'
            });

        }

    }
);


/* ---------- UPDATE HABIT ---------- */

app.put(
    '/api/habits/:id',
    requireLogin,
    async (req, res) => {

        try {

            const {
                name,
                description,
                frequency
            } = req.body;


            const [result] =
                await db.promise().query(
                    `
                    UPDATE habits
                    SET
                        name = ?,
                        description = ?,
                        frequency = ?
                    WHERE id = ?
                    AND user_id = ?
                    `,
                    [
                        name,
                        emptyToNull(
                            description
                        ),
                        emptyToNull(
                            frequency
                        ),
                        req.params.id,
                        req.session.userId
                    ]
                );


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({
                    message:
                        'Habit not found'
                });

            }


            res.json({
                message:
                    'Habit updated successfully'
            });


        } catch (error) {

            console.error(
                'Update habit error:',
                error
            );


            res.status(500).json({
                message:
                    'Failed to update habit'
            });

        }

    }
);


/* ---------- DELETE HABIT ---------- */

app.delete(
    '/api/habits/:id',
    requireLogin,
    async (req, res) => {

        try {

            const [result] =
                await db.promise().query(
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


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({
                    message:
                        'Habit not found'
                });

            }


            res.json({
                message:
                    'Habit deleted successfully'
            });


        } catch (error) {

            console.error(
                'Delete habit error:',
                error
            );


            res.status(500).json({
                message:
                    'Failed to delete habit'
            });

        }

    }
);


/* ==========================================
   REMINDERS
========================================== */


/* ---------- GET REMINDERS ---------- */

app.get(
    '/api/reminders',
    requireLogin,
    async (req, res) => {

        try {

            const [rows] =
                await db.promise().query(
                    `
                    SELECT *
                    FROM reminders
                    WHERE user_id = ?
                    ORDER BY id DESC
                    `,
                    [req.session.userId]
                );


            res.json({
                reminders:
                    rows
            });


        } catch (error) {

            console.error(
                'Get reminders error:',
                error
            );


            res.status(500).json({
                message:
                    'Failed to get reminders'
            });

        }

    }
);


/* ---------- CREATE REMINDER ---------- */

app.post(
    '/api/reminders',
    requireLogin,
    async (req, res) => {

        try {

            const {
                title,
                description,
                reminder_date,
                reminder_time
            } = req.body;


            if (!title) {

                return res.status(400).json({
                    message:
                        'Reminder title is required'
                });

            }


            const [result] =
                await db.promise().query(
                    `
                    INSERT INTO reminders
                    (
                        user_id,
                        title,
                        description,
                        reminder_date,
                        reminder_time
                    )
                    VALUES (?, ?, ?, ?, ?)
                    `,
                    [
                        req.session.userId,
                        title,
                        emptyToNull(
                            description
                        ),
                        emptyToNull(
                            reminder_date
                        ),
                        emptyToNull(
                            reminder_time
                        )
                    ]
                );


            res.status(201).json({

                message:
                    'Reminder created successfully',

                reminder_id:
                    result.insertId

            });


        } catch (error) {

            console.error(
                'Create reminder error:',
                error
            );


            res.status(500).json({
                message:
                    'Failed to create reminder'
            });

        }

    }
);


/* ---------- UPDATE REMINDER ---------- */

app.put(
    '/api/reminders/:id',
    requireLogin,
    async (req, res) => {

        try {

            const {
                title,
                description,
                reminder_date,
                reminder_time
            } = req.body;


            const [result] =
                await db.promise().query(
                    `
                    UPDATE reminders
                    SET
                        title = ?,
                        description = ?,
                        reminder_date = ?,
                        reminder_time = ?
                    WHERE id = ?
                    AND user_id = ?
                    `,
                    [
                        title,
                        emptyToNull(
                            description
                        ),
                        emptyToNull(
                            reminder_date
                        ),
                        emptyToNull(
                            reminder_time
                        ),
                        req.params.id,
                        req.session.userId
                    ]
                );


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({
                    message:
                        'Reminder not found'
                });

            }


            res.json({
                message:
                    'Reminder updated successfully'
            });


        } catch (error) {

            console.error(
                'Update reminder error:',
                error
            );


            res.status(500).json({
                message:
                    'Failed to update reminder'
            });

        }

    }
);


/* ---------- DELETE REMINDER ---------- */

app.delete(
    '/api/reminders/:id',
    requireLogin,
    async (req, res) => {

        try {

            const [result] =
                await db.promise().query(
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


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({
                    message:
                        'Reminder not found'
                });

            }


            res.json({
                message:
                    'Reminder deleted successfully'
            });


        } catch (error) {

            console.error(
                'Delete reminder error:',
                error
            );


            res.status(500).json({
                message:
                    'Failed to delete reminder'
            });

        }

    }
);


/* ==========================================
   FOCUS
========================================== */


/* ---------- GET FOCUS HISTORY ---------- */

app.get(
    '/api/focus',
    requireLogin,
    async (req, res) => {

        try {

            const [rows] =
                await db.promise().query(
                    `
                    SELECT *
                    FROM focus_sessions
                    WHERE user_id = ?
                    ORDER BY id DESC
                    `,
                    [req.session.userId]
                );


            res.json({
                sessions:
                    rows
            });


        } catch (error) {

            console.error(
                'Get focus sessions error:',
                error
            );


            res.status(500).json({
                message:
                    'Failed to get focus sessions'
            });

        }

    }
);


/* ---------- START FOCUS SESSION ---------- */

app.post(
    '/api/focus/start',
    requireLogin,
    async (req, res) => {

        try {

            const {
                duration_minutes
            } = req.body;


            const [result] =
                await db.promise().query(
                    `
                    INSERT INTO focus_sessions
                    (
                        user_id,
                        duration_minutes,
                        started_at
                    )
                    VALUES (?, ?, NOW())
                    `,
                    [
                        req.session.userId,
                        duration_minutes || 25
                    ]
                );


            res.status(201).json({

                message:
                    'Focus session started',

                session_id:
                    result.insertId

            });


        } catch (error) {

            console.error(
                'Start focus session error:',
                error
            );


            res.status(500).json({
                message:
                    'Failed to start focus session'
            });

        }

    }
);


/* ---------- COMPLETE FOCUS SESSION ---------- */

app.put(
    '/api/focus/:id/complete',
    requireLogin,
    async (req, res) => {

        try {

            const [result] =
                await db.promise().query(
                    `
                    UPDATE focus_sessions
                    SET
                        completed = 1,
                        completed_at = NOW()
                    WHERE id = ?
                    AND user_id = ?
                    `,
                    [
                        req.params.id,
                        req.session.userId
                    ]
                );


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({
                    message:
                        'Focus session not found'
                });

            }


            res.json({
                message:
                    'Focus session completed'
            });


        } catch (error) {

            console.error(
                'Complete focus session error:',
                error
            );


            res.status(500).json({
                message:
                    'Failed to complete focus session'
            });

        }

    }
);


/* ==========================================
   ERROR HANDLER
========================================== */

app.use(
    (error, req, res, next) => {

        console.error(
            'Server error:',
            error
        );


        res.status(500).json({
            message:
                'Internal server error'
        });

    }
);


/* ==========================================
   START SERVER
========================================== */

app.listen(
    PORT,
    () => {

        console.log('');

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

    }
);