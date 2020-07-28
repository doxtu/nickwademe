const verifySession = require('./verify-session');
const generateSessionKey = require('../platychat.utils').generateSessionKey;

module.exports = (db) => async function convoJoinRequest(sessionid, userid, convoid){
    let isVerified = await verifySession(db)(sessionid,userid);
    if(isVerified){
       let convo = await new Promise(function(s,f){
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
                AND convoid = :convoid
          `,userid, convoid, function(err,rows){
             if(err) f();
             s(rows);
          })
       }).catch(console.error);
       
       convo = convo.reduce(function(acc,d){
          return d.convoid;
       },'');
       
       if(convo.length <= 0) this.emit('convo-join-response','ERROR: CONVO DOES NOT EXIST');
       
       let messages = await new Promise(function(s,f){
          db.all(`
             SELECT
                a.*
             FROM
                (
                SELECT
                   messages.*,
                   users.color,
                   users.alias,
                   tags.tagname
                FROM
                   convos
                   INNER JOIN messages ON messages.convoid = convos.convoid
                   INNER JOIN users ON users.userid = messages.userid
                   LEFT OUTER JOIN tags ON tags.messageid = messages.messageid
                WHERE
                   convos.convoid = :convoid
                ORDER BY
                   messages.messageid DESC
                LIMIT
                   100
                ) a
             ORDER BY
                a.messageid ASC
          `,convoid, function(err,rows){
             if(err) f(err);
             s(rows);
          })
       }).catch(console.error);
       
       this.emit('convo-join-response',convoid, JSON.stringify(messages));
       this.join(convoid);
    }
}