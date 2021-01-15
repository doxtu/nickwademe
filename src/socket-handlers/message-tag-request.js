const verifySession = require('./verify-session');
const generateSessionKey = require('../platychat.utils').generateSessionKey;
//TODO - Convert this and use it
module.exports = (db, io) => async function messageTagRequest(sessionid, userid, messageid, tagname){
    let isVerified = await verifySession(db)(sessionid,userid);
    if(isVerified){
       let messages = await new Promise(function(s,f){
          db.all(`
             SELECT
                messages.*,
                users.color,
                users.alias,
                tags.tagname
             FROM
                messages
                INNER JOIN users ON users.userid = messages.userid
                LEFT OUTER JOIN tags ON tags.messageid = messages.messageid
             WHERE
                messages.messageid = :messageid
             ORDER BY
                messages.messageid
          `,messageid, function(err,rows){
             if(err) f(err);
             s(rows);
          })
       }).catch(console.error);
       
       
       let message = messages.reduce(function(acc,d){
          return d.messageid;
       },'');
       
       let tag = messages.reduce(function(acc,d){
          return d.tagname;
       },'');
       
       let alias = messages.reduce(function(acc,d){
          return d.alias;
       },''); 
       
       let color = messages.reduce(function(acc,d){
          return d.color;
       },''); 
       
       let rawtext = messages.reduce(function(acc,d){
          return d.rawtext;
       },''); 
       
       if(tag !== null){
          await new Promise(function(s,f){
             db.all(`
                UPDATE tags SET tagname = :tagname WHERE messageid = :messageid
             `,tagname, messageid, function(err,rows){
                if(err) f(err);
                s(rows);
             })
          });
       }else{
          await new Promise(function(s,f){
             db.all(`
                INSERT INTO tags (
                   tagid,
                   messageid,
                   userid,
                   tagname
                ) VALUES(
                   :tagid,
                   :messageid,
                   :userid,
                   :tagname
                )
             `,generateSessionKey(),messageid, userid, tagname, function(err,rows){
                if(err) f(err);
                s(rows);
             })
          });
       }
       
       //TODO: change tagid generation 
       
       let convoid = await new Promise(function(s,f){
          db.all(`
             SELECT
                convos.convoid
             FROM
                convos
                INNER JOIN messages ON messages.convoid = convos.convoid
             WHERE
                messageid = :messageid
             
          `,messageid,function(err,rows){
             if(err) f(err);
             s(rows);
          });
       });
       
       convoid = convoid.reduce(function(acc,d){
          return d.convoid;
       },'');
       
       if(message.length < 0) this.emit('message-tag-response','ERROR: NO SUCH MESSAGE EXISTS');
       
       io.to(convoid).emit('message-tag-response', messageid, tagname, alias, color, rawtext);
    }
 }
