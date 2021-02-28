const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const fs = require('fs');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../utils/location');
const Place = require('../models/place-schema');
const User = require('../models/user-schema');

const getAllPlaces = async (req, res, next) => {
  const places = await Place.find().exec();
  if (!places || places.length === 0) {
    return next(new HttpError('Could not find places on database', 404));
  }
  res.json(places.map((item) => item.toObject({ getters: true })));
};

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(
      new HttpError(
        'There is an error on fetching the data, please try again',
        404
      )
    );
  }
  if (!place) {
    return next(new HttpError('Could not find a place for a provided ID', 404));
  }
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate('places');
  } catch (error) {
    return next(
      new HttpError(
        'There is an error on fetching the data, please try again',
        500
      )
    );
  }
  if (!userWithPlaces || userWithPlaces.length === 0) {
    return next(
      new HttpError('Could not find a place for a provided user ID', 404)
    );
  }
  res.json(
    userWithPlaces.places.map((item) => item.toObject({ getters: true }))
  );
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

  if (!coordinates) {
    return next(
      new HttpError('The address you entered is invalid. Please try again.')
    );
  }
  console.log(req.file.path);
  const createdPlace = new Place({
    title,
    description,
    location: {
      lat: coordinates.latitude,
      lng: coordinates.longitude,
    },
    address,
    creator,
    placeImage: req.file.path,
  });
  let user;

  try {
    user = await User.findById(creator);
  } catch (error) {
    return next(new HttpError('We could not find user for provided ID', 500));
  }
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await createdPlace.save({ session: session });
    user.places.push(createdPlace);
    await user.save({ session: session });
    await session.commitTransaction();
  } catch (err) {
    return next(
      new HttpError('Error on adding place on database. Please try again'),
      500
    );
  }

  res
    .status(201)
    .json({ places: createdPlace, message: 'A place has been added!' });
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
  let updatedPlace;
  try {
    updatedPlace = await Place.findByIdAndUpdate(
      placeId,
      {
        title: title,
        description: description,
      },
      { new: true }
    );
  } catch (error) {
    return next(new HttpError('Failed to Update at Database'), 500);
  }

  if (updatedPlace.creator.toString() !== req.userData.userId) {
    return next(new HttpError('You are not allowed to update this place'), 401);
  }

  res.status(201).json({
    place: updatedPlace.toObject({ getters: true }),
    message: 'Updated Successfully',
  });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (error) {
    return next(new HttpError('Something went wrong, please try again', 500));
  }
  if (!place) {
    return next(new HttpError('Could not find a place for that id', 404));
  }

  const imagePath = place.placeImage;

  if (place.creator.id.toString() !== req.userData.userId) {
    return next(new HttpError('You are not allowed to delete this place'), 401);
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await place.remove({ session: session });
    place.creator.places.pull(place);
    await place.creator.save({ session: session });
    await session.commitTransaction();
  } catch (error) {
    return next(new HttpError('Something went wrong, please try again', 500));
  }

  fs.unlink(imagePath, (err) => {
    console.log(err);
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
