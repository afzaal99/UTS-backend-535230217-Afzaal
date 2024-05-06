const { User } = require('../../../models');

/**
 * Get a list of users
 * @returns {Promise}
 */
async function getUsers() {
  return User.find({});
}

/**
 * Get total count of users
 * @returns {Promise<number>} - Total count of users
 */
async function getTotalUsers() {
  return User.countDocuments();
}

/**
 * Get users filtered by name or email
 * @param {string} search - Search query (e.g., "name:John" or "email:example@example.com")
 * @returns {Promise<Array>} - Array of user objects
 */
async function getUsersFiltered(search) {
  let filter = {};

  // If search query is provided
  if (search) {
    const searchRegex = /^(name|email):(.*)$/;
    const match = search.match(searchRegex);

    if (match) {
      const [,, value] = match; // Destructuring match array untuk mendapatkan value
  
      // Mendapatkan field dari regex match
      const field = match[1];
      
      // If the field is "name"
      if (field === 'name') {
        filter.name = { $regex: new RegExp(value, 'i') }; // Case-insensitive search
      }
      // If the field is "email"
      else if (field === 'email') {
        filter.email = { $regex: new RegExp(value,'i') }; // Case-insensitive search
      }
    }
  }

  // Find users based on the filter
  return User.find(filter);
}

/**
 * Get all users without pagination
 * @returns {Promise<Array>} - Array of user objects
 */
async function getAllUsers() {
  return User.find({});
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getUser(id) {
  return User.findById(id);
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createUser(name, email, password) {
  return User.create({
    name,
    email,
    password,
  });
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateUser(id, name, email) {
  return User.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
      },
    }
  );
}

/**
 * Delete a user
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deleteUser(id) {
  return User.deleteOne({ _id: id });
}

/**
 * Get user by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * Update user password
 * @param {string} id - User ID
 * @param {string} password - New hashed password
 * @returns {Promise}
 */
async function changePassword(id, password) {
  return User.updateOne({ _id: id }, { $set: { password } });
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  changePassword,
  getTotalUsers,
  getAllUsers,
  getUsersFiltered,
};
