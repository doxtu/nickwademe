module.exports = function(io){
   const sqlite3 = require('sqlite3');
   const db = new sqlite3.Database('./data/platychat.db');
   
   function generateSessionKey(){
      let ret = '';
      
      for(let i = 0; i<12; i++)
         ret += Math.round(Math.random()*9).toString();
      
      return ret;
   }

   async function verifySession(sessionid,userid){
      let query = await new Promise(function(s,f){
         db.all(`SELECT sessionid,userid FROM sessions WHERE sessionid = :session AND userid = :userid`,sessionid, userid, function(err,rows){
            if(err) f();
            s(rows);
         });
      })
      
      let session = query.reduce(function(acc,d){
         return d.sessionid;
      },'');
      
      let user = query.reduce(function(acc,d){
         return d.userid;
      },'');
      
      if(String(sessionid) === String(session) && String(user) === String(userid))
         return true;
      else
         return false;
   }

   async function preLoginRequest(sessionid,userid){
      let isVerified = await verifySession(sessionid, userid);
      if(isVerified) 
         this.emit('pre-login-response',sessionid);
      else
         this.emit('pre-login-response','ERROR: SESSION AND USER DO NOT EXIST');
   }

   async function loginRequest(userid,password){
      let userpass = await new Promise(function(s,f){
         db.all(`SELECT userid FROM users WHERE userid = :userid AND password = :password`,userid,password, function(err,rows){
            if(err) f();
            s(rows);
         });
      });
      
      let user = userpass.reduce(function(acc,d){
         return d.userid;
      },'');
      
      if(user === ''){
         this.emit('login-response','ERROR: USERNAME AND PASSWORD DOES NOT MATCH')
      }else{
         let newSessionKey = generateSessionKey();
         
         await new Promise(function(s,f){
            db.all(`DELETE FROM sessions WHERE userid = :userid`,userid,function(err){
               if(err) f(err);
               s();
            })
         }).catch(console.error);
         
         await new Promise(function(s,f){
            db.all(`INSERT INTO sessions(
               sessionid,
               userid
            )VALUES(
               :session, 
               :userid
            )`,newSessionKey,userid,function(err){
               if(err) f(err);
               s();
            })
         }).catch(console.error);
         
         this.emit('login-response',newSessionKey,userid);
      }
   }

   async function convoListRequest(sessionid, userid){
      let isVerified = await verifySession(sessionid,userid);
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

   async function convoCreateRequest(sessionid, userid, convoname, participants, maxusers){
      let isVerified = await verifySession(sessionid,userid);
      
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

   async function convoJoinRequest(sessionid, userid, convoid){
      let isVerified = await verifySession(sessionid,userid);
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

   async function convoMessageRequest(sessionid, userid, convoid, rawtext){
      let isVerified = await verifySession(sessionid,userid);
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
         
         await new Promise(function(s,f){
            db.all(`
               INSERT INTO messages(
                  messageid,
                  convoid,
                  userid,
                  rawtext
               ) VALUES (
                  :messageid,
                  :convoid,
                  :userid,
                  :rawtext
               )
            `,todayString,convoid,userid,rawtext,function(err){
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
         io.to(convoid).emit('convo-message-incoming',convoid,todayString,alias,color,rawtext);
      }
   }

   async function convoSearchRequest(sessionid, userid, searchText){
      let isVerified = await verifySession(sessionid,userid);
      if(isVerified){
         //query messages
         let messages = await new Promise(function(s,f){
            db.all(`
               SELECT
                  messages.rawtext,
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

   async function messageTagRequest(sessionid, userid, messageid, tagname){
      let isVerified = await verifySession(sessionid,userid);
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

   io.on('connection',function(socket){
      socket.on('pre-login-request',preLoginRequest.bind(socket));
      socket.on('login-request',loginRequest.bind(socket));
      socket.on('convo-list-request',convoListRequest);
      socket.on('convo-create-request',convoCreateRequest);
      socket.on('convo-join-request', convoJoinRequest);
      socket.on('convo-message-request', convoMessageRequest);
      socket.on('convo-search-request', convoSearchRequest.bind(socket));
      socket.on('message-tag-request', messageTagRequest);
   });
}