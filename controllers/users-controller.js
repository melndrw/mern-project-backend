const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user-schema');

const getAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find().exec();
  } catch (error) {
    return next(
      new HttpError(
        'There is an error on fetching the data, please try again.'
      ),
      500
    );
  }

  if (!users || users.length === 0) {
    return next(new HttpError('No user has been found on datebase', 404));
  }
  res.json(users.map((user) => user.toObject({ getters: true })));
};

const register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const validator = errors.errors.map((error) => {
      return {
        field: error.param,
        message: error.msg,
      };
    });
    return res.status(422).json(validator);
  }
  const { name, email, password } = req.body;
  let duplicate;
  try {
    duplicate = await User.findOne({ email: email });
  } catch (error) {
    return next(new HttpError('Signing up Failed, Please try again.'), 500);
  }
  if (duplicate) {
    return next(
      new HttpError(
        'The Email provided is already taken, please use other email address.'
      )
    );
  }
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    return next(new HttpError('Hashing Password fails, please try again', 500));
  }

  const newUser = {
    name,
    email,
    password: hashedPassword,
    image: req.file.path,
    places: [],
  };

  const user = new User(newUser);
  try {
    await user.save();
  } catch (error) {
    return next(
      new HttpError('Error on Adding data to Database, Please try again.', 500)
    );
  }

  let token;
  try {
    token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.DB_JWT_PRIVATE_KEY,
      { expiresIn: '1h' }
    );
  } catch (error) {
    return next(new HttpError('JWT Error detected, please try again', 500));
  }

  res.status(201).json({
    user: { userId: user.id, email: user.email, token: token },
    message: 'You have registered successfully',
  });
};

const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const validator = errors.errors.map((error) => {
      return {
        field: error.param,
        message: error.msg,
      };
    });
    return res.status(422).json(validator);
  }
  const { email, password } = req.body;

  let existinguisher;
  try {
    existinguisher = await User.findOne({ email: email });
  } catch (error) {
    return next(new HttpError('Logging in failed, Please try again.'), 500);
  }
  if (!existinguisher) {
    return next(
      new HttpError('You enter a wrong credentials. Please try again.', 404)
    );
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existinguisher.password);
  } catch (error) {
    return next(
      new HttpError(
        'Could not logged in, please see your credentials and try again'
      )
    );
  }

  if (!isValidPassword) {
    return next(
      new HttpError('You enter a wrong credentials. Please try again.', 404)
    );
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existinguisher.id, email: existinguisher.email },
      process.env.DB_JWT_PRIVATE_KEY,
      { expiresIn: '1h' }
    );
  } catch (error) {
    return next(new HttpError('JWT error detected,please try again', 500));
  }

  res.status(201).json({
    user: { userId: existinguisher.id, email: existinguisher.id, token: token },
    message: 'Login Successfully',
  });
};

exports.getAllUsers = getAllUsers;
exports.register = register;
exports.login = login;
