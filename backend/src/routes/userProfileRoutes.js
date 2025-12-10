const express = require('express');
const router = express.Router();
const { logout, getProfile, updateProfile, changePassword, } = require('../controllers/userController');
const auth = require("../middleware/auth");
const upload = require('../middleware/multer');

router.post('/logout', auth, logout);
router.get('/', auth, getProfile);
router.put('/password-change', auth, changePassword);
router.put('/update', auth, upload.single('profilePicture'), updateProfile);



module.exports = router;