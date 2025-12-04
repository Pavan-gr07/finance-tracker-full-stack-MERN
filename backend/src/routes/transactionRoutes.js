const express = require('express');
const router = express.Router();
const { create, list, getFilters, updateTransaction, deleteTransaction } = require('../controllers/transactionController');
const auth = require("../middleware/auth");


router.post('/', auth, create);
router.get('/', auth, list);
router.get('/filter', auth, getFilters);
router.patch('/', auth, updateTransaction);
router.delete('/', auth, deleteTransaction);


module.exports = router;