const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      dob,
      gender,
      address,
      country,
      state,
      city
    } = req.body;

    // ✅ Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    // ✅ Create user
    const user = new User({
      username,
      email,
      password,
      dob,
      gender,
      address: address || "",
      country,
      state,
      city,
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: "Signup successful ✅",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error ❌" });
  }
});
// POST /api/auth/login
router.post('/login', async (req, res) => {
  console.log('Login attempt:', req.body.email);
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.json({
      message: "Login successful ✅",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        bestWpm: user.bestWpm,
        bestAccuracy: user.bestAccuracy,
        testsCompleted: user.testsCompleted
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error ❌" });
  }
});

// GET /api/auth/me
const authMiddleware = require('../middleware/auth');
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error ❌" });
  }
});

// PUT /api/auth/stats
router.put('/stats', authMiddleware, async (req, res) => {
  try {
    const { wpm, accuracy } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update stats
    user.testsCompleted += 1;
    if (wpm > user.bestWpm) {
      user.bestWpm = wpm;
    }
    if (accuracy > user.bestAccuracy) {
      user.bestAccuracy = accuracy;
    }

    await user.save();

    res.json({
      bestWpm: user.bestWpm,
      bestAccuracy: user.bestAccuracy,
      testsCompleted: user.testsCompleted
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error ❌" });
  }
});

// GET /api/auth/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const topUsers = await User.find({})
      .sort({ bestWpm: -1 })
      .limit(10)
      .select('username bestWpm bestAccuracy testsCompleted');
    res.json(topUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error ❌" });
  }
});

// PUT /api/auth/profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, dob, gender, address, city, state, country } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username) user.username = username;
    if (dob) user.dob = dob;
    if (gender) user.gender = gender;
    if (address) user.address = address;
    if (city) user.city = city;
    if (state) user.state = state;
    if (country) user.country = country;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error ❌" });
  }
});

module.exports = router;