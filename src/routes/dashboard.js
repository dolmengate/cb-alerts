
const express = require('express');
const router = express.Router();
const App = require('../app');

// main route
router.get('/', (req, res) => {
    res.render('dashboard');
});

module.exports = router;
