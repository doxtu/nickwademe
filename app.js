const express = require('express')
const siofu = require('socketio-file-upload')
const fs = require('fs')
const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'))
const app = express()
const http = require('http').createServer(app)
const https = require('https').createServer(
  {
    key:
      config.env === 'PROD'
        ? fs.readFileSync('/etc/letsencrypt/live/doxtu.me/privkey.pem')
        : fs.readFileSync('server.key'),
    cert:
      config.env === 'PROD'
        ? fs.readFileSync('/etc/letsencrypt/live/doxtu.me/fullchain.pem')
        : fs.readFileSync('server.cert'),
  },
  app
)
const path = require('path')
const io = require('socket.io')(https, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
const port = 80
const httpsPort = 443
const platychat = require('./src/platychat.js')

platychat(io, siofu)

app.all('*', function (req, res, next) {
  if (req.protocol === 'https') return next()
  res.redirect('https://' + req.hostname + req.url)
})
app.use(siofu.router)
app.use(
  ['/platychat/convos', '/platychat/messages/*', '/platychat/login'],
  (req, res, next) => {
    res.redirect(`https://${req.hostname}/platychat`)
    next()
  }
)
app.use(express.static('public'))
app.use(express.static('public/platychat'))

http.listen(port)
https.listen(httpsPort)
