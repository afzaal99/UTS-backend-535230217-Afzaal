const marketAppRepository = require('./marketApp-repository');
const { hashPassword } = require('../../../utils/password');
const { updateWith } = require('lodash');
const { query } = require('express');
const { quantity } = require('../../../models/item-schema');

/**
 * Get list of users
 * @param {string} search
 * @param {string} sort
 * @param {number} pageNumber
 * @param {number} pageSize
 * @returns {Array}
 */
async function getUsers(search, sort, pageNumber, pageSize) {
  let users = await marketAppRepository.getAllUsers();
  let totalUser;
  let totalPages;
  
  // Filter Search
  if (search) {
    users = await marketAppRepository.getUsersFiltered(search);
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
  const user = await marketAppRepository.getUser(id);

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
    await marketAppRepository.createUser(name, email, hashedPassword);
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
  const user = await marketAppRepository.getUser(id);

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
  const user = await marketAppRepository.getUserByEmail(email);

  if (user) {
    return true;
  }

  return false;
}

/**
 * Add item to user's cart
 * @param {string} id - User ID
 * @param {string} itemId - Item ID
 * @param {number} quantity - Quantity
 * @returns {Array} - Updated user cart
 */
async function addToCart(id, itemId, quantity) {
  try {
    const user = await marketAppRepository.getUser(id);
    if (!user) {
      return null;
    }
    
    // Initialize cart if it doesn't exist
    if (!user.cart) {
      user.cart = [];
    }

    // Check if item exists in the list of available items
    const items = await marketAppRepository.listItems();
    const itemToAdd = items.find(item => item.id === itemId);
    if (!itemToAdd) {
      return null;
    }
    
    // Add new item to cart
    user.cart.push({ item: itemToAdd, quantity });
    await marketAppRepository.addToCart(id, user.cart);
    return user.cart;
  } catch (error) {
    return null;
  }
}

/**
 * Update item quantity in user's cart
 * @param {string} id - User ID
 * @param {string} itemId - Item ID
 * @param {number} newQuantity - New quantity
 * @returns {Array} - Updated user cart
 */
async function updateCart(id, newQuantity) {
  try {
    const transaction = await marketAppRepository.getCartbyTransactionId(id)
    const newPrice = (transaction.price/transaction.quantity) * newQuantity
    await marketAppRepository.updateCart(id, newQuantity, newPrice);
    //return user.cart;
  } catch (error) {
    return null;
  }
  return true;
}

/**
 * Remove item from user's cart
 * @param {string} id - User ID
 * @param {string} itemId - Item ID
 * @returns {Array} - Updated user cart
 */
async function removeFromCart(id) {
  try {
    const user = await marketAppRepository.getCartbyTransactionId(id);
    if (!user) {
      return null;
    }

    await marketAppRepository.removeCart(id);
   
  } catch (error) {
    return null;
  }
  return true;
}

/**
 * Get user's cart
 * @param {string} id - User ID
 * @returns {Array} - User cart
 */
async function getCart(id) {
  try {
    id = id.toString()
    const cart = await marketAppRepository.getToCart(id);
    if (!cart) {
      return null;
    }
    data = cart.map(item => ({
      id: item.item_id,
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }))

    //return user;
    return data;
  } catch (error) {
    return null;
  }
}

/**
 * Get list of items for sale
 * @returns {Array} - Array of items for sale
 */
async function getItemsForSale() {
  try {
    const items = await marketAppRepository.listItems(); // Mengambil semua item dari database
    return items;
  } catch (error) {
    return null;
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  deleteUser,
  emailIsRegistered,
  addToCart,
  updateCart,
  removeFromCart,
  getCart,
  getItemsForSale,
};
