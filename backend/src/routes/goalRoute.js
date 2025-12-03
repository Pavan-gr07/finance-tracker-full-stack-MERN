const express = require('express');
const router = express.Router();
const { createGoal,
    getGoal, getSingleGoal,
    updateSingleGoal,
    deleteSingleGoal,
    addprogressToGoal,
    goalSummary
} = require('../controllers/goalController');
const auth = require('../middleware/auth');


router.post('/', auth, createGoal);
router.get('/', auth, getGoal);
router.get('/:id', auth, getSingleGoal);
router.patch('/:id', auth, updateSingleGoal);
router.delete('/:id', auth, deleteSingleGoal);
router.patch('/:id/add-progress', auth, addprogressToGoal);
router.patch("/summary", auth, goalSummary);