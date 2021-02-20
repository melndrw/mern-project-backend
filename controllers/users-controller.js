const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
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
  const newUser = {
    name,
    email,
    password,
    image:
      'https://i1.wp.com/www.alphr.com/wp-content/uploads/2020/05/Zoom-How-to-Set-Profile-Picture.jpg?resize=1200%2C666&ssl=1',
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
  res.status(201).json({
    user: user.toObject({ getters: true }),
    message: 'You have regigistered successfully',
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
  if (!existinguisher || existinguisher.password !== password) {
    return next(
      new HttpError('You enter a wrong credentials. Please try again.')
    );
  }

  res.status(201).json({ message: 'Login Successfully' });
};

exports.getAllUsers = getAllUsers;
exports.register = register;
exports.login = login;
