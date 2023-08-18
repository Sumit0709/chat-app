const path = require('path');
const envFileName = `.env.${process.env.NODE_ENV || "development"}`
require('dotenv').config({ path: envFileName })


const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require('cors')
const mongoose = require('mongoose')
const morgan = require('morgan')
const cookieParser = require("cookie-parser");


// socket routes
const chat = require('./controller/socket/chat')

//express routes
const auth = require('./routes/auth');
const user = require('./routes/user');
const externalApi = require('./routes/externalApi');

// cassandra DB
const cassandra = require('./cassandra')


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { 
    cors: {
        origin: ["http://localhost:3000", process.env.FRONTEND_SERVER_IP_INSECURE, process.env.FRONTEND_SERVER_IP_SECURE],
        credentials: true
      },
    cookie: true
 });

// cors
app.use(cors({
    origin: ['http://localhost:3000', process.env.FRONTEND_SERVER_IP_INSECURE, process.env.FRONTEND_SERVER_IP_SECURE],
    credentials: true
}))

// parse json body
app.use(express.json());

app.use(express.urlencoded({extended: false}))

// cookie parser
app.use(cookieParser());


// Set up logging middleware (Morgan)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }
  
  // Production environment (log to a file)
if (process.env.NODE_ENV === 'production') {
    const fs = require('fs');
    const path = require('path');
  
    const accessLogStream = fs.createWriteStream(
      path.join(__dirname, 'access.log'),
      { flags: 'a' }
    );
    app.use(morgan('combined', { stream: accessLogStream }));
  }



// socket event listener
chat(io);


// express routes
app.use('/auth', auth);
app.use('/user', user);
app.use('/', (req, res, next) => {
    req.socketIO = io;
    next()
}, externalApi)


const port = process.env.PORT || 8080
httpServer.listen(port, async (err) => {
    if(!err){
        // Connect to datastax astra DB
        try{
        await cassandra.connectClient();


        // connect to mongo DB\
        mongoose.connect(
            process.env.MONGO_URL,{
            useNewUrlParser: true, 
            useUnifiedTopology: true,
            // useCreateIndex: true
            }).then(()=>{
                console.log("DB CONNECTED");
            }).catch((err)=>{
                console.log(err)
                console.log("ERROR in connecting to the DATABASE");
            })
        console.log(`Server is listening to port ${port}`);
        }
        catch(err){
            console.log(err.message);
        }
        finally{

        }
    }
    else{
        console.log("ERROR IN STARTING SERVER. ERROR :: ", err.message)
    }
});