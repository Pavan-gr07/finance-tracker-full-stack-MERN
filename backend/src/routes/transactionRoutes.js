const express = require('express');
const router = express.Router();
const { create, list, getFilters } = require('../controllers/transactionController');
const auth = require("../middleware/auth");


router.post('/', auth, create);
router.get('/', auth, list);
router.get('/filter', auth, getFilters);


module.exports = router;