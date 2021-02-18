const HttpError = require('../models/http-error');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const getCoordsForAddress = require('../utils/location');

let DUMMY = [
  {
    id: 1,
    title: 'Jose Rizal Monument',
    description: 'The National Hero of the Philippines',
    image:
      'https://media-cdn.tripadvisor.com/media/photo-m/1280/1a/dd/05/24/frontal-del-monumento.jpg',
    address: 'Rizal Monument, Burgos Street, Calamba, Laguna',
    coordinates: {
      lat: 14.2126296,
      lng: 121.1652271,
    },
    creator: 2,
  },
  {
    id: 2,
    title: 'Andres Bonifacio Monument',
    description: 'The Father of Philippine Revolutionary',
    image:
      'https://thumbs.dreamstime.com/b/manila-ph-oct-andres-bonifacio-shrine-october-philippines-shows-life-story-philippine-hero-his-childhood-to-181008649.jpg',
    address: 'Liwasang Bonifacio, Ermita, Maynila',
    coordinates: {
      lat: 14.5945523,
      lng: 120.979409,
    },
    creator: 1,
  },
];

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY.find((item) => item.id == placeId);

  if (!place) {
    throw new HttpError('Could not find a place for a provided place ID', 404);
  }
  res.json({ place: place });
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY.filter((item) => item.creator == userId);
  if (!places || places.length === 0) {
    return next(
      new HttpError('Could not find a place for a provided user ID', 404)
    );
  }
  res.json({ 'user-place': places });
};

const addPlace = async (req, res, next) => {
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
  const { title, description, address, creator } = req.body;
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = {
    id: uuidv4(),
    title,
    description,
    location: coordinates,
    address,
    creator,
  };
  DUMMY.push(createdPlace);
  res.status(201).json({ places: createdPlace });
};

const updatePlaceById = (req, res, next) => {
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

  const { title, description } = req.body;
  const placeId = req.params.pid;
  const updatedPlace = { ...DUMMY.find((item) => item.id == placeId) };
  const placeIndex = DUMMY.findIndex((index) => index.id == placeId);
  updatedPlace.title = title;
  updatedPlace.description = description;

  DUMMY[placeIndex] = updatedPlace;

  res.status(201).json({ places: updatedPlace });
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;
  if (!DUMMY.find((item) => item.id == placeId)) {
    throw new HttpError('Could not find a place for that id', 404);
  }
  DUMMY = DUMMY.filter((item) => item.id != placeId);

  if (DUMMY.length === 0) {
    return next(new HttpError('No Data found', 404));
  }
  res.status(201).json({
    places: DUMMY,
    message: `The ID Number: ${placeId} has been deleted successfully`,
  });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.addPlace = addPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlace = deletePlace;
