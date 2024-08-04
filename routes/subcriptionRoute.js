const express = require('express');
const router = express.Router();
const { newsletterSubscribe } = require('../controllers/subscriptionController');

router.post('/subscribe', newsletterSubscribe);

module.exports = router;
