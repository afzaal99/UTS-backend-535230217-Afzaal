const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const marketAppControllers = require('./marketApp-controller');
const marketAppValidator = require('./marketApp-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/marketApp', route);

  // Get list of users
  route.get(
    '/', 
    authenticationMiddleware,
    marketAppControllers.getUsers);

  // Create user
  route.post(
    '/',
    authenticationMiddleware,
    celebrate(marketAppValidator.createUser),
    marketAppControllers.createUser
  );

  // Delete user
  route.delete('/:id', authenticationMiddleware, marketAppControllers.deleteUser);

  // Add item to user's cart
  route.post(
    '/:id/cart', 
    authenticationMiddleware, 
    celebrate(marketAppValidator.addToCart),
    marketAppControllers.addToCart
  );

  // Update item quantity in user's cart
  route.put(
    '/:id/cart/', 
    authenticationMiddleware,
    celebrate(marketAppValidator.updateCart), 
    marketAppControllers.updateCart
  );

  // Remove item from user's cart
  route.delete(
    '/:id/cart', 
    authenticationMiddleware, 
    celebrate(marketAppValidator.removeFromCart),
    marketAppControllers.removeFromCart
  );

  // Get user's cart
  route.get(
    '/:id/cart', 
    authenticationMiddleware, 
    marketAppControllers.getCart
  );

  // Get list of items for sale
  route.get(
    '/items', 
    authenticationMiddleware, 
    marketAppControllers.getItemsForSale
  );
};
