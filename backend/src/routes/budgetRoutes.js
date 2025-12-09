const express = require('express');
const router = express.Router();
const { create, list, update, deleteBudget } = require('../controllers/budgetController');
const auth = require("../middleware/auth");


router.post('/', auth, create);
router.get('/', auth, list);
router.patch('/id', auth, update);
router.delete('/id', auth, deleteBudget);


module.exports = router;