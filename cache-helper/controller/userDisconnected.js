const cachedLastSeen = require("./lastSeen/cachedLastSeen");
const cachedSocket = require("./socket/cachedSocket");


const userConnected = async(req, res, next) => {

    const mobile = req.body.mobile;

    const deletedCache = await cachedSocket.deleteSocket(mobile);
    

    if(deletedCache && deletedCache.socketId && deletedCache.serverPort){
        await cachedLastSeen.setLastSeen(mobile);
        // console.log("USER DISCONNECTION SUCCESS");
        return res.status(200).json({
            success: true
        })
    }
    else{
        console.log("USER DISCONNECTION FAILURE")
        return res.status(500).json({
            success: false
        })
    }
}

module.exports = userConnected;