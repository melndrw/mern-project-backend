const { check } = require('express-validator');

const addPlaceValidator = [
  check('title').not().isEmpty().withMessage('Title is required'),
  check('description').not().isEmpty().withMessage('Description is required'),
  check('description')
    .isLength({ min: 8 })
    .withMessage('The length must be more than 8 characters'),

  check('address').not().isEmpty().withMessage('Address is required'),
];

const updatePlaceValidator = [
  check('title').not().isEmpty().withMessage('Title is required'),
  check('description').not().isEmpty().withMessage('Description is required'),
  check('description')
    .isLength({ min: 8 })
    .withMessage('The length must be more than 8 characters'),
];

exports.addPlaceValidator = addPlaceValidator;
exports.updatePlaceValidator = updatePlaceValidator;
