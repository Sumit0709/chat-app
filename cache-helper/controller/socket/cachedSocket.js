const NodeCache = require( "node-cache" );

const myCache = new NodeCache({
    stdTTL: 3600000,
    checkperiod: 120
});

const cachedSocket = {
    
    setSocket: async (mobile, socketId, serverPort) => {
        return myCache.set(mobile, {socketId: socketId, serverPort: serverPort})
    },

    getSocket: async (mobile) => {
        const socketData = myCache.get(mobile);
        if(socketData){
            return {
                success: true, 
                data: socketData
            }
        }else{
            return {
                success: false,
                data: null
            }
        }
    },

    deleteSocket: async (mobile) => {
        return myCache.del(mobile);
    }

}

module.exports = cachedSocket;