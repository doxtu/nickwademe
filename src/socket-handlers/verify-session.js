module.exports = (db) => async function verifySession(sessionid, userid){
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