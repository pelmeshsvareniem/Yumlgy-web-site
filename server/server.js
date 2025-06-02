require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2/promise'); // Using promise-based API for async/await
const bcrypt = require('bcryptjs');
const cors = require('cors');
const fs = require('fs'); // For file system operations, e.g., deleting old profile images

const app = express();
const port = process.env.PORT || 3000; // Server will run on port 3000

// --- MIDDLEWARE ---
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root of your frontend (Yumolgy-web-site folder)
app.use(express.static(path.join(__dirname, '../')));

// Serve uploaded images via a dedicated URL path (e.g., /uploaded_images)
// These files are physically located in Yumolgy-web-site/server/uploads
app.use('/uploaded_images', express.static(path.join(__dirname, 'uploads')));

// --- ROUTE: Serve index.html for the root URL ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// --- MULTER STORAGE CONFIGURATION ---
// This block must come BEFORE any routes that use 'upload', and before app.listen().
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Save files to the 'uploads' directory directly within the 'server' directory
        cb(null, path.join(__dirname, 'uploads/'));
    },
    filename: function (req, file, cb) {
        // Generate a unique filename to prevent overwrites
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


// --- DATABASE CONNECTION POOL ---
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log('Katea'); // Connection successful indicator
        connection.release(); // Release the connection back to the pool
    })
    .catch(err => {
        console.error('Error connecting to MySQL:', err);
    });


// --- API ENDPOINTS ---

// Register User
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const [existingUsers] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'Email already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully!', userId: result.insertId });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// Login User (MODIFIED to include description, favorite_tags, and profile_image_url)
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // Retrieve user from database, including new profile fields
        const [users] = await pool.execute('SELECT id, name, password, description, favorite_tags, profile_image_url FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const user = users[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        res.status(200).json({
            message: 'Login successful!',
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            userDescription: user.description || '',
            userFavoriteTags: user.favorite_tags || '',
            userProfileImageUrl: user.profile_image_url || '' // Added profile_image_url
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// --- GET PROFILE DATA ENDPOINT (MODIFIED to include profile_image_url) ---
app.get('/profile/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // 1. Fetch user's basic profile information
        const [users] = await pool.execute(
            'SELECT id, name, email, description, favorite_tags, profile_image_url FROM users WHERE id = ?', // Added profile_image_url
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const user = users[0];

        // 2. Fetch recipes uploaded by this user
        const [myRecipes] = await pool.execute(
            'SELECT id, name, prep_time, cooking_time, tags, image_url FROM recipes WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );

        const savedRecipes = []; // Placeholder for now, you'd fetch these from a 'saved_recipes' table if you had one

        res.status(200).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                description: user.description || '',
                favoriteTags: user.favorite_tags || '',
                profileImageUrl: user.profile_image_url || '' // Added profileImageUrl
            },
            myRecipes: myRecipes,
            savedRecipes: savedRecipes,
            postsCount: myRecipes.length
        });

    } catch (error) {
        console.error('Error fetching profile data:', error);
        res.status(500).json({ message: 'Failed to fetch profile data.' });
    }
});

// --- NEW: UPDATE PROFILE ENDPOINT (PUT /profile/:userId) ---
app.put('/profile/:userId', upload.single('profilePicture'), async (req, res) => {
    const { userId } = req.params;
    const { name, email, description, favoriteTags, password } = req.body; // password is optional
    const profilePictureFile = req.file; // The uploaded file, if any

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required.' });
    }

    let newProfileImageUrl = null;
    let updateFields = [];
    let queryParams = [];

    // Construct update query dynamically
    if (name) {
        updateFields.push('name = ?');
        queryParams.push(name);
    }
    if (email) {
        updateFields.push('email = ?');
        queryParams.push(email);
    }
    if (description !== undefined) { // Allow empty string for description
        updateFields.push('description = ?');
        queryParams.push(description);
    }
    if (favoriteTags !== undefined) { // Allow empty string for tags
        updateFields.push('favorite_tags = ?');
        queryParams.push(favoriteTags); // favoriteTags comes as a comma-separated string
    }

    try {
        // If a new profile picture is uploaded
        if (profilePictureFile) {
            newProfileImageUrl = `/uploaded_images/${profilePictureFile.filename}`;

            // Fetch old profile image URL to delete it
            const [oldUser] = await pool.execute('SELECT profile_image_url FROM users WHERE id = ?', [userId]);
            if (oldUser.length > 0 && oldUser[0].profile_image_url) {
                // Ensure the path is relative to the server's root for deletion
                const oldImagePath = path.join(__dirname, oldUser[0].profile_image_url.replace('/uploaded_images/', 'uploads/'));

                // Check if file exists before attempting to delete
                if (fs.existsSync(oldImagePath)) {
                    fs.unlink(oldImagePath, (err) => {
                        if (err) console.error('Error deleting old profile image:', err);
                        else console.log('Old profile image deleted:', oldImagePath);
                    });
                }
            }
            updateFields.push('profile_image_url = ?');
            queryParams.push(newProfileImageUrl);
        }

        // Handle password update (only if a new password is provided)
        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push('password = ?');
            queryParams.push(hashedPassword);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No fields provided for update.' });
        }

        const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
        queryParams.push(userId);

        const [result] = await pool.execute(sql, queryParams);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found or no changes made.' });
        }

        // Fetch updated user data to send back (optional, but good for client-side localStorage update)
        const [updatedUsers] = await pool.execute(
            'SELECT id, name, email, description, favorite_tags, profile_image_url FROM users WHERE id = ?',
            [userId]
        );
        const updatedUser = updatedUsers[0];

        res.status(200).json({
            message: 'Profile updated successfully!',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                description: updatedUser.description || '',
                favoriteTags: updatedUser.favorite_tags || '',
                profileImageUrl: updatedUser.profile_image_url || ''
            }
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Failed to update profile. Server error.' });
    }
});


// --- RECIPE CREATION ROUTE (Corrected - No more hardcoded userId) ---
app.post('/recipes', upload.fields([
    { name: 'recipeImage', maxCount: 1 },
    { name: 'directionImages', maxCount: 10 }
]), async (req, res) => {
    try {
        // Make sure userId is destructured from req.body
        const { name, prep_time, cooking_time, tags, description, ingredients, directions, calories, total_fat, protein, carbohydrate, cholesterol, allergens, userId } = req.body;

        const recipeImageFile = req.files && req.files['recipeImage'] ? req.files['recipeImage'][0] : null;
        const directionImageFiles = req.files && req.files['directionImages'] ? req.files['directionImages'] : [];

        const imageUrl = recipeImageFile ? `/uploaded_images/${recipeImageFile.filename}` : null;
        const directionImageUrls = directionImageFiles.map(file => `/uploaded_images/${file.filename}`);

        // Validate that userId is provided by the client
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required to create a recipe.' });
        }

        if (!name || !ingredients || !directions) { // userId check handled above
            return res.status(400).json({ message: 'Missing required recipe fields: name, ingredients, or directions.' });
        }

        const [result] = await pool.execute(
            `INSERT INTO recipes (user_id, name, prep_time, cooking_time, tags, description, ingredients, directions, calories, total_fat, protein, carbohydrate, cholesterol, allergens, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, name, prep_time, cooking_time, tags, description, ingredients, directions, calories, total_fat, protein, carbohydrate, cholesterol, allergens, imageUrl]
        );

        res.status(201).json({ message: 'Recipe created successfully!', recipeId: result.insertId, imageUrl: imageUrl, directionImageUrls: directionImageUrls });

    } catch (error) {
        console.error('Error creating recipe:', error);
        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.status(400).json({ message: 'Too many files or unexpected file field. Please check your file inputs.' });
            }
        }
        res.status(500).json({ message: 'Failed to create recipe. Please try again.' });
    }
});


// --- START THE SERVER ---
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});