const generateSessionKey = require('../platychat.utils').generateSessionKey;

module.exports = (db) => async function loginRequest(userid, password){
    let userpass = await new Promise(function(s,f){
       db.all(`SELECT userid FROM users WHERE UPPER(userid) = UPPER(:userid) AND password = :password`,userid,password, function(err,rows){
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
          db.all(`DELETE FROM sessions WHERE UPPER(userid) = UPPER(:userid)`,user,function(err){
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
          )`,newSessionKey,user,function(err){
             if(err) f(err);
             s();
          })
       }).catch(console.error);
       
       this.emit('login-response',newSessionKey,user);
    }
}