const express = require('express');
const userConnected = require('../controller/userConnected');
const userDisconnected = require('../controller/userDisconnected');
const router = express.Router();    

router.post('/user-connected', userConnected);
router.post('/user-disconnected', userDisconnected);

module.exports = router;