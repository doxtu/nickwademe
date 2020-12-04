const generateSessionKey = require('../platychat.utils').generateSessionKey

const randomColor = () =>
  '#' + String(Math.floor(Math.random() * 16777215).toString(16))

module.exports = (db, v, socket) =>
  async function loginRequest(jwt, userid) {
    let valid = await v(jwt, userid)
    if (!valid) return socket.emit('error', 'LOGIN ERROR: jwt/uid is invalid')
    //if user does not exist, create them
    let user = await new Promise((s, f) => {
      db.all(
        `
         SELECT * FROM users WHERE UPPER(userid)=UPPER(:userid)
       `,
        userid,
        (err, rows) => {
          if (err) f()
          s(rows)
        }
      )
    }).catch(console.error)

    uid = user ? user.reduce((acc, d) => d.userid, '') : null
    user = user ? user.reduce((acc, d) => d, null) : null

    let color = user ? user.color : randomColor()

    if (!uid) {
      await new Promise((s, f) => {
        db.all(
          `INSERT INTO users(userid, alias, color) VALUES (:userid, :alias, :color)`,
          userid,
          `Cute One${generateSessionKey()}`,
          color,
          (err) => {
            if (err) f()
            s()
          }
        )
      })
    }

    socket.emit('login-request-response', color)
  }

// module.exports = (db, v) =>
//   async function loginRequest(jwt, userid) {

//     let userpass = await new Promise(function (s, f) {
//       db.all(
//         `SELECT userid FROM users WHERE UPPER(userid) = UPPER(:userid) AND password = :password`,
//         userid,
//         password,
//         function (err, rows) {
//           if (err) f()
//           s(rows)
//         }
//       )
//     })

//     let user = userpass.reduce(function (acc, d) {
//       return d.userid
//     }, '')

//     if (user === '') {
//       this.emit('login-response', 'ERROR: USERNAME AND PASSWORD DOES NOT MATCH')
//     } else {
//       let newSessionKey = generateSessionKey()

//       await new Promise(function (s, f) {
//         db.all(
//           `DELETE FROM sessions WHERE UPPER(userid) = UPPER(:userid)`,
//           user,
//           function (err) {
//             if (err) f(err)
//             s()
//           }
//         )
//       }).catch(console.error)

//       await new Promise(function (s, f) {
//         db.all(
//           `INSERT INTO sessions(
//              sessionid,
//              userid
//           )VALUES(
//              :session,
//              :userid
//           )`,
//           newSessionKey,
//           user,
//           function (err) {
//             if (err) f(err)
//             s()
//           }
//         )
//       }).catch(console.error)

//       this.emit('login-response', newSessionKey, user)
//     }
//   }
