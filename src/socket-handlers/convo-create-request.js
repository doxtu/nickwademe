const verifySession = require('./verify-session');
const generateSessionKey = require('../platychat.utils').generateSessionKey;

module.exports = (db) => async function convoCreateRequest(sessionid, userid, convoname, participants, maxusers){
    let isVerified = await verifySession(db)(sessionid,userid);
    
    //the convoid should be edited
    if(isVerified){
       let convoid = generateSessionKey();
       await new Promise(function(s,f){
          db.all(`
             INSERT INTO convos(
                convoid,
                convoname,
                participants,
                maxusers
             ) VALUES (
                :convoid,
                :convoname,
                :participants,
                :maxusers
             )
          `, convoid, convoname, participants, maxusers,
          function(err){
             if(err) f();
             s();
          });
       });
       
       this.emit('convo-create-response', convoid);
    }
    
    this.emit('convo-create-response','ERROR: CANNOT CREATE NEW CONVO REQUEST');
 }