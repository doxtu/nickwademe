module.exports = (db, v, socket) => async (jwt, userid, valueToAdd) => {
  let valid = await v(jwt, userid)
  //if (!valid) return socket.emit('error', 'LOGIN ERROR: jwt/uid is invalid')

  let counter = null

  try {
    await new Promise((s, f) => {
      db.all(
        `
        UPDATE suck SET count=(SELECT count FROM suck) + :valueToAdd
      `,
        valueToAdd,
        (err, results) => {
          if (err) f(err)
          s(results)
        }
      )
    })

    counter = await new Promise((s, f) => {
      db.all(`SELECT count FROM suck`, (err, results) => {
        if (err) f(err)
        s(results)
      })
    })

    counter = counter[0].count
  } catch (error) {}

  //socket.emit('suck-counter-response', counter)
  socket.send(JSON.stringify({
    type: 'suck-counter-response',
    payload: {
      count: counter
    }
  }))
}
