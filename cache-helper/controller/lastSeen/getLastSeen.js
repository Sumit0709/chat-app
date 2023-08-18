const cachedLastSeen = require("./cachedLastSeen");


const getLastSeen = async(req, res, next) => {

    try{
        const friends = req.body.friends
        const response = []
        for(let mobile of friends){
            const lastSeen = await new Promise((resolve, reject) => {
                cachedLastSeen.getLastSeen(mobile)
                    .then(res => {
                        if(res.success){
                            resolve(res.lastSeen);
                        }
                        else{
                            resolve(null);
                        }
                    })
                    .catch(err => {
                        reject(err)
                    })
                
            })
            // console.log(lastSeen);
            if(lastSeen){
                response.push({mobile, lastSeen})
            }
        }
        // console.log(response)
        // send the lastseen array

        return res.status(200).json({
            success: true,
            lastSeen: response
        })
        
    }
    catch(err){
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }

}

module.exports = getLastSeen  