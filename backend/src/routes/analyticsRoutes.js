const express = require('express');
const router = express.Router();
const { analyticsController } = require('../controllers/analyticsController');
const auth = require('../middleware/auth');


router.post('/', auth, analyticsController);


module.exports = router;