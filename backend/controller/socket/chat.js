const cookie = require('cookie')
const cassandra = require('../../cassandra');
const addNewMessage = require('../helper/addNewMessage');
const getFriendList = require('../helper/getFriendList');
const setFriendList = require('../helper/setFriendList');
const cachedLastSeen = require('./cachedLastSeen');
const cachedSocket = require('./cachedSocket');
const emitPending = require('./helper/emitPending');
const last50messages = require('./helper/getLast50messages');
const getLastSeenOfAllFriends = require('./helper/getLastSeenOfAllFriends');
const notifyPrivateMessageReceived = require('./helper/notifyPrivateMessageReceived');
const sendMessage = require('./helper/sendMessage');
const setFriendsList = require('./helper/setFriendsList');
const verifyTokenInSocket = require('./verifyTokenInSocket');
const { setLastSeen_Api } = require('../externalApi.js/lastSeen');
const { userConnected_Api } = require('../externalApi.js/userConnection');
const logError = require('./LOG/logError');

const emitFriendsList = (socket) => {
    socket.emit('friends_list', {friends: socket.friendsArray});
}

const path = require('path');
const currentFileName = path.basename(__filename);


const chat = (io) => {

    io.on("connection", async (socket) => {

        try{
        // Access cookies from socket.handshake.headers.cookie
        let cookies = socket.handshake.headers.cookie;
        let parsedCookies = "";
        
        if(cookies){
            cookies = cookies.toString();
            parsedCookies = cookie.parse(cookies);
        }
        else{
            cookies = "";
        }
        const loginStatus = await verifyTokenInSocket(parsedCookies);

        if(!loginStatus.success){
            socket.emit('logout_user')
            socket.disconnect()
            return;
        }
        else{
            socket.mobile = loginStatus.data.mobile;
            socket.userId = loginStatus.data.userId;
            socket.sessionId = loginStatus.data.sessionId;

        }
        
        // console.log("HANDSHAKE :: ", socket.handshake);
        // console.log(process.env.PORT);
        const serverPort = process.env.PORT || 8080;
        let saveSocketData = await userConnected_Api(socket.mobile, socket.id, serverPort)
        if(!saveSocketData){
            socket.disconnect();
            return;
        }
        const serverNumber = serverPort%10;
        socket.emit('connection_successfull', {mobile: socket.mobile, server: serverNumber});
            
        
        const sessionId = socket.sessionid;
        const userId = socket.userid;
        const mobile = socket.mobile;
        

        await setFriendsList(socket);
        // await getFriendListLocal(socket)
        
        cachedSocket.setSocket(mobile, socket.id);
        
        // Emit FriendsList to user when he connects to the socket
        emitFriendsList(socket);
        last50messages(socket);

        socket.on('get_last_seen', () => {
            getLastSeenOfAllFriends(socket);
        })

        socket.on('user_active', () => {
            setLastSeen_Api(socket.mobile)
        })

        socket.on('chat_history_fetching_complete', () => {
            emitPending(socket)
        })

        // this user is sending private message to some other user
        socket.on('private_message_from_sender', async (data) => {
            setLastSeen_Api(socket.mobile)
            sendMessage(io, socket, data);
        })

        // This user has received the private message from someone
        socket.on('notify_private_message_received_by_receiver', async (data) => {
            notifyPrivateMessageReceived(io, socket, data);
        })


        socket.on('disconnect', (reason) => {
            // console.log("Disconnected")
        })

        socket.on("error", (err) => {
        if (err){
            logError(currentFileName, err)
        }
        });
        
        }
        catch(err){
            logError(currentFileName, `ERROR IN ESTABLISHING CONNECTION TO USER/ NOT A SOCKET ERROR :: ${err}`)
        }
    });

}

module.exports = chat;
