# chat-app
Introducing a text-based web chat application that facilitates seamless communication between two users, with real-time messaging and the ability to track each other's 'last seen' status. The application boasts an instant messaging service, ensuring users never miss a beat. Even when offline, they'll receive pending messages upon reconnection.

## Introduction
After an extensive development journey, I have finally completed my latest project. Introducing a text-based web chat application that facilitates seamless communication between two users, with real-time messaging and the ability to track each other's 'last seen' status. The application boasts an instant messaging service, ensuring users never miss a beat. Even when offline, they'll receive pending messages upon reconnection.

## Server Architecture
![chat-architecture](https://github.com/Sumit0709/chat-app/assets/91677852/97ad00b8-9d59-411a-b182-7c4261a19ed5)


## Flow Diagram
![chat-between-userA-userB](https://github.com/Sumit0709/chat-app/assets/91677852/575db50b-5803-4110-9c20-5db02362d674)


Major work has been done on project architecture, backend server and the hosting process. Here's a detailed study of the project:

## Database Study -

Assumptions I have made - 
```
Number of active user = 1 Million
Number of friends each user has = 20
Number of messages sent by each user each day = 100 messages
Each message length = 100 char
```
Since it is important to store chat between two user separated from other user’s chat, we will have to group them into a single document (In case of mongoDb)

Assuming the below structure of a message object, each message consumes storage of around 238 bytes.
```
So each user consumes 238*100 = 23800 bytes each day
Each Document in MongoDb has a limitation of 16 MB = 16777216 bytes
```

So number of days required to exhaust the storage space = 705 Days i.e. approx 2 Year

So in 2 years we will be out of space to store their messages and will have to use GridFS which is complex to implement and has performance overhead.

So a better solution is to use Cassandra DB to store each conversation in a separate partition.
A table in Cassandra can have billions of partitions, and each partition can easily store more than 1 million cells (messages).
So if we count for 100 messages per day, then it will take us 10,000 days to reach that limit, which is around 27 Years.
And since Cassandra is a distributed system, read and write are pretty fast in it and on top of that it is highly scalable.
So cassandra can be a pretty good choice to store messages in this case.
Below is the table structure of our tables.

### Private Chat Table Structure:
```
{
chat_id: UUID
sender: TEXT
receiver: TEXT
message_id: TEXT
message: TEXT
type: INT
preview: TEXT
sent_at: TIMESTAMP
received_at: TIMESTAMP
seen_at: TIMESTAMP
sequence: INT
PRIMARY KEY: (chat_id, message_id, sequence)
}
```

### Pending Messages/Notification Table Structure:
```
{
user_id: UUID
chat_id: UUID
sender: TEXT
receiver: TEXT
service_type: INT
message_id: TEXT
message: TEXT
type: INT
preview: TEXT
sent_at: TIMESTAMP
received_at: TIMESTAMP
seen_at: TIMESTAMP
sequence: INT
PRIMARY KEY: (user_id, chat_id, service_type, message_id, sequence)
}
```

## HOSTING -

The application is hosted on a Digital Ocean Ubuntu server, leveraging NGINX for its reverse proxy and load balancing capabilities. The setup includes four server instances running on different ports, alongside a dedicated caching server. Load balancing is strategically managed using the 'ip_hash' algorithm. Once a user connects to a specific server (e.g., Server N), subsequent connections will be directed to the same server as long as the user's IP address remains unchanged.


## FUTURE PLANS - 

1. Currently this application only facilitates sharing text based messages. But additional features of sharing images, videos and audio files can be easily implemented. The database Schema is designed while keeping this issue in mind. To facilitate sharing of, let’s say, an image file we will just have to set type=1 (default value is 0 which indicates text message, 1 indicates image file, 2 and 3 are for video and audio file respectively) and we can show the image preview by compressing the image and storing it in preview field. The actual file can be stored in an AWS S3 instance and its location (url) can be stored in the message field. Images can be easily accessed using Amazon’s CDN service - Amazon CloudFront.

2. We can add features like removing friends, blocking users, deleting messages (delete for everyone), adding message seen time.


