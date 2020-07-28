var socket = io();
var instance = new SocketIOFileUpload(socket);


var PageData = {
    'states':['login','menu','menu-add-convo','messenger'],
    'currentState':''
};

(function init(){
    var sessionid = localStorage.getItem('platychat-sessionid');
    var userid = localStorage.getItem('platychat-userid');
    
    if(sessionid && userid){
        PageData.sessionid = sessionid;
        PageData.userid = userid;
        socket.emit('pre-login-request',sessionid, userid);
    }else{
        PageData.currentState = 'login';
    }
})();

(function main(){
    requestAnimationFrame(main);
    render();
})();

function render(){
    switch(PageData.currentState){
    case 'login':
        sectionLogin.style.display = 'block';
        sectionMenu.style.display = 'none';
        sectionMessenger.style.display = 'none';
        break;
    case 'menu':
        sectionLogin.style.display = 'none';
        sectionMenu.style.display = 'flex';
        sectionMessenger.style.display = 'none';
        break;
    case 'messenger':
        sectionLogin.style.display = 'none';
        sectionMenu.style.display = 'none';
        sectionMessenger.style.display = 'flex';
        break;
    default:
        sectionLogin.style.display = 'none';
        sectionMenu.style.display = 'none';
        sectionMessenger.style.display = 'none';
    }
}

(function reloadRoom(){
    if(PageData.currentState === 'messenger'){
    socket.emit('convo-join-request',PageData.sessionid, PageData.userid, PageData.currentConvoId);
    }
    setTimeout(reloadRoom,10000);
})();