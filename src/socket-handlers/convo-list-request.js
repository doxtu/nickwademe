const verifySession = require('./verify-session');
const generateSessionKey = require('../platychat.utils').generateSessionKey;

module.exports = (db) => async function convoListRequest(sessionid, userid){
    let isVerified = await verifySession(db)(sessionid,userid);
    if(isVerified){
       let convoList = await new Promise(function(s,f){
          db.all(`
             SELECT
                convoid,
                convoname,
                participants,
                maxusers
             FROM
                convos
             WHERE
                participants LIKE '%' || :userid || '%'
          `,userid,function(err,rows){
             if(err) f(err);
             s(rows);
          });
       }).catch(function(err){this.emit('convo-list-response','convo query error')});
       
       this.emit('convo-list-response',JSON.stringify(convoList));
    }
 }