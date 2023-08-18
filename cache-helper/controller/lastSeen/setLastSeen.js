const cachedLastSeen = require("./cachedLastSeen");


const setLastSeen = async(req, res, next) => {

    try{

        const mobile = parseInt(req.body.mobile)
        
        const ls = await cachedLastSeen.setLastSeen(mobile);
        
        if(ls){
            return res.status(200).json({
                success: true
            })
        }
        else{
            throw new Error("last seen not saved")
        }
        
    }
    catch(err){
        // console.log(err);
        return res.status(500).json({
            success: false,
            error: err
        })
    }

}

module.exports = setLastSeen  