const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');

const { v4: uuidv4 } = require('uuid');

const DUMMY_USERS = [
  {
    id: 1,
    name: 'Jose P. Rizal',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/b/b0/Jose_rizal_01.jpg',
    places: 2,
  },
  {
    id: 2,
    name: 'Andres Bonifacio',
    image:
      'https://2.bp.blogspot.com/-vTyuZE_o_nU/W4wGvt6In3I/AAAAAAAAECw/UYptjux-r1gkst50tbfw8eY07mg6N7_xQCLcBGAs/s1600/Andres%2BBonifacio.JPG',
    places: 1,
  },
];

const getAllUsers = (req, res, next) => {
  if (!DUMMY_USERS || DUMMY_USERS.length === 0) {
    return next(new HttpError('No user has been found on datebase', 404));
  }
  res.json({
    users: DUMMY_USERS,
  });
};

const register = (req, res, next) => {
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
  const newUser = {
    id: uuidv4(),
    name,
    email,
    password,
  };

  const duplicate = DUMMY_USERS.find((user) => user.email === email);
  if (duplicate) {
    return next(new HttpError('The Email provided was already taken', 422));
  }

  DUMMY_USERS.push(newUser);
  res.status(201).json({ message: 'You are registered successfully' });
};

const login = (req, res, next) => {
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
  const getUser = DUMMY_USERS.find(
    (user) => user.email === email && user.password === password
  );
  if (!getUser) {
    return next(
      new HttpError(
        'Your credentials are incorrect. If you have not created an account, then please register',
        401
      )
    );
  }
  res.status(201).json({ message: 'Login Successfully' });
};

exports.getAllUsers = getAllUsers;
exports.register = register;
exports.login = login;
