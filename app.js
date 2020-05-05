const express = require('express');
const fs = require('fs');
const app = express();
const http = require('http').createServer(app);
const https = require('https').createServer({
   key: fs.readFileSync('/etc/letsencrypt/live/doxtu.me/privkey.pem'),
   cert: fs.readFileSync('/etc/letsencrypt/live/doxtu.me/fullchain.pem')
}, app);
const path = require('path');
const io = require('socket.io')(https);
const port = 80;
const httpsPort = 443;
const platychat = require('./src/platychat.js');

platychat(io);

app.use(express.static('./public'));

http.listen(port);
https.listen(httpsPort);
