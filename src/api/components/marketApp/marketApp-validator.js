const joi = require('joi');
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = joi.extend(joiPasswordExtendCore);

module.exports = {
  createUser: {
    body: {
      name: joi.string().min(1).max(100).required().label('Name'),
      email: joi.string().email().required().label('Email'),
      password: joiPassword
        .string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .onlyLatinCharacters()
        .min(6)
        .max(32)
        .required()
        .label('Password'),
      password_confirm: joi.string().required().label('Password confirmation'),
    },
  },

  addToCart: {
    body: {
      itemId: joi.string().required().label('Item ID'),
      quantity: joi.number().integer().min(1).required().label('Quantity'),
    },
  },
  updateCart: {
    body: {
      newQuantity: joi.number().integer().min(1).required().label('New Quantity'),
    },
  },
  removeFromCart: {
    body: {
      itemId: joi.string().required().label('Item ID'),
    },
  },
};
