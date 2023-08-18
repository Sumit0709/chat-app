const getFriendList = require("../../helper/getFriendList");

const logError = require("../LOG/logError");

const path = require('path');
const currentFileName = path.basename(__filename);

const setFriendsList = async (socket) => {
    
    try{
        const friendListDoc = await getFriendList(socket.mobile)
        let friendList = new Map(); 
        let friendsArray = [];
        if(friendListDoc && friendListDoc.success){

            let n = friendListDoc.list.length;
            for(let i=0; i<n; i++){
                friendList.set(parseInt(friendListDoc.list[i].mobile), {chatId: friendListDoc.list[i].chatId, userId: friendListDoc.list[i].userId})
                friendsArray.push({mobile: parseInt(friendListDoc.list[i].mobile), name: friendListDoc.list[i].customName? friendListDoc.list[i].customName: friendListDoc.list[i].name})
            }
        }

        socket.friends = friendList
        // console.log(friendList);
        socket.friendsArray = friendsArray
    }catch(err){
        logError(currentFileName, err)
    }

}

module.exports = setFriendsList;