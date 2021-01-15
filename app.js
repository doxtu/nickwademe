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
const io = require('socket.io')(https, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
const WebSocket = require('ws')
const ws = new WebSocket.Server({ noServer: true })
const port = 80
const httpsPort = 443
const platychat = require('./src/platychat.js')

//platychat(io, siofu)
platychat(ws)

app.all('*', function (req, res, next) {
  if (req.protocol === 'https') return next()
  res.redirect('https://' + req.hostname + req.url)
})

app.use(express.static('public'))
app.use(express.static('public/platychat'))

app.use(siofu.router)

app.use(
  ['/platychat/convos', '/platychat/messages/*', '/platychat/login'],
  (req, res, next) => {
    res.redirect(`https://${req.hostname}/platychat`)
    //next()
  }
)

http.listen(port)
const server = https.listen(httpsPort)

server.on('upgrade', (request, socket, head) =>{
  ws.handleUpgrade(request, socket, head, (socket) => {
    ws.emit('connection',socket, request);
  })
})
