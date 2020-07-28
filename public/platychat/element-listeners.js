window.addEventListener('focus',function(e){
    if(PageData.currentState === 'messenger'){
       socket.emit('convo-join-request',PageData.sessionid, PageData.userid, PageData.currentConvoId);
    }
 });
 
 window.addEventListener('paste',function(e){
    var items = e.clipboardData.items;
    var blob;
    
    for(var i = 0; i<items.length; i++){
       if(items[i].kind === 'file'){
          blob = items[i].getAsFile();
          break;
       }
    }
    
    if(typeof blob === 'undefined') return;
    var fileReader = new FileReader();

    function _generateRandomString(){
       let ret = '';
       for(let i = 0; i<9; i++){
          ret += Math.round(Math.random()*9).toString();
       }
       return ret; 
    }
    const fileIdentifier = _generateRandomString();

    blob.meta = fileIdentifier;
    fileReader.onload = function(e){
       //inputMessenger.value = '/image ' + e.target.result;
       socket.emit('convo-message-request',PageData.sessionid, PageData.userid, PageData.currentConvoId, '/image '+fileIdentifier);
       instance.submitFiles([ blob ]);
    }
    fileReader.readAsDataURL(blob);
 });
 
 inputMessengerFile.addEventListener('change',function(e){
    var fileList = this.files;
    
    for(var i = 0; i < fileList.length; i++){
       var blob = fileList[i];
       
       function _generateRandomString(){
          let ret = '';
          for(let i = 0; i<9; i++){
             ret += Math.round(Math.random()*9).toString();
          }
          return ret; 
       }
       const fileIdentifier = _generateRandomString();

       blob.meta = fileIdentifier;
       var fileReader = new FileReader();
       fileReader.onload = function(e){
          socket.emit('convo-message-request',PageData.sessionid, PageData.userid, PageData.currentConvoId, '/image '+fileIdentifier);
          instance.submitFiles([ blob ]);
       }
       fileReader.readAsDataURL(blob);
    }
    
 });
 
 formLogin.addEventListener('submit',function(e){
    e.preventDefault();
    var username = inputUsername.value;
    var password = inputPassword.value;
    if(username.length <= 0 || password.length <= 0) return console.error('Inputs invalid');
    socket.emit('login-request',username,password);
    inputUsername.value = '';
    inputPassword.value = '';
 });
 
 formCreateConvo.addEventListener('submit',function(e){
    e.preventDefault();
    PageData.isAddConvoToggled = false;

    var convoName = inputConvoName.value;
    var convoParticipants = inputConvoParticipants.value;
    inputConvoName.value = '';
    inputConvoParticipants.value = '';

    var maxUsers = convoParticipants.split(',').reduce(function(acc,d){
      return acc += 1
    }, 0);

    socket.emit('convo-create-request', PageData.sessionid, PageData.userid, convoName, convoParticipants, maxUsers)
 });
 
 formCreateTag.addEventListener('submit',function(e){
    e.preventDefault();
    socket.emit('message-tag-request',PageData.sessionid, PageData.userid, PageData.selectedMessageid, inputCreateTag.value);
    
    inputCreateTag.value = '';
    
    hideCreateTagForm();
 });
 
 formMessenger.addEventListener('submit',function(e){
    e.preventDefault();
    
    if(inputMessenger.value.length <= 0) return console.error('cant submit blank');
    
    socket.emit('convo-message-request',PageData.sessionid, PageData.userid, PageData.currentConvoId, inputMessenger.value);
    ulMessages.scrollTo(0,10000000000);
    inputMessenger.value = '';
 });
 
 formSettingsSearch.addEventListener('submit',function(e){
    e.preventDefault();
    
    var inputSettingsSearch = document.querySelector('#menuSettings form input');
    
    if(inputSettingsSearch.value.length <= 0) return console.error('cant submit blank');
    
    socket.emit('convo-search-request',PageData.sessionid,PageData.userid, inputSettingsSearch.value);
    
    inputSettingsSearch.value = '';
 });
 
 buttonOpenSettings.addEventListener('click',function(e){
    e.preventDefault();
    e.stopPropagation();
    divSettings.style.display = 'block';
 });
 
 buttonSettingsDarkMode.addEventListener('click',function(e){
    document.body.classList.toggle('dark-mode');
    menuOpenSettings.classList.toggle('dark-mode');
    ulMessages.classList.toggle('dark-mode');
    
    var convoRows = menuConvos.querySelectorAll('td');
    
    for(var i = 0; i<convoRows.length; i++){
       convoRows[i].classList.toggle('dark-mode');
    }
 });
 
 buttonMessengerBack.addEventListener('click',function(e){
    e.preventDefault();
    e.stopPropagation();
    
    ulMessages.innerHTML = '';
    
    PageData.currentState = 'menu';
 });

 buttonAddConvo.addEventListener('click', e => {
    e.stopPropagation();
    PageData.isAddConvoToggled = true;
 })
 
 buttonLogout.addEventListener('click',function(e){
    e.preventDefault();
    e.stopPropagation();
    localStorage.clear();
    location.reload();
 });
 
 function showCreateTagForm(e){
    e.stopPropagation();
    e.preventDefault();
    
    divCreateTag.style.display = 'block';
    divCreateTag.style.top = e.clientY + 'px';
    divCreateTag.style.left  = e.clientX + 'px';
    
    var messageid = /[0-9]+/.exec(this.parentNode.id)[0];
    
    PageData.selectedMessageid = messageid;
 }
 
 function hideCreateTagForm(e){
    divCreateTag.style.display = 'none';
    divSettings.style.display = 'none';
    PageData.isAddConvoToggled = false;
 }
 
 window.addEventListener('click',function(e){
    e.stopPropagation();
    if(
       e.target == divCreateTag
       || e.target == formCreateTag
       || e.target == inputCreateTag
       || e.target == divSettings
       || Array.from(formSettingsSearch.childNodes).indexOf(e.target) != -1
       || e.target == divCreateConvo
       || Array.from(formCreateConvo.childNodes).indexOf(e.target) != -1
    ) return;
    hideCreateTagForm();
 });