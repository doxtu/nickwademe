// const verifySession = require('./verify-session')
// const generateSessionKey = require('../platychat.utils').generateSessionKey

module.exports = (db, ws, v, socket) => async (
  jwt,
  userid,
  convoid,
  rawtext
) => {
  let valid = await v(jwt, userid)
  //if (!valid) return socket.emit('error', 'LOGIN ERROR: jwt/uid is invalid')

  if (rawtext.length === 0)
    return //socket.emit('error', 'MESSAGE ERROR: Message cannot be blank')

  try {
    let convo = await new Promise(function (s, f) {
      db.all(
        `
         SELECT
            convoid,
            convoname,
            participants
         FROM
            convos
         WHERE
            participants LIKE '%' || :userid || '%'
            AND convoid = :convoid
        `,
        userid,
        convoid,
        function (err, rows) {
          if (err) f(err)
          s(rows)
        }
      )
    })

    convo = convo.reduce(function (acc, d) {
      return d.convoid
    }, '')

    if (convo.length < 0)
      return //socket.emit('convo-message-response', 'ERROR: CONVO DOES NOT EXIST')

    const today = new Date(Date.now())
    const todayString =
      String(today.getFullYear()).padStart(4, '0') +
      String(today.getMonth()).padStart(2, '0') +
      String(today.getDate()).padStart(2, '0') +
      String(today.getHours()).padStart(2, '0') +
      String(today.getMinutes()).padStart(2, '0') +
      String(today.getSeconds()).padStart(2, '0') +
      String(today.getMilliseconds()).padStart(2, '0')

    const timestamp =
      String(today.getMonth() + 1).padStart(2, '0') +
      '/' +
      String(today.getDate()).padStart(2, '0') +
      '/' +
      String(today.getFullYear()).padStart(4, '0') +
      ' ' +
      String(today.getHours()).padStart(2, '0') +
      ':' +
      String(today.getMinutes()).padStart(2, '0') +
      ':' +
      String(today.getSeconds()).padStart(2, '0')

    //handle command
    if (rawtext[0] === '/') {
      let tokens = rawtext.split(' ')
      let command = tokens[0].slice(1, tokens[0].length)
      let args = tokens.slice(1, tokens.length)
      switch (command) {
        case 'image':
          rawtext = '!!upload ' + args
          break
        default:
      }
    }

    await new Promise(function (s, f) {
      db.all(
        `
         INSERT INTO messages(
            messageid,
            convoid,
            userid,
            readby,
            timestamp,
            rawtext
         ) VALUES (
            :messageid,
            :convoid,
            :userid,
            :readby,
            :timestamp,
            :rawtext
         )
            `,
        todayString,
        convoid,
        userid,
        userid,
        timestamp,
        rawtext,
        function (err) {
          if (err) f(err)
          s()
        }
      )
    })

    let userinfo = await new Promise(function (s, f) {
      db.all(
        `
         SELECT 
            alias,
            color
         FROM
            users
         WHERE
            userid = :userid
            `,
        userid,
        function (err, rows) {
          if (err) f(err)
          s(rows)
        }
      )
    })

    let alias = userinfo.reduce(function (acc, d) {
      return d.alias
    }, '')

    let color = userinfo.reduce(function (acc, d) {
      return d.color
    }, '')

    //socket.emit('convo-message-response', convoid)
    socket.send(JSON.stringify({
      type: 'convo-message-response',
      payload: {
        convoid: convoid
      }
    }))

    //TODO: send messages to all connected clients
    ws.clients.forEach( (client) => {
      if(client.readyState === require('ws').OPEN){
        client.send(JSON.stringify({
          type:'convo-message-incoming',
          payload:{
            convoid: convoid,
            todayString: todayString,
            alias: alias,
            color: color,
            timestamp: timestamp,
            rawtext: rawtext
          }
        }))
      }
    })
    

    //io.to(convoid).emit(
    //  'convo-message-incoming',
    //  convoid,
    //  todayString,
    //  alias,
    //  color,
    //  timestamp,
    //  rawtext
    //)
  } catch (error) {}
}
