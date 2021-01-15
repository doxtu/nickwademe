// const verifySession = require('./verify-session')
// const generateSessionKey = require('../platychat.utils').generateSessionKey

module.exports = (db, v, socket) => async (jwt, userid, convoid) => {
  let valid = await v(jwt, userid)
  //if (!valid) return socket.emit('error', 'LOGIN ERROR: jwt/uid is invalid')

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
          if (err) f()
          s(rows)
        }
      )
    })

    convo = convo.reduce(function (acc, d) {
      return d.convoid
    }, '')

    //if (convo.length <= 0)
      //socket.emit('convo-join-response', 'ERROR: CONVO DOES NOT EXIST')

    let messages = await new Promise(function (s, f) {
      db.all(
        `
         SELECT
            a.*
         FROM
            (
            SELECT
               messages.*,
               users.color,
               users.alias,
               tags.tagname
            FROM
               convos
               INNER JOIN messages ON messages.convoid = convos.convoid
               INNER JOIN users ON users.userid = messages.userid
               LEFT OUTER JOIN tags ON tags.messageid = messages.messageid
            WHERE
               convos.convoid = :convoid
            ORDER BY
               messages.messageid DESC
            LIMIT
               100
            ) a
         ORDER BY
            a.messageid ASC
           `,
        convoid,
        function (err, rows) {
          if (err) f(err)
          s(rows)
        }
      )
    })

    //Update all messages in convoid not read by user to be read by user
    await new Promise(async (s, f) => {
      for (let i = 0; i < messages.length; i++) {
        let readByUser = true
        if (!messages[i]) continue

        readByUser = String(messages[i].readby).split(',').includes(userid)

        if (!readByUser) {
          let newReadBy = messages[i].readby + ',' + userid
          try {
            await new Promise((s, f) => {
              db.all(
                `
                  UPDATE messages SET readby=:newReadBy WHERE messageid=:messageid
                 `,
                newReadBy,
                messages[i].messageid,
                (err) => {
                  if (err) f(err)
                  s()
                }
              )
            })
          } catch (error) {
            f(error)
          }
        }
      }

      s()
    })

    //socket.emit('convo-join-response', convoid, JSON.stringify(messages))
    socket.send(JSON.stringify({
      type: 'convo-join-response',
      payload: {
        convoid: convoid,
        messages:messages 
      }
    }))
    //socket.join(convoid)
  } catch (error) {}
}

