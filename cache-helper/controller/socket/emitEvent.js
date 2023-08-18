const cachedSocket = require("./cachedSocket");
const fetch = require('node-fetch');


const emitEvent = async(req, res, next) => {

    const eventName = req.body.eventName;
    const data = req.body.data;
    const mobile = parseInt(req.body.mobile);


    const socket = await cachedSocket.getSocket(mobile);
    const socketData = socket.data

    if(!socket || !socket.success || !socketData || !socketData.socketId || !socketData.serverPort){
        return res.status(404).json({
            success: false,
            error: 'User not connected!'
        })
    }

    const socketId = socketData.socketId;
    const serverPort = socketData.serverPort;

    const requestedServerUrl = `http://localhost:${serverPort}/emit-event/incoming`;
    const requestBody = JSON.stringify({
        socketId: socketId,
        eventName: eventName,
        data: data
    })
    // send request to the concerned server port\
    try{
        fetch(requestedServerUrl, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: requestBody
        })
        .then(res => res.json())
        .then(response => {
            if(response.success){
                // emit reached dedicated server
                console.log("EMIT SUCCESSFULL");
                return res.status(200).json({
                    success:true
                })
            }
            else{
                console.log("EMIT FALSE :: ", response.error)
                return res.status(500).json({
                    success: false,
                    error: response.error
                })
            }
        })
        .catch(err => {
            console.log("CATCH IN FETCH :: ", err);
            return res.status(500).json({
                success: false,
                error: err.message
            })
        })
    }
    catch(err){
        console.log("lAST CATCH :: ", err)
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }
}

module.exports = emitEvent  