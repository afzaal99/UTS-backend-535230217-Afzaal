const usersRepository = require('./users-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');

/**
 * Get list of users
 * @param {string} search
 * @param {string} sort
 * @param {number} pageNumber
 * @param {number} pageSize
 * @returns {Array}
 */
async function getUsers(search, sort, pageNumber, pageSize) {
  let users = await usersRepository.getAllUsers();
  let totalUser;
  let totalPages;
  
  // Filter Search
  if (search) {
    users = await usersRepository.getUsersFiltered(search);
  }

  // Sort
  if (sort) {
    const [fieldName, sortOrder ] = sort.split(':');
    switch (fieldName) {
      case 'email':
        users.sort((a, b) => {
          if (sortOrder === 'desc') {
            return b.email.localeCompare(a.email);
          } else {
            return a.email.localeCompare(b.email);
          }
        });
        break;
      case 'name':
      default:
        users.sort((a, b) => {
          if (sortOrder === 'desc') {
            return b.name.localeCompare(a.name);
          } else {
            return a.name.localeCompare(b.name);
          }
        });
        break;
   }
  } else {
  // Jika tidak ada query sort, maka dianggap sort berdasarkan ascending
  users.sort((a, b) => a.email.localeCompare(b.email));
  }

  // Jika tidak ada pageSize atau pageNumber, tampilkan semua pengguna tanpa paging
  if (!pageSize || !pageNumber) {
    slicedUsers = users;
    totalUser = users.length;
    totalPages = 1; // Satu halaman karena semua data ditampilkan dalam satu halaman
  } else {
    totalUser = users.length;
    totalPages = Math.ceil(totalUser / pageSize);

    // Untuk menampilkan user sesuai permintaan page number dan page size
    const startIndex = (pageNumber - 1) * pageSize;
    // Menggunakan Math.min untuk mengambil index terkecil sebagai batas 
    const endIndex = Math.min(startIndex + pageSize, totalUser);

    slicedUsers = users.slice(startIndex, endIndex);
  }

  return {
    page_number: pageNumber,
    page_size: pageSize,
    count: users.length,
    total_pages: totalPages,
    has_previous_page: pageNumber > 1,
    has_next_page: pageNumber < totalPages,
    data: slicedUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }))
  };
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createUser(name, email, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const user = await usersRepository.getUserByEmail(email);

  if (user) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(userId, password) {
  const user = await usersRepository.getUser(userId);
  return passwordMatched(password, user.password);
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(userId, password) {
  const user = await usersRepository.getUser(userId);

  // Check if user not found
  if (!user) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await usersRepository.changePassword(
    userId,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  emailIsRegistered,
  checkPassword,
  changePassword,
};
