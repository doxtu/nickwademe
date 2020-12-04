const admin = require('firebase-admin')

const serviceAccount = require('../adminsdk.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://platychat.firebaseio.com',
})

module.exports = admin
