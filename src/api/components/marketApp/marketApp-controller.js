const marketAppService = require('./marketApp-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

/**
 * Handle get list of users request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUsers(request, response, next) {
  try {
    let search = request.query.search;
    let sort = request.query.sort;
    let pageNumber = request.query.pageNumber;
    let pageSize = request.query.pageSize; 

    const users = await marketAppService.getUsers(search, sort, pageNumber, pageSize);
    return response.status(200).json(users);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get user detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUser(request, response, next) {
  try {
    const user = await marketAppService.getUser(request.params.id);

    if (!user) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown user');
    }

    return response.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createUser(request, response, next) {
  try {
    const name = request.body.name;
    const email = request.body.email;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;

    // Check confirmation password
    if (password !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Email must be unique
    const emailIsRegistered = await marketAppService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await marketAppService.createUser(name, email, password);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create user'
      );
    }

    return response.status(200).json({ name, email });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteUser(request, response, next) {
  try {
    const id = request.params.id;

    const success = await marketAppService.deleteUser(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle add item to user's cart request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function addToCart(request, response, next) {
  try {
    const id = request.params.id;
    const itemId = request.body.itemId;
    const quantity = request.body.quantity;

    // Add item to user's cart
    const addUserCart = await marketAppService.addToCart(id, itemId, quantity);
    
    if (!addUserCart) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to add item to cart'
      );
    }

    return response.status(200).json({ cart: addUserCart });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update item quantity in user's cart request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateCart(request, response, next) {
  try {
    const id = request.params.id; // id transaksi
    const newQuantity = request.body.newQuantity;

    // Update item quantity in user's cart
    const addUserCart = await marketAppService.updateCart(id, newQuantity);
    // console.log(addUserCart)
    if (!addUserCart) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update item quantity in cart'
      );
    }

    return response.status(200).json('Cart has been updated!');
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle remove item from user's cart request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function removeFromCart(request, response, next) {
  try {
    const id = request.params.id; // transaction id

    // Remove item from user's cart
    const cart = await marketAppService.removeFromCart(id);
    
    if (!cart) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to remove item from cart'
      );
    }

    return response.status(200).json(`remove cart's complete`);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get user's cart request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getCart(request, response, next) {
  try {
    const id = request.params.id;

    // Get user's cart
    const cart = await marketAppService.getCart(id);
    
    if (!cart) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to get user cart'
      );
    }

    return response.status(200).json({ cart });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get list of items for sale request
 * @param {object} request - Express request object (dapat kosong)
 * @param {object} response - Express response object
 * @returns {object} Response object
 */
async function getItemsForSale(request, response) {
  try {
    // Get list of items for sale
    const items = await marketAppService.getItemsForSale();
    return response.status(200).json(items);
  } catch (error) {
    return response.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  deleteUser,
  addToCart,
  updateCart,
  removeFromCart,
  getCart,
  getItemsForSale,
};
