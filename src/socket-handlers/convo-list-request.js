module.exports = (db, v, socket) => async (jwt, userid) => {
  let valid = await v(jwt, userid)
  if (!valid) return socket.emit('error', 'LOGIN ERROR: jwt/uid is invalid')

  try {
    let convoList = await new Promise(function (s, f) {
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
      `,
        userid,
        function (err, rows) {
          if (err) f(err)
          s(rows)
        }
      )
    })

    const ret = await Promise.all(
      convoList.map(async (convo) => {
        const aliases = await Promise.all(
          convo.participants
            .split(',')
            .map((participant) => participant.trim())
            .map(async (userId) => {
              const query = await new Promise((s, f) => {
                db.all(
                  `
                     SELECT
                        alias
                     FROM
                        users
                     WHERE
                        userid = :userId
                  `,
                  userId,
                  (err, rows) => {
                    if (err) f(err)
                    s(rows)
                  }
                )
              })

              return query.reduce(
                (acc, row, index, arr) =>
                  index < arr.length - 1
                    ? acc + row.alias + ','
                    : acc + row.alias,
                ''
              )
            })
        )

        const unreadCount = await new Promise((s, f) => {
          db.all(
            `
            SELECT
              COUNT(messageid) cnt
            FROM
              messages
            WHERE
              messages.convoid = :convoid
              AND messages.readby NOT LIKE '%' || :userid || '%'
          `,
            convo.convoid,
            userid,
            (err, results) => {
              if (err) f(err)
              s(results)
            }
          )
        })

        return {
          convoid: convo.convoid,
          convoname: convo.convoname,
          participants: aliases.reduce(
            (acc, d, index, arr) =>
              index < arr.length - 1 ? acc + d + ', ' : acc + d,
            ''
          ),
          unreadCount: unreadCount[0].cnt,
        }
      })
    )

    socket.emit('convo-list-response', JSON.stringify(ret))
  } catch (err) {
    console.error(err)
  }
}

// module.exports = (db) => async function convoListRequest(sessionid, userid){
//     let isVerified = await verifySession(db)(sessionid,userid);
//     if(isVerified){
// let convoList = await new Promise(function (s, f) {
//   db.all(
//     `
//              SELECT
//                 convoid,
//                 convoname,
//                 participants,
//                 maxusers
//              FROM
//                 convos
//              WHERE
//                 participants LIKE '%' || :userid || '%'
//           `,
//     userid,
//     function (err, rows) {
//       if (err) f(err)
//       s(rows)
//     }
//   )
// }).catch(function (err) {
//   this.emit('convo-list-response', 'convo query error')
// })

//        this.emit('convo-list-response',JSON.stringify(convoList));
//     }
//  }
