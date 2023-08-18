const express = require('express');
const emitEvent = require('../controller/socket/emitEvent');
const router = express.Router();    

router.post('/emit-event', emitEvent);

module.exports = router;