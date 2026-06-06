const users = new Map();

const getUser = (email) => users.get(email);

const addUser = (user) => users.set(user.email, user);

const updateUser = (email, updates) => {
  const existing = users.get(email);
  if (!existing) return null;
  const updated = { ...existing, ...updates };
  users.set(email, updated);
  return updated;
};

module.exports = {
  getUser,
  addUser,
  updateUser,
};