const convoCreateRequest = require('./socket-handlers/convo-create-request');
const convoJoinRequest = require('./socket-handlers/convo-join-request');
const convoListRequest = require('./socket-handlers/convo-list-request');
const convoMessageRequest = require('./socket-handlers/convo-message-request');
const convoSearchRequest = require('./socket-handlers/convo-search-request');
const loginRequest = require('./socket-handlers/login-request');
const messageTagRequest = require('./socket-handlers/message-tag-request');
const preLoginRequest = require('./socket-handlers/pre-login-request');

const uploader = require('./uploader/uploader');

module.exports = function(io,siofu){
   const sqlite3 = require('sqlite3');
   const db = new sqlite3.Database('./data/platychat.db');

   io.on('connection',function(socket){
      socket.on('pre-login-request',preLoginRequest(db).bind(socket));
      socket.on('login-request',loginRequest(db).bind(socket));
      socket.on('convo-list-request',convoListRequest(db));
      socket.on('convo-create-request',convoCreateRequest(db).bind(socket));
      socket.on('convo-join-request', convoJoinRequest(db));
      socket.on('convo-message-request', convoMessageRequest(db, io));
      socket.on('convo-search-request', convoSearchRequest(db).bind(socket));
      socket.on('message-tag-request', messageTagRequest(db, io));
      
      uploader(siofu, socket, db);
   });
}