const verifySession = require('./verify-session');
const generateSessionKey = require('../platychat.utils').generateSessionKey;

module.exports = (db, io) => async function convoMessageRequest(sessionid, userid, convoid, rawtext){
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
             if(err) f(err);
             s(rows);
          })
       }).catch(console.error);
       
       convo = convo.reduce(function(acc,d){
          return d.convoid;
       },'');
       
       if(convo.length < 0) this.emit('convo-message-response','ERROR: CONVO DOES NOT EXIST');
       
       const today = new Date(Date.now());
       const todayString = String(today.getFullYear()).padStart(4,'0')
          + String(today.getMonth()).padStart(2,'0')
          + String(today.getDate()).padStart(2,'0')
          + String(today.getHours()).padStart(2,'0')
          + String(today.getMinutes()).padStart(2,'0')
          + String(today.getSeconds()).padStart(2,'0')
          + String(today.getMilliseconds()).padStart(2,'0');
       
       const timestamp = String(today.getMonth() + 1).padStart(2,'0') + '/'
          + String(today.getDate()).padStart(2,'0') + '/'
          + String(today.getFullYear()).padStart(4,'0') + ' '
          + String(today.getHours()).padStart(2,'0') + ':'
          + String(today.getMinutes()).padStart(2,'0') + ':'
          + String(today.getSeconds()).padStart(2,'0')
       
       //handle command
       if(rawtext[0] === '/'){
          let tokens = rawtext.split(' ');
          let command = tokens[0].slice(1,tokens[0].length);
          let args = tokens.slice(1,tokens.length);
          switch(command){
             case 'image':
                rawtext = '!!upload ' + args;
                break;
             default:
          }
       }
       
       //wrap http URLs with <a> element
       let hasHttpLink = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(rawtext);
       
       if(hasHttpLink){
          let link = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.exec(rawtext)[0];
          
          rawtext = rawtext.replace(link,`<a href=${link} target='_blank'>${link}</a>`);
       }
       
       await new Promise(function(s,f){
          db.all(`
             INSERT INTO messages(
                messageid,
                convoid,
                userid,
                timestamp,
                rawtext
             ) VALUES (
                :messageid,
                :convoid,
                :userid,
                :timestamp,
                :rawtext
             )
          `,todayString,convoid,userid,timestamp,rawtext,function(err){
             if(err) f(err);
             s();
          })
       }).catch(console.error);
       
       let userinfo = await new Promise(function(s,f){
          db.all(`
             SELECT 
                alias,
                color
             FROM
                users
             WHERE
                userid = :userid
          `,userid,function(err,rows){
             if(err) f(err);
             s(rows);
          })
       }).catch(console.error);
       
       let alias = userinfo.reduce(function(acc,d){
          return d.alias;
       },'');
       
       let color = userinfo.reduce(function(acc,d){
          return d.color;
       },'');
       
       this.emit('convo-message-response',convoid);
       io.to(convoid).emit('convo-message-incoming',convoid,todayString,alias,color,timestamp, rawtext);
    }
 }