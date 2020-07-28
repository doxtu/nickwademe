socket.on('login-response',function(sessionid,userid){
    if(/ERROR/.test(sessionid)){
       console.error(sessionid);
       PageData.currentState = 'login';
       return localStorage.clear();
    }
    if(typeof userid === 'undefined'){
       console.error('user not defined') 
       PageData.currentState = 'login';
       return localStorage.clear();
    } 
    
    PageData.sessionid = sessionid;
    PageData.userid = userid;
    localStorage.setItem('platychat-sessionid',sessionid);
    localStorage.setItem('platychat-userid',userid);
    
    socket.emit('convo-list-request',PageData.sessionid, PageData.userid);
 });
 
 socket.on('pre-login-response',function(sessionid){
    if(sessionid === PageData.sessionid) {
       socket.emit('convo-list-request',PageData.sessionid, PageData.userid);
    }
    else {
       console.error(sessionid);
       PageData.currentState = 'login';
       localStorage.clear();
    }
 });
 
 socket.on('convo-list-response',function(convoList){
    if(convoList <= 0) return console.error('no conversations!');
    convoList = JSON.parse(convoList);
    
    PageData.convoList = convoList;
    
    PageData.currentState = 'menu';
    
    convoList.forEach(function(d){
       var elt = document.createElement('tr');
       elt.id = 'convo-' + d.convoid;
       elt.innerHTML = '<td>' + d.convoid + '</td>'
       + '<td>' + d.convoname + '</td>'
       + '<td>' + d.participants + '</td>'
       
       elt.addEventListener('click',function(e){
          e.stopPropagation();
          var convoid = elt.querySelector('td:first-child').innerHTML;
          socket.emit('convo-join-request',PageData.sessionid, PageData.userid, convoid);
       });
       
       tableMenu.append(elt);
    });
 });

 socket.on('convo-create-response', function(convoid, convoname, participants){
   var elt = document.createElement('tr');
   elt.id = 'convo-' + convoid;
   elt.innerHTML = '<td>' + convoid + '</td>'
   + '<td>' + convoname + '</td>'
   + '<td>' + participants + '</td>'

   elt.addEventListener('click',function(e){
      e.stopPropagation();
      var convoid = elt.querySelector('td:first-child').innerHTML;
      socket.emit('convo-join-request',PageData.sessionid, PageData.userid, convoid);
   });

   tableMenu.append(elt);
 })
 
 socket.on('convo-join-response',function(convoid,messages){
    if(/ERROR/.test(PageData.sessionid)) return console.error(PageData.sessionid) && (PageData.currentState = 'menu');
    if(typeof convoid === 'undefined') return console.error('no convoid') && (PageData.currentState = 'menu');
    if(PageData.currentState !== 'messenger')
       setTimeout(function(){ulMessages.scrollTo(0,100000000);},100);

    PageData.currentState = 'messenger'
    PageData.currentConvoId = convoid;
    ulMessages.innerHTML = '';
    
    messages = JSON.parse(messages);
    
    messages.forEach(function(d){
       var elt = document.createElement('li');
       elt.id = 'message-' + d.messageid;
       elt.innerHTML = 
          d.timestamp + ' <span style="color:' + d.color + '">' + d.alias + '</span>' 
          + (d.tagname === null ? '' : '(' + d.tagname + ')') + ': ' + d.rawtext;
       
       var span = elt.querySelector('span');
       
       span.addEventListener('click',showCreateTagForm);
       
       ulMessages.append(elt);
    });
    
 });
 
 socket.on('convo-message-response',function(convoid){});

 socket.on('convo-message-incoming',function(convoid,messageid,alias,color,timestamp,rawtext){
    var elt = document.createElement('li');
    elt.id = 'message-' + messageid;
    elt.innerHTML = timestamp + ' <span style="color:' + color + '">' + alias + '</span>' + ': ' + rawtext;
    
    var span = elt.querySelector('span');
    span.addEventListener('click',showCreateTagForm);
    
    ulMessages.append(elt);
    ulMessages.scrollTo(0,100000000);
 });
 
 socket.on('convo-search-response',function(messages){
    messages = JSON.parse(messages);
    
    ulSettingsSearchResults.innerHTML = '';
    
    messages.forEach(function(d){
       var elt = document.createElement('li');
       
       elt.innerHTML = (
          d.tagname !== null && d.tagname.length > 0 ? d.tagname + ' --- ' : ''
       ) + d.alias + ' ' + d.timestamp + ': ' + d.rawtext;
       
       ulSettingsSearchResults.append(elt);
    });
 });
 
 socket.on('message-tag-response',function(messageid,tagname,alias,color,rawtext){
    var messageElt = document.querySelector('#message-' + messageid);
    messageElt.innerHTML = 
          '<span style="color:' + color + '">' + alias + '</span>' 
          + (tagname === null ? '' : '(' + tagname + ')') + ': ' + rawtext;
 });