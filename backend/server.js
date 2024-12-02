const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const User = require('./models/User');
const FactCheck = require('./models/FactCheck');
const fs = require('fs');

// Load ML model and vectorizer
const { PythonShell } = require('python-shell');
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/factCheckingApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDB!");
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
});

// Routes

// User signup
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully!' });
    } catch (err) {
        res.status(500).json({ error: 'Error creating user.' });
    }
});

// User login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }
        const token = jwt.sign({ userId: user._id }, 'secretkey', { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (err) {
        res.status(500).json({ error: 'Error logging in.' });
    }
});

// Fact-checking
app.post('/fact-check', async (req, res) => {
    const { statement, token } = req.body;
    try {
        const decoded = jwt.verify(token, 'secretkey');
        const userId = decoded.userId;

        // Run Python script for fact-checking
        const options = {
            mode: 'text',
            pythonOptions: ['-u'],
            scriptPath: path.join(__dirname, './models'),
            args: [statement]
        };

        PythonShell.run('fact_check.py', options, async (err, results) => {
            if (err) throw err;

            const isFake = results[0];

            // Save to MongoDB
            const newFactCheck = new FactCheck({
                userId,
                statement,
                result: isFake
            });
            await newFactCheck.save();

            res.status(200).json({ result: isFake });
        });
    } catch (err) {
        res.status(500).json({ error: 'Error processing fact-check.' });
    }
});

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});