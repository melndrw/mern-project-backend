const express = require('express');
const userController = require('../controllers/users-controller');
const router = express.Router();

router.get('/', userController.getAllUsers);

router.post('/signup', userController.register);

router.post('/login', userController.login);

module.exports = router;
