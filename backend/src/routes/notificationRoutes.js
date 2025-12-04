const express = require('express');
const router = express.Router();
const { list, markRead, read, unreadCount } = require('../controllers/notificationController');
const auth = require("../middleware/auth");


router.get('/', auth, list);
router.get('/mark-read', auth, markRead);
router.get('/unread', auth, markRead);
router.get('/read', auth, read);
router.get('/unread/count', auth, unreadCount);



module.exports = router;