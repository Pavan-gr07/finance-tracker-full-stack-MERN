const express = require('express');
const router = express.Router();
const { list, markRead, unreadCount, createNotification } = require('../controllers/notificationController');
const auth = require("../middleware/auth");


router.get('/', auth, list);
router.put('/read', auth, markRead);
router.get('/unread', auth, unreadCount);
router.post('/', auth, createNotification);




module.exports = router;