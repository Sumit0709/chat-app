const path = require('path');
const envFileName = `.env.${process.env.NODE_ENV || "development"}`
require('dotenv').config({ path: envFileName })

const express = require("express");


const cors = require('cors')
const mongoose = require('mongoose')
const morgan = require('morgan')

const lastSeenRoute = require('./routes/lastSeen')
const socketRoute = require('./routes/socket')
const userRoute = require('./routes/user')

const app = express();


// cors
app.use(cors({
    origin: ['http://localhost:3000', process.env.FRONTEND_SERVER_IP_INSECURE, process.env.FRONTEND_SERVER_IP_SECURE],
    credentials: true
}))

// parse json body
app.use(express.json());

app.use(express.urlencoded({extended: false}))


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


app.use('/lastSeen', lastSeenRoute)
app.use('/socket', socketRoute)
app.use('/user', userRoute)


const port = process.env.PORT || 8079;

app.listen(port, (err) => {
    if(!err){
        // connect to mongo DB

        mongoose.connect(
            'mongodb://127.0.0.1:27017/app_name',{
            useNewUrlParser: true, 
            useUnifiedTopology: true,
            // useCreateIndex: true
            }).then(()=>{
                console.log("DB CONNECTED");
            }).catch((err)=>{
                console.log(err)
                console.log("ERROR in connecting to the DATABASE");
            })
    }
    else{
        console.log("ERROR IN CONNECTING TO MONGODB :: ", err);
    }
})