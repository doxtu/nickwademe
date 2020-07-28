const verifySession = require('./verify-session');
const generateSessionKey = require('../platychat.utils').generateSessionKey;

module.exports = (db) => async function convoSearchRequest(sessionid, userid, searchText){
    let isVerified = await verifySession(db)(sessionid,userid);
    if(isVerified){
       //query messages
       let messages = await new Promise(function(s,f){
          db.all(`
             SELECT
                messages.rawtext,
                messages.timestamp,
                tags.tagname,
                users.alias
             FROM
                convos
                INNER JOIN messages ON messages.convoid = convos.convoid
                INNER JOIN users ON users.userid = messages.userid
                LEFT OUTER JOIN tags ON tags.messageid = messages.messageid
             WHERE
                UPPER(convos.participants) LIKE '%' || UPPER(:userid) || '%'
                AND (
                   UPPER(messages.rawtext) LIKE '%' || UPPER(:search) || '%'
                   OR UPPER(tags.tagname) LIKE '%' || UPPER(:search) || '%'
                )
             ORDER BY
                messages.messageid
          `,userid, searchText, function(err,rows){
             if(err) f(err);
             s(rows);
          });
       }).catch(console.error);
       
       this.emit('convo-search-response',JSON.stringify(messages));
    }
 }