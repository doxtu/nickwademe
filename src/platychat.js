const convoCreateRequest = require('./socket-handlers/convo-create-request')
const convoJoinRequest = require('./socket-handlers/convo-join-request')
const convoListRequest = require('./socket-handlers/convo-list-request')
const convoMessageRequest = require('./socket-handlers/convo-message-request')
const convoSearchRequest = require('./socket-handlers/convo-search-request')
const loginRequest = require('./socket-handlers/login-request')
const messageTagRequest = require('./socket-handlers/message-tag-request')
const userAliasRequest = require('./socket-handlers/user-alias-request')
const userColorRequest = require('./socket-handlers/user-color-request')

const uploader = require('./uploader/uploader')

module.exports = function (io, siofu) {
  const sqlite3 = require('sqlite3')
  const db = new sqlite3.Database('./data/platychat.db')
  const v = require('./platychat.utils').validateFirebaseToken

  io.on('connection', function (socket) {
    console.log('hi omg connection!!!!')

    socket.on('login-request', loginRequest(db, v, socket))
    socket.on('user-alias-request', userAliasRequest(db, v, socket))
    socket.on('user-color-request', userColorRequest(db, v, socket))
    socket.on('convo-list-request', convoListRequest(db, v, socket))
    socket.on('convo-create-request', convoCreateRequest(db, v, socket))
    socket.on('convo-join-request', convoJoinRequest(db, v, socket))
    socket.on('convo-message-request', convoMessageRequest(db, io, v, socket))
    socket.on('convo-search-request', convoSearchRequest(db, v, socket))
    socket.on('message-tag-request', messageTagRequest(db, io, v))

    uploader(siofu, socket, db)
  })
}
