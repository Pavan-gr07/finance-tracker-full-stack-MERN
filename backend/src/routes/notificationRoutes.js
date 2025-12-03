const express = require('express');
const router = express.Router();
const { list, markRead } = require('../controllers/notificationController');


router.get('/', list);
router.post('/mark-read', markRead);


module.exports = router;