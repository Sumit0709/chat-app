const cachedLastSeen = require("./lastSeen/cachedLastSeen");
const cachedSocket = require("./socket/cachedSocket");


const userConnected = async(req, res, next) => {

    const mobile = req.body.mobile;
    const socketId = req.body.socketId;
    const serverPort = req.body.serverPort;

    const cachedData = await cachedSocket.setSocket(mobile, socketId, serverPort);
    

    if(cachedData){
        await cachedLastSeen.setLastSeen(mobile);
        // console.log("USER CONNECTION SUCCESS");
        return res.status(200).json({
            success: true
        })
    }
    else{
        console.log("USER CONNECTION FAILURE")
        return res.status(500).json({
            success: false
        })
    }
}

module.exports = userConnected;