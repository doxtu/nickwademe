const verifySession = require('./verify-session')
const generateSessionKey = require('../platychat.utils').generateSessionKey

module.exports = (db, v, socket) => async (jwt, userid, searchText) => {
  let valid = await v(jwt, userid)
  //if (!valid) return socket.emit('error', 'LOGIN ERROR: jwt/uid is invalid')

  if (!searchText || searchText.length === 0)
    return //socket.emit('error', 'SEARCH ERROR: search text cant be empty')

  let messages = []

  try {
    messages = await new Promise(function (s, f) {
      db.all(
        `
         SELECT
            messages.rawtext,
            messages.timestamp,
            tags.tagname,
            users.alias
         FROM
            convos
            INNER JOIN messages ON messages.convoid = convos.convoid
            INNER JOIN users ON users.userid = messages.userid
            LEFT OUTER JOIN tags ON tags.messageid = messages.messageid
         WHERE
            UPPER(convos.participants) LIKE '%' || UPPER(:userid) || '%'
            AND (
               UPPER(messages.rawtext) LIKE '%' || UPPER(:search) || '%'
               OR UPPER(tags.tagname) LIKE '%' || UPPER(:search) || '%'
            )
         ORDER BY
            messages.messageid DESC
          `,
        userid,
        searchText,
        function (err, rows) {
          if (err) f(err)
          s(rows)
        }
      )
    })
  } catch (error) {}

  //socket.emit('convo-search-response', JSON.stringify(messages))
  socket.send(JSON.stringify({
    type: 'convo-search-response',
    payload: {
      messages: messages
    }
  }))
}
