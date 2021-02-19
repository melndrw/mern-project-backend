require('dotenv').config();
const HttpError = require('../models/http-error');
const NodeGeocoder = require('node-geocoder');

const API_KEY = process.env.API_KEY;

const option = {
  provider: 'opencage',
  apiKey: API_KEY,
  formatter: null,
};

const geocoder = NodeGeocoder(option);

const getCoordsForAddress = async (address) => {
  const data = await geocoder.geocode(address);
  if (!data) {
    throw new HttpError(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${API_KEY}`,
      422
    );
  }
  return data[0];
};

module.exports = getCoordsForAddress;
