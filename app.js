const express = require('express');
const siofu = require('socketio-file-upload');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json','utf-8'));
const app = express();
const http = require('http').createServer(app);
const https = require('https').createServer({
	key: config.env === 'PROD'? fs.readFileSync('/etc/letsencrypt/live/doxtu.me/privkey.pem') : fs.readFileSync('server.key'),
   cert: config.env === 'PROD' ? fs.readFileSync('/etc/letsencrypt/live/doxtu.me/fullchain.pem') : fs.readFileSync('server.cert')
}, app);
const path = require('path');
const io = require('socket.io')(https);
const port = 80;
const httpsPort = 443;
const platychat = require('./src/platychat.js');

platychat(io,siofu);

app.use(function(req, res, next){
   if(req.protocol==='http'){
      res.redirect('https://localhost' + req.url);
   }
   next();
});
app.use(siofu.router);
app.use(express.static('./public'));

http.listen(port);
https.listen(httpsPort);
