module.exports = (db, v, socket) => async (jwt, userid, color) => {
  let valid = await v(jwt, userid)
  if (!valid) return socket.emit('error', 'LOGIN ERROR: jwt/uid is invalid')

  if (!color)
    return socket.emit('error', 'COLOR ERROR: Color must not be blank')

  const hexColorRegexp = /#+([0-9a-f]{3}|[0-9a-f]{6})$/i

  if (!hexColorRegexp.test(color))
    return socket.emit('error', 'COLOR ERROR: Color must match html format')

  try {
    await new Promise((s, f) => {
      db.all(
        `UPDATE users SET color=:color WHERE userid=:userid`,
        color,
        userid,
        (err) => {
          if (err) f(err)
          s()
        }
      )
    })
  } catch (err) {
    socket.emit('error', 'DATABASE ERROR: Database did not process query')
  }
}
