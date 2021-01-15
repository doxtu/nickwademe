module.exports = (db, v, socket) => async (jwt, userid) => {
  let valid = await v(jwt, userid)
  //if (!valid) return socket.emit('error', 'LOGIN ERROR: jwt/uid is invalid')

  let imageUrls = []

  try {
    imageUrls = await new Promise((s, f) => {
      db.all(
        `
      SELECT
        rawtext
      FROM
        messages m
      WHERE
        m.rawtext LIKE 'images/platychat%'
        AND SUBSTR(m.messageid,1,4) || '-' 
        || CAST(SUBSTR(m.messageid,5,2) + 1 as TEXT) || '-' 
        || SUBSTR(m.messageid,7,2) >= DATE('now', '-30 days')
      ORDER BY
        m.messageid DESC
      `,
        (err, results) => {
          if (err) f(err)
          s(results)
        }
      )
    })
  } catch (error) {}

  //socket.emit('convo-gallery-response', JSON.stringify(imageUrls))
  socket.send(JSON.stringify({
      type: 'convo-gallery-response',
      payload: {
        imageUrls: imageUrls 
      }
    }))

}
