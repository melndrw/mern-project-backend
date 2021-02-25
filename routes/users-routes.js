const express = require('express');
const userValidators = require('../validators/users-validators');
const userController = require('../controllers/users-controller');
const router = express.Router();
const fileUpload = require('../middleware/fileUpload-middleware');

router.get('/', userController.getAllUsers);

router.post(
  '/signup',
  fileUpload.single('image'),
  userValidators.registerValidation,
  userController.register
);

router.post('/login', userValidators.loginValidation, userController.login);

module.exports = router;
