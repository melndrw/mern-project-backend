require('dotenv').config();
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const getCoordsForAddress = require('../utils/location');
const mongoose = require('mongoose');
const Place = require('../models/place-schema');

const MONGODB_PASS = process.env.MONGODB_PASS;

const url = `mongodb+srv://userTest:${MONGODB_PASS}@cluster0.scnp1.mongodb.net/yourplace_test?retryWrites=true&w=majority`;

mongoose
  .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to database at port 5000');
  })
  .catch(() => {
    console.log('Connection Failed');
  });

const getAllPlaces = async (req, res, next) => {
  const places = await Place.find().exec();
  if (!places || places.length === 0) {
    return next(new HttpError('Could not find places on database', 404));
  }
  res.json(places);
};

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  const place = await Place.findById(placeId, (error, data) => {
    if (error) {
      return next(
        new HttpError('Could not find a place for a provided ID', 404)
      );
    }
    return data;
  });

  res.json(place);
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  const places = await Place.find(
    { creator: Number(userId) },
    (error, data) => {
      if (error) {
        return next(
          new HttpError('Could not find a place for a provided user ID', 404)
        );
      }
      return data;
    }
  );
  res.json(places);
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

  const createPlace = {
    title,
    description,
    location: {
      lat: coordinates.latitude,
      lng: coordinates.longitude,
    },
    address,
    creator,
  };

  const createdPlace = new Place(createPlace);

  const result = await createdPlace.save();

  res.status(201).json({ places: result, message: 'A place has been added!' });
};

const updatePlaceById = async (req, res, next) => {
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
  const placeUpdated = await Place.findByIdAndUpdate(
    placeId,
    {
      title: title,
      description: description,
    },
    (error, data) => {
      if (error) {
        return next(new HttpError('Failed to Update at Database'));
      }
      return data;
    }
  );
  res.status(201).json(placeUpdated);
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  await Place.findByIdAndDelete(placeId, (error) => {
    if (error) {
      return next(new HttpError('Could not find a place for that id', 404));
    }
  });
  res.status(201).json({
    message: `The ID Number: ${placeId} has been deleted successfully`,
  });
};

exports.getAllPlaces = getAllPlaces;
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.addPlace = addPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlace = deletePlace;
