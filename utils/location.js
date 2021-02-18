require('dotenv').config();
const axios = require('axios');
const HttpError = require('../models/http-error');

const API_KEY = process.env.API_KEY;

const getCoordsForAddress = async (address) => {
  const response = axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${API_KEY}`
  );

  const data = response.data;
  if (!data || data.status === 'ZERO_RESULTS') {
    throw new HttpError(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${API_KEY}`,
      422
    );
  }
  return data.results[0].geometry.location;
};

module.exports = getCoordsForAddress;
