const express = require('express');
const router = express.Router();
const { list, markRead, read, unreadCount } = require('../controllers/notificationController');
const auth = require("../middleware/auth");


router.get('/', auth, list);
router.post('/mark-read', auth, markRead);
router.post('/unread', auth, markRead);
router.post('/read', auth, read);
router.post('/unread/count', auth, unreadCount);



module.exports = router;