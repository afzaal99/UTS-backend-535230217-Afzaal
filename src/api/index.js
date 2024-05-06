const express = require('express');
const marketApp = require('./components/marketApp/marketApp-route');
const authentication = require('./components/authentication/authentication-route');
const users = require('./components/users/users-route');

module.exports = () => {
  const app = express.Router();

  authentication(app);
  users(app);
  marketApp(app);

  return app;
};
