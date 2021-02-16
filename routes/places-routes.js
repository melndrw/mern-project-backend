const express = require('express');

const router = express.Router();

const DUMMY = [
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
    creator: 2,
  },
];

router.get('/:pid', (req, res) => {
  const placeId = req.params.pid;
  const place = DUMMY.find((item) => item.id == placeId);
  res.json({ place: place });
});

router.get('/user/:uid', (req, res) => {
  const userId = req.params.uid;
  const user = DUMMY.find((item) => item.creator == userId);
  res.json({ user: user });
});

module.exports = router;
