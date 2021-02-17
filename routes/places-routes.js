const express = require('express');
const placeController = require('../controllers/places-controller');

const router = express.Router();

router.get('/:pid', placeController.getPlaceById);

router.get('/user/:uid', placeController.getPlacesByUserId);

router.post('/', placeController.addPlace);

router.patch('/:pid', placeController.updatePlaceById);

router.delete('/:pid', placeController.deletePlace);

module.exports = router;
