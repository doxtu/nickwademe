module.exports = (db, v, socket) => async (jwt, userid, alias) => {
  let valid = await v(jwt, userid)
  //if (!valid) return socket.emit('error', 'LOGIN ERROR: jwt/uid is invalid')

  if (!alias)
    return //socket.emit('error', 'ALIAS ERROR: Alias must have a valid value')

  try {
    await new Promise((s, f) => {
      db.all(
        `UPDATE users SET alias=:alias WHERE userid=:userid`,
        alias,
        userid,
        (err) => {
          if (err) f(err)
          s()
        }
      )
    })
  } catch (err) {
    //socket.emit('error', 'DATABASE ERROR: Database did not process query')
  }
}
