const express = require('express');
const getLastSeen = require('../controller/lastSeen/getLastSeen');
const setLastSeen = require('../controller/lastSeen/setLastSeen');
const router = express.Router();    


router.post('/get-last-seen', getLastSeen);
router.post('/set-last-seen', setLastSeen);


module.exports = router;