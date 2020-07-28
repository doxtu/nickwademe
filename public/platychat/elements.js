//login elements
var sectionLogin = document.querySelector('#login');
var buttonLogin = document.querySelector('#formLogin > button');
var inputUsername = document.querySelector('#username');
var inputPassword = document.querySelector('#password');
var formLogin = document.querySelector('#formLogin');

//menu elements
var sectionMenu = document.querySelector('#menu');
var tableMenu = document.querySelector('#menuConvos');
var buttonAddConvo = document.querySelector('#menuAddConvo'); 
var buttonOpenSettings = document.querySelector('#menuOpenSettings');
var buttonLogout = document.querySelector('#menuLogout');

//menu create convo form
var divCreateConvo = document.querySelector('#menuCreateConvo'); 
var formCreateConvo = document.querySelector('#menuCreateConvo form'); 
var inputConvoName = document.querySelector('#menuConvoName'); 
var inputConvoParticipants = document.querySelector('#menuConvoParticipants'); 
var buttonCreateConvo = document.querySelector('#menuCreateConvo form button'); 

//menu settings popup
var divSettings = document.querySelector('#menuSettings');
var formSettingsSearch = document.querySelector('#menuSettingsSearch');
var ulSettingsSearchResults = document.querySelector('#messageSearchResults');
var buttonSettingsDarkMode = document.querySelector('#menuSettingsDarkmode');

//messenger
var sectionMessenger = document.querySelector('#messenger');
var ulMessages = document.querySelector('#messengerMessages');
var formMessenger = document.querySelector('#messenger form');
var inputMessenger = document.querySelector('#messengerInput');
var inputMessengerFile = document.querySelector('#messengerInputFile');
var divMenuMessenger = document.querySelector('#messengerMenu');
var buttonMessengerBack = document.querySelector('#messengerMenuBack');

//messenger create tag form
var divCreateTag = document.querySelector('#messengerCreateTag');
var formCreateTag = document.querySelector('#messengerCreateTag form');
var inputCreateTag = document.querySelector('#messengerCreateTag form input');
var buttonCreateTag = document.querySelector('#messengerCreateTag form button');