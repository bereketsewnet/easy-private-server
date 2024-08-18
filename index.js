const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const routes = require('./routes/user.route');
const PrivateChatModel = require('./models/firebaseModel/privateChat.model');
const app = express();
const admin = require('./firebase/firebase.config');
const { generateRoomId } = require('./controllers/repository.controller');
const chatRoutes = require('./routes/chat.route');


// middelware
app.use(express.json());
// Parse URL-encoded request bodies (form-data)
app.use(express.urlencoded({ extended: true }));



// main route
app.get('/', (req, res) => {
  res.send('it fine api');
});



// user related routes
app.use('/api/users', routes)


// assign port by the api hoster given or default 3000
const port = process.env.PORT || 3000;
// create server
var server = http.createServer(app);

// connect to socket io
var io = require("socket.io")(server);
io.on('connection', (socket) => {

  console.log('connected to socket', socket.id);

  socket.on('get-all-one-to-one-chat-given-user', async (data) => {
    const { sender, receiver, messageOrder } = data;
    console.log(messageOrder);


    const roomId = generateRoomId(sender, receiver);

    try {
      const db = admin.firestore();
      const messagesRef = db.collection('privateChat').doc(roomId).collection('messages').where('messageOrder', '>', messageOrder).orderBy('messageOrder', 'asc');
      // asc desc order by ascending and descending
      const snapshot = await messagesRef.get();

      if (!snapshot) {
        return socket.emit('errorReceiver', 'No messages found');
      }

      const messages = [];

      snapshot.forEach(doc => {
        const messageData = doc.data();


        const message = PrivateChatModel.fromJson({
          ...messageData,
          messageId: doc.id // the message ID is the document ID
        });
        messages.push(message.toJson());
      });


      socket.emit('get-all-one-to-one-chat-given-user-listener', messages);

    } catch (error) {
      console.log(3333333333333);
       return socket.emit('errorReceiver', error);
    }


  });

  socket.on('sendPrivateMessage', async (data) => {

    const { message, sender, receiver, isSeen, messageType, replayMessage } = data;

    if (!data) {
      return socket.emit('errorReceiver', 'message are required');
    }
    const roomId = generateRoomId(sender, receiver);
    try {
      // Generate a new document with a random ID
      const db = admin.firestore();
      // createing messageOrder
      const roomRef = db.collection('privateChat').doc(roomId);
      const roomDoc = await roomRef.get();

      // Check if the room document exists, if not, create it with messageOrder initialized to 0
      if (!roomDoc.exists) {
        await roomRef.set({ messageOrder: 0 });
      }

      // Fetch the updated room document
      const updatedRoomDoc = await roomRef.get();
      // Get the current message order and increment it

      const currentOrder = updatedRoomDoc.data()?.messageOrder || 0;
      const newOrder = currentOrder + 1;



      const newMessageRef = roomRef.collection('messages').doc();
      const messageId = newMessageRef.id;

      // Create an instance of PrivateChatModel
      const now = new Date();
      // const timeStamp = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true }).toString();


      const privateChatMessage = new PrivateChatModel({
        messageId,
        message: message,
        sender: sender,
        receiver: receiver,
        timeStamp: now.toString(),
        isSeen: isSeen,
        messageType: messageType || 'Text',
        messageOrder: newOrder,
        replayMessage: replayMessage || null
      });

      // Store the message in Firestore
      await newMessageRef.set(privateChatMessage.toJson());
      roomRef.set({ messageOrder: newOrder });
      socket.join(roomId);

      // Emit success event with the stored message data
      io.to(roomId).emit('sendPrivateMessageSuccess', privateChatMessage.toJson());
    } catch (error) {
      console.error('Error storing message:', error);
      socket.emit('sendPrivateMessageError', 'Unknown Error!');
    }

  });

  socket.on('unreadMessageId', async (data) => {
       console.log(data);
  });


  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

});


// connect to mongo db
mongoose.connect('mongodb+srv://bereket:65500639@cluster0.9aqdao0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('Database Connected!')
    // listen
    server.listen(port, '0.0.0.0', () => {
      console.log('server listen on port', port);
    });
  }).catch((error) => {

    console.log(error);

  });