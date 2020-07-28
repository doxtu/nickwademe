module.exports.generateSessionKey = function generateSessionKey(){
    let ret = '';
    
    for(let i = 0; i<12; i++)
       ret += Math.round(Math.random()*9).toString();
    
    return ret;
}