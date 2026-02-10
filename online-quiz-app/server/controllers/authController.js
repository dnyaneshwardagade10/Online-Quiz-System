const pool = require('../config/database');
const { hashPassword, comparePassword, generateToken } = require('../config/auth');

// Register user
const register = async (req, res) => {
  try {
    const { username, email, password, role = 'student' } = req.body;

    // Check if user exists
    const connection = await pool.getConnection();

    const [existingUser] = await connection.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);

    const [result] = await connection.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );

    connection.release();

    const token = generateToken(result.insertId, role);
    res.status(201).json({
      message: 'User registered successfully',
      userId: result.insertId,
      token,
      role
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const connection = await pool.getConnection();

    const [users] = await connection.query(
      'SELECT id, password, role FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      connection.release();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    connection.release();

    const token = generateToken(user.id, user.role);
    res.json({
      message: 'Login successful',
      userId: user.id,
      token,
      role: user.role
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [users] = await connection.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [req.user.userId]
    );

    connection.release();

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

module.exports = {
  register,
  login,
  getProfile
};
