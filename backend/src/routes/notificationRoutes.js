const express = require('express');
const router = express.Router();
const { list, markRead } = require('../controllers/notificationController');
const auth = require("../middleware/auth");


router.get('/', auth, list);
router.post('/mark-read', auth, markRead);


module.exports = router;