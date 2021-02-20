require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const placesRoutes = require('./routes/places-routes');
const userRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

const MONGODB_PASS = process.env.MONGODB_PASS;

const url = `mongodb+srv://userTest:${MONGODB_PASS}@cluster0.scnp1.mongodb.net/yourplace_test?retryWrites=true&w=majority`;

app.use(bodyParser.json());

app.use('/api/places', placesRoutes);
app.use('/api/user', userRoutes);

app.use(() => {
  const error = new HttpError('Could not find this route', 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An Uknown Error Occured' });
});

mongoose
  .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to the Database at port 5000');
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });
