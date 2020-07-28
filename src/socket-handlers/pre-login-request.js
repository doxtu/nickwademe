const verifySession = require('./verify-session');
const generateSessionKey = require('../platychat.utils').generateSessionKey;

module.exports = (db) => async function preLoginRequest(sessionid, userid){
    let isVerified = await verifySession(db)(sessionid, userid);
    if(isVerified) 
       this.emit('pre-login-response',sessionid);
    else
       this.emit('pre-login-response','ERROR: SESSION AND USER DO NOT EXIST');
 }