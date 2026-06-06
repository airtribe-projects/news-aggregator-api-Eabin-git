const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getUser, addUser, updateUser } = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'news-secret-key';

const validateSignup = (body) => {
  if (!body.name || !body.email || !body.password) {
    return 'name, email, and password are required';
  }
  if (!Array.isArray(body.preferences)) {
    return 'preferences must be an array';
  }
  return null;
};

const signup = async (req, res) => {
  const validationError = validateSignup(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { name, email, password, preferences } = req.body;
  if (getUser(email)) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  addUser({
    name,
    email,
    passwordHash,
    preferences,
  });

  return res.status(200).json({ message: 'Signup successful' });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = getUser(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const nonce = crypto.randomBytes(8).toString('hex');
  const token = jwt.sign({ email: user.email, nonce }, JWT_SECRET, { expiresIn: '2h' });
  return res.status(200).json({ token });
};

const getPreferences = (req, res) => {
  return res.status(200).json({ preferences: req.user.preferences });
};

const updatePreferences = (req, res) => {
  const { preferences } = req.body;
  if (!Array.isArray(preferences)) {
    return res.status(400).json({ error: 'preferences must be an array' });
  }

  const updatedUser = updateUser(req.user.email, { preferences });
  return res.status(200).json({ preferences: updatedUser.preferences });
};

module.exports = {
  signup,
  login,
  getPreferences,
  updatePreferences,
};
