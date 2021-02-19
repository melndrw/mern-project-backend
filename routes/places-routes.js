const express = require('express');
const placeController = require('../controllers/places-controller');
const placeValidators = require('../validators/places-validators');

const router = express.Router();

router.get('/', placeController.getAllPlaces);

router.get('/:pid', placeController.getPlaceById);

router.get('/user/:uid', placeController.getPlacesByUserId);

router.post('/', placeValidators.addPlaceValidator, placeController.addPlace);

router.patch(
  '/:pid',
  placeValidators.updatePlaceValidator,
  placeController.updatePlaceById
);

router.delete('/:pid', placeController.deletePlace);

module.exports = router;
