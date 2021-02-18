const express = require('express');
const userValidators = require('../validators/users-validators');
const userController = require('../controllers/users-controller');
const router = express.Router();

router.get('/', userController.getAllUsers);

router.post(
  '/signup',
  userValidators.registerValidation,
  userController.register
);

router.post('/login', userValidators.loginValidation, userController.login);

module.exports = router;
