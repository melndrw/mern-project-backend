const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  title: { type: String, require: true },
  description: { type: String, required: true },
  placeImage: { type: String, required: true },
  address: { type: String, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
});

module.exports = mongoose.model('Place', placeSchema);
