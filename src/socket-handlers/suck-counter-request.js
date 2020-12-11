module.exports = (db, v, socket) => async (jwt, userid) => {
  let valid = await v(jwt, userid)
  if (!valid) return socket.emit('error', 'LOGIN ERROR: jwt/uid is invalid')

  let counter = null

  try {
    counter = await new Promise((s, f) => {
      db.all(`SELECT count FROM suck`, (err, results) => {
        if (err) f(err)
        s(results)
      })
    })

    counter = counter[0].count
  } catch (e) {}

  socket.emit('suck-counter-response', counter)
}
