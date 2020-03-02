const express = require('express');
const app = express();
const http = require('http').createServer(app);
const path = require('path');
const io = require('socket.io')(http);
const port = 8080;
const platychat = require('./src/platychat.js');

platychat(io);

app.use(express.static('./public'));

http.listen(port);