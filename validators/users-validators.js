const { check } = require('express-validator');

const registerValidation = [
  check('name').not().isEmpty().withMessage('Name is required'),
  check('email').isEmail().withMessage('Please input a valid email address'),
  check('email').not().isEmpty().withMessage('Email is required'),
  check('password')
    .isLength({ min: 8 })
    .withMessage('The length must be more than 8 characters'),
  check('password').not().isEmpty().withMessage('Password is required'),
];

const loginValidation = [
  check('email').isEmail().withMessage('Please input a valid email address'),
  check('email').not().isEmpty().withMessage('Email is required'),
  check('password')
    .isLength({ min: 8 })
    .withMessage('The length must be more than 8 characters'),
  check('password').not().isEmpty().withMessage('Password is required'),
];

exports.loginValidation = loginValidation;
exports.registerValidation = registerValidation;
