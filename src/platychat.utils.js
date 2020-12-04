const admin = require('./firebase.utils')

module.exports.generateSessionKey = function generateSessionKey() {
  let ret = ''

  for (let i = 0; i < 12; i++) ret += Math.round(Math.random() * 9).toString()

  return ret
}

module.exports.validateFirebaseToken = async (jwt, uid) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(jwt)
    if (decodedToken.uid === uid) return true
  } catch (err) {
    // console.error(err)
    return false
  }
}
