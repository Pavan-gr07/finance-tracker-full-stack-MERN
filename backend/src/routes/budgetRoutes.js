const express = require('express');
const router = express.Router();
const { create, list } = require('../controllers/budgetController');
const auth = require("../middleware/auth");


router.post('/', auth, create);
router.get('/', auth, list);


module.exports = router;