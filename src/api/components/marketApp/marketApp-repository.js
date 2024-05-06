const { User } = require('../../../models');
const { Item } = require('../../../models');

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
 * Get user ID and cart
 * @param {string} id - User ID
 * @returns {Promise<object>} - Object containing user ID and cart
 */
async function getUserIdAndCart(id) {
  try {
    const user = await User.findById(id);
    if (!user) {
      return null;
    }
    return { id: user._id, cart: user.cart };
  } catch (error) {
    console.error('Error getting user ID and cart:', error);
    throw new Error('Failed to get user ID and cart');
  }
}


/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} quantity - Cart
 * @returns {Promise}
 */
async function updateCart(id, quantity, price) {
  return Item.updateOne(
    {
      _id: id,
    },
    {
      $set: {        
        quantity,
        price
      },
    }
  );
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} cart - Cart
 * @returns {Promise}
 */
async function addToCart(id, cart) {
  const { id: itemId, name, price } = cart[0].item;
  Item.create({
    user_id: id,
    item_id: itemId,
    name,
    quantity: cart[0].quantity,
    price : price * cart[0].quantity
  });
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} cart - Cart
 * @returns {Promise}
 */
async function getToCart(id) {
  return Item.find({user_id:id});
}

async function getCartbyTransactionId(id) {
  return Item.findById(id);
}

async function removeCart(id) {
  return Item.deleteOne({_id:id});
}

async function listItems() {
  try {
    const items = [
      { 
        id: '0001',
        name: 'Sneakers',
        price: 10.99,
        // Other attributes
      },
      { 
        id: '0002',
        name: 'Bag Pack',
        price: 20.99,
        // Other attributes
      },
      { 
        id: '0003',
        name: 'Shirt',
        price: 12.99,
        // Other attributes
      }
    ];

    // Insert items into the database
    //await Item.insertMany(items);

    // Return the list of items
    return items;
  } catch (error) {
    throw new Error('Failed to insert items');
  }
}


module.exports = {
  getUsers,
  getUser,
  createUser,
  deleteUser,
  getUserByEmail,
  getUserIdAndCart,
  updateCart,
  listItems,
  getTotalUsers,
  getAllUsers,
  addToCart,
  getToCart,
  getUsersFiltered,
  removeCart,
  getCartbyTransactionId,
};
