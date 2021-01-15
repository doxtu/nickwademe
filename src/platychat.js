const convoCreateRequest = require('./socket-handlers/convo-create-request')
const convoJoinRequest = require('./socket-handlers/convo-join-request')
const convoListRequest = require('./socket-handlers/convo-list-request')
const convoGalleryRequest = require('./socket-handlers/convo-gallery-request')
const convoMessageRequest = require('./socket-handlers/convo-message-request')
const convoSearchRequest = require('./socket-handlers/convo-search-request')
const loginRequest = require('./socket-handlers/login-request')
const messageTagRequest = require('./socket-handlers/message-tag-request')
const userAliasRequest = require('./socket-handlers/user-alias-request')
const userColorRequest = require('./socket-handlers/user-color-request')
const suckCounterRequest = require('./socket-handlers/suck-counter-request')
const suckIncrementRequest = require('./socket-handlers/suck-increment-request')

const uploader = require('./uploader/uploader')

//module.exports = function (io, siofu) {
module.exports = (ws) => {
  const sqlite3 = require('sqlite3')
  const db = new sqlite3.Database('./data/platychat.db')
  const v = require('./platychat.utils').validateFirebaseToken

  //io.on('connection', function (socket) {
  ws.on('connection', (socket) =>{

    socket.on('message', async (message)=>{
      message = JSON.parse(message)
      const type = message.type
      const payload = message.payload

      switch(type){
        case 'login-request':{
          loginRequest(db,v,socket,message)(payload.jwt, payload.userid)
          break;
        }
        case 'user-alias-request':{
          userAliasRequest(db,v,socket)(payload.jwt, payload.userid, payload.alias) 
          break;
        }
        case 'user-color-request':{
          userColorRequest(db,v,socket)(payload.jwt, payload.userid, payload.color)
          break;
        }
        case 'convo-list-request':{
          convoListRequest(db,v,socket)(payload.jwt, payload.userid)
          break;
        }
        case 'convo-gallery-request':{
          convoGalleryRequest(db,v,socket)(payload.jwt, payload.userid)
          break
        }
        case 'convo-create-request':{
          convoCreateRequest(db, v, socket)(payload.jwt, payload.userid, payload.convoname)
          break
        }
        case 'convo-join-request':{
          convoJoinRequest(db, v, socket)(payload.jwt, payload.userid, payload.convoid)
          break;
        }
        case 'convo-message-request':{
          convoMessageRequest(db, ws, v, socket)(payload.jwt, payload.userid, payload.convoid, payload.rawtext)
          break;
        }
        case 'convo-search-request':{
          convoSearchRequest(db, v, socket)(payload.jwt, payload.userid, payload.searchText)
          break;
        }
        case 'suck-counter-request':{
          suckCounterRequest(db, v, socket)(payload.jwt, payload.userid)
          break;
        }
        case 'suck-increment-request':{
          suckIncrementRequest(db, v, socket)(payload.jwt, payload.userid, payload.valueToAdd)
          break;
        }
        default:
          return
      }
    })
       // socket.on('message-tag-request', messageTagRequest(db, ws, v))

  })
}
