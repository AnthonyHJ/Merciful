/*
 *	Merciful is an attempt to make a client for Castle Marrach which is 
 *	less Zealous.
 *	Credit goes to Zell (for Zealous) and the Zealotry team.
 *	The Orchil client is also an inspiration.
 */

'use strict';

function isDevMode() {
	if (!chrome.runtime) { return true; }
    return !('update_url' in chrome.runtime.getManifest());
}

//	Strip a value from local storage
//	chrome.storage.local.remove("minCharHistory");

//chrome.storage.local.get((contents) => {
//	debugLog(contents);
//});

//	Logging
var logFileName = "";
var logFileString = "";
var logFileID = 0; 
var currentDate = -1;
var currentDateString = "";

//	DOM objects
var mainTXT = document.getElementById("output");
var rightBar = document.getElementById("right");
var helperArea = document.getElementById("helper_area");
var menuArea = document.getElementById("menu_area");
var styleSheet = document.getElementsByTagName("style")[0];
var voteBar;
var inputGhost;
var inputWindow;
var debugWindow;

var lineHeight = -1;

//	Style overrides
var textStyles = new Map();
var linkStyle = new Map;

var outputName = 'initial_output';
var outputStyles = new Map;

var newMessages = "";

var themeMain;		//	Main colour of the theme
var themeText;		//	Text colour of the theme
var themeLink;		//	Link  colour of the theme
var themeContrast;	//	Contrast colour of the theme

//	Login vars
var cookieUser;
var cookiePass;
var localCharacter;

//	UI
var notifications = new Map();

var socketObject;

var lastMessage;	//	Used to stop newline spam

var useALICE = true;
var scrollToBottom = true;

var startedUp = false;

var ctrlDown = false;
var shiftDown = false;

//	Initialising

function init()
{
	inputWindow = document.getElementById("commandinput");
	inputGhost = document.getElementById("ghostinput");
	
	inputGhost.innerText = " ";
	
	inputGhost.style.width = window.getComputedStyle(inputWindow).getPropertyValue('width');
	
	//	copy style and size to 'inputGhost'
	
	//	Create the debug window
	if (isDevMode())
	{
		debugWindow = document.createElement("div");
		debugWindow.className = "UIText";
		debugWindow.style.minWidth = "100px";
		debugWindow.style.minHeight = "50px";
		debugWindow.style.right = "10px";
		debugWindow.style.top = "10px";
		debugWindow.style.position = "absolute";
		
		debugWindow.style.backgroundColor = "#1f1f1f";	
		debugWindow.style.color = "#DFDFDF";
		
		debugWindow.id = "debugWindow";
		
//		mainTXT.appendChild(debugWindow);
	}
	
	body.addEventListener('click', event => {
		var targ = event.target;
		
		if ((targ.localName == "font")||(targ.localName == "FONT"))
			targ = targ.parentNode;
		
		//	if it's a link with a title
		if (((targ.localName == "a")||(targ.localName == "A")) && (targ.title))
		{
			if (targ.title == 'Snap the window back to the bottom')
				return;
			
			sendMessage(targ.title);
		}
		
		if (targ.id == 'map_area')
		{
			mapPopUp = window.open(fullMapURL, 'Map', 'width=468, height=468');
			if (!mapPopUp)
				reportClientMessage('I just tried to open a new window, but I seem to have failed.', 'error');
			else 
				mapPopUp.focus();
		}
		
		if (targ.id.substring(0,6) == 'player')
		{
			if ((inputWindow.value.length > 0)&&(inputWindow.value[inputWindow.value.length-1] != " "))
				inputWindow.value += " ";
			
//			debugLog(targ.innerText);
			inputWindow.value += targ.innerText;
			
			inputWindow.focus();
		}
	});
	
	window.addEventListener('focus', event => {
		if (scrollToBottom && (window.document.title.substring(0,2) == "* "))
		{
			window.document.title = window.document.title.substring(2,window.document.title.length);
		}
		
//		debugLog('The tab is now in focus');
	});
	
	mainTXT.addEventListener('scroll', event => {
		if (mainTXT.scrollTop +5 > mainTXT.scrollHeight - mainTXT.clientHeight)
			snapToBottom();
		else
			unSnapWindow();
		
//		debugLog('The window scrolled');
	});
	
	window.addEventListener('resize', event => {
		//	scroll down to end?
		if (scrollToBottom)
			mainTXT.scrollTop = mainTXT.scrollHeight - mainTXT.clientHeight;
		
		inputGhost.style.width = window.getComputedStyle(inputWindow).getPropertyValue('width');
	
//		debugLog('The window resized');
	});
	
	var findArgs = document.URL.split("?")[1];
	var args;

	if (findArgs)
		args = findArgs.split("&");
	
	console.log("Initialising " + client.name + " " + client.version);
	
	if (args)
	{
		args.forEach(function(item, index) {
			let argsplit = item.split("=");
			if (argsplit[0] == "charName")
			{
				localCharacter = argsplit[1];
			
				let localCharacterCap = localCharacter.substring(0,1).toUpperCase() + 
										localCharacter.substring(1,localCharacter.length).toLowerCase();
				window.document.title = localCharacterCap + " - " + client.name + " " + client.version
				
				//	Ensure the Web Worker knows about this tab
				chrome.runtime.sendMessage({'registerTab': true, 'login': localCharacter}, () => {return true;});
			}
		});
	}
	
	currentDateString = 'currentDate-' + gamePrefix + '-' + localCharacter;
	
	chrome.storage.local.get([currentDateString], function(result) 
	{
		if (result.currentDate)
			currentDate = result.currentDate;
		else 
		{
			currentDate = result.currentDate;
					
			let timeNow = new Date ();
			
			timeNow.setTime( timeNow.getTime() - marrachTime.offset*60*60*1000 );
			
			currentDate = timeNow.getUTCDate();
			
			//	Update currentDateString in LocalStorage
			chrome.storage.local.set({[currentDateString] : currentDate}, function() {
				//  console.log('currentDate is set to ' + currentDate);
				});
		}
	});
	
	chrome.storage.local.get(['cookieUser' + gamePrefix], function(result) {
		cookieUser = result.cookieUser;
		
		chrome.storage.local.get(['cookiePass' + gamePrefix], function(result) {
			cookiePass = result.cookiePass;
		
			if ((!cookieUser) && (!cookiePass))
			{
				//	Manually load them?
				//	TODO: This should be a temp-fix.
				chrome.cookies.get({'url':loginURL, 'name':'user'}, function(cookie)
				{
					if (cookie != null)
					{
						cookieUser = cookie.value;
						
						chrome.cookies.get({'url':loginURL, 'name':'pass'}, function(cookie)
						{
							if (cookie != null)
							{
								cookiePass = cookie.value;
								loadClientVars();
								serverConnect();
							}
							else
								reportClientMessage("NO ACCOUNT DATA (PASSWORD FAIL)", 'error');
						});
					}
					else
						reportClientMessage("NO ACCOUNT DATA (USERNAME FAIL)", 'error');
				});
			}
			else if (!cookieUser)
			{
				//	Manually load username?
				//	TODO: This should be a temp-fix.
				chrome.cookies.get({'url':loginURL, 'name':'user'}, function(cookie)
				{
					if (cookie != null)
					{
						cookieUser = cookie.value;
						loadClientVars();
						serverConnect();
					}
					else
						reportClientMessage("NO USERNAME", 'error');
				});
			}
			else if (!cookiePass)
			{
				//	Manually load password?
				//	TODO: This should be a temp-fix.
				chrome.cookies.get({'url':loginURL, 'name':'pass'}, function(cookie)
				{
					if (cookie != null)
					{
						cookiePass = cookie.value;
						loadClientVars();
						serverConnect();
					}
					else
						reportClientMessage("NO PASSWORD", 'error');
				});
			}
			else if ((!localCharacter))
				reportClientMessage("NO CHARACTER SELECTED", 'error');
			else
			{
				loadClientVars();
				serverConnect();
			}
		});
	})
	
	//	Add menu
	let menuArea = document.getElementById("menu_area");
	
	let optionButton = document.getElementById("options");
	optionButton.addEventListener("click", menuClick);
	
	let logButton = document.getElementById("log");
	logButton.addEventListener("click", menuClick);

	//	Some nice handlers
	inputWindow.addEventListener("keydown", keyPress);
	inputWindow.addEventListener("keyup", keyUp);
	mainTXT.addEventListener("click", inputGiveFocus);
	window.addEventListener("beforeunload", closeServer);
	
	let snapButton = document.getElementById("snap_button");
	snapButton.addEventListener("click", snapToBottom);

	RunOnStart();
}

function loadClientVars()
{
	//	If you can get it from chrome.storage.local then do so.
	chrome.storage.local.get(['clientVars'], function(result) {
		let _changed = false;
		
		if (!result.clientVars)
			result.clientVars == {};
		
		if (!result.clientVars.core)
			result.clientVars.core == {};
		
		//	read in core values and override
		for (const [key, value] of Object.entries(result.clientVars.core)) {
			clientVars.set(key,value);
			};
		
		if (!result.clientVars.game)
			result.clientVars.game == {};
		
		if (!result.clientVars.game[gamePrefix])
			result.clientVars.game[gamePrefix] == {};
		
		//	read in game values and override
		for (const [key, value] of Object.entries(result.clientVars.game[gamePrefix])) {
			clientVars.set(key,value);
			};
		
		if (!result.clientVars.char)
			result.clientVars.char == {};
		
		if (!result.clientVars.char[gamePrefix])
			result.clientVars.char[gamePrefix] == {};
		
		if (!result.clientVars.char[gamePrefix][localCharacter])
		{
			result.clientVars.char[gamePrefix][localCharacter] = {};
			_changed = true;
		}
		
		//	read in player values and override
		for (const [key, value] of Object.entries(result.clientVars.char[gamePrefix][localCharacter])) {
			clientVars.set(key,value);
			};
		
		if (_changed)
			chrome.storage.local.set({clientVars : result.clientVars}, function(){
				console.log("Created preferences entry for " + localCharacter); 
			});
		else
			console.log("Loaded preferences");
	
		if (gamePrefix == 'AE')
		{
			LoadStyles();
		}
	
		rebuildStyleSheet();
	});
  
	//	If you can get it from chrome.storage.local then do so.
	chrome.storage.local.get(['macros'], function(result) {
		let _changed = false;
		
		//	No macros stored?
		if (!result.macros)
			result.macros = {};
		
		//	No macros stored for any game?
		if (!result.macros.game)
			result.macros.game = {};
		
		//	No macros stored for this game?
		if (!result.macros.game[gamePrefix])
			result.macros.game[gamePrefix] = {};
		
		//	No core macros stored for this game?
		if (!result.macros.game[gamePrefix].core)
		result.macros.game[gamePrefix].core = {};
		
		//	Load game-specific macros
		for (const [key, value] of Object.entries(result.macros.game[gamePrefix].core)) 
		{
			macros.set(key,value);
		};
		
		//	No macros stored for any character in this game?
		if (!result.macros.game[gamePrefix].char)
			result.macros.game[gamePrefix].char = {};
		
		//	No macros stored for this character?
		if (!result.macros.game[gamePrefix].char[localCharacter])
		{
			_changed = true;
			result.macros.game[gamePrefix].char[localCharacter] = result.macros.game[gamePrefix].core;
		}
		
		//	Load character-specific macros
		for (const [key, value] of Object.entries(result.macros.game[gamePrefix].char[localCharacter])) {
			macros.set(key,value);
		};
		
		if(Object.keys(result.macros.game[gamePrefix].core).length == 0)
			delete result.macros.game[gamePrefix].core;
		
		if (_changed)
			chrome.storage.local.set({macros : result.macros}, function(){
				console.log("Created macros entry for " + localCharacter); 
			});
		else
			console.log("Loaded macros");
	});
 }

function serverConnect()
{
	var connectStatus;
	
	var url = profile.protocol + "://" + profile.server + ":" + profile.port + profile.path;
	console.log(url);
	
	if (socketObject)
		socketObject.close(1000, 'Reconnecting');
	
	socketObject = new WebSocket(url);
	
	socketObject.onopen = serverHandshake;
	socketObject.onmessage = serverMessage;
	socketObject.onerror = serverError;
	socketObject.onclose = serverDisconnect;
	
	if (window.document.title.substring(0,13) == "DISCONNECTED ")
		window.document.title = window.document.title.substring(13,window.document.title.length);
	
	//	If the reconnect button is visible / extant, remove it.
	var connectButton = document.getElementById("connect-button");
	
	if (connectButton != null)
		connectButton.remove();
}

function serverHandshake(event)
{
	debugLog("Handshake!");
	
	if (event.data)
		serverMessage(event);
	
	inputWindow.className = inputWindow.className.replace(/\bdisabled\b/,'');
	inputWindow.placeholder = "Enter a command...";

	inputWindow.disabled = false;

	if (useALICE)
		sendMessage("SKOTOS " + client.name + " " + client.version);
	
	inputWindow.focus();
}

//	Drawing to the screen

function reportClientMessage(myMessage, className)
{
	newMessages += "<div class='" + className + " themeMain'>" + myMessage + "</div>";
}

function reportMessage(myMessage)
{
	let startPre = /\<pre\>/;
	let endPre = /\<\/pre\>/;
	let closePre = endPre.test(myMessage);
   
	if (startPre.test(myMessage))
	{
		textStyles.set("font-family", "monospace");
		textStyles.set("white-space", "pre");
	}
	
	var textOverrides = "";
	
	myMessage = myMessage.replace(String.fromCharCode(8,8), "");	
	
	if ((textStyles.size > 0)&&(myMessage != ""))
	{
		textOverrides = "style=\'";
		
		textStyles.forEach(function(value, key, map){
			textOverrides += key + ":" + value + ";";
		});
	
		textOverrides += "\'";
	}
	
	var styleString = "";
	
	//	We need to handle all of the tags and other fun bits in here...
	myMessage = myMessage.replace(/ @vote([ !])/g, function(match, p1, offset, string){
		highlightVote();
		return " <a xch_cmd=\"@vote\">@vote</a>" + p1;
	});
	
	myMessage = myMessage.replace(/\"@(allow|deny) (\w+?)\"/g, "<a xch_cmd=\"@$1 $2\">@$1 $2</a>");
	
	myMessage = myMessage.replace(/<a xch_cmd=/g, "<a style=\"" + styleString + "\" title=");

	var timeNow = new Date ();
	var timeServer = new Date ();
	
	timeServer.setTime( timeNow.getTime() - marrachTime.offset*60*60*1000 );
	
	if (clientVars.get('timeZone') == 'server')
	{
		timeNow = timeServer;
	}
	
	let tempDate = timeServer.getUTCDate();
	
	if (currentDate == -1)
	{
		currentDate = tempDate;
		
		//	Update currentDateString in LocalStorage
		chrome.storage.local.set({[currentDateString] : currentDate}, function() {
			  console.log('currentDate is set to ' + currentDate);
			});
	}
	else if ((clientVars.get('markDawn') == 1) && (currentDate != tempDate)) //	need to check for new days
	{
		debugLog('date changed from ' + currentDate + ' to ' + tempDate);
		
		marrachTime.updateTime();
		
		sendToLogger(" ");
		sendToLogger("The " + ordinalTrue(marrachTime.day) + " of the " + ordinalTrue(marrachTime.moon) + " Moon in the " + ordinalTrue(marrachTime.yra) + " Year of Recent Awakenings");
		sendToLogger(" ");
		
		currentDate = tempDate;
		
		//	Update currentDateString in LocalStorage
		chrome.storage.local.set({[currentDateString] : currentDate}, function() {
			  console.log('currentDate is set to ' + currentDate);
			});
	}
	else if (currentDate != tempDate)
	{
		debugLog('date changed from ' + currentDate + ' to ' + tempDate);
		
		currentDate = tempDate;
		
		//	Update currentDateString in LocalStorage
		chrome.storage.local.set({[currentDateString] : currentDate}, function() {
			  console.log('currentDate is set to ' + currentDate);
			});
	}
	
	var timeString = ("0" + timeNow.getHours()).slice(-2) + ":" + 
    ("0" + timeNow.getMinutes()).slice(-2) + ":" + 
    ("0" + timeNow.getSeconds()).slice(-2) + ": ";
	
	if (myMessage == "")
		newMessages += "<div class='message themeMain' " + textOverrides + "></div>";
	else if (clientVars.get('useTimeStamps') == 1)
		newMessages += "<div class='message themeMain' " + textOverrides + ">" + timeString + cleanTags(myMessage) + "</div>";
	else
		newMessages += "<div class='message themeMain' " + textOverrides + ">" + cleanTags(myMessage) + "</div>";
	
	if (myMessage != "")
		sendToLogger(timeString + myMessage);
	else if (clientVars.get('logFormat') == 'html')
		sendToLogger(myMessage);
	
	let messageLimit = clientVars.get('messageHistory');
	
	while (mainTXT.children.length > messageLimit)
	{
		mainTXT.children[0].remove();
	}
	
   var tmp = document.createElement("DIV");
   tmp.innerHTML = myMessage;
   var textOut = tmp.textContent || tmp.innerText || "";
   
   let pageReg1 = /is trying to page you/;
   let pageReg2 = /^\[OOC Page\] from/;
   
   let gotPage = pageReg1.test(textOut) || pageReg2.test(textOut);
   
	//	On first message after scrolling up or losing focus...
	if (((!document.hasFocus())||(!scrollToBottom))&&(window.document.title.substring(0,2) != "* ")&&(myMessage))
	{
		//	Notify player of new events
		window.document.title = "* " + window.document.title;
		
		//	Play an event noise?
		//	TODO: use audioTriggersFixed['notifySound']
		if (clientVars.get('useNotifySound') == 'once')
		{
			//	debugLog('NotifyOnce');
			playSound('notifySound');
		}
	}
	else if (((!document.hasFocus())||(!scrollToBottom))&&(clientVars.get('useNotifySound') == 'always')&&(myMessage))
	{
		//	debugLog('NotifyAlways');
		playSound('notifySound');
	}
	else if ((gotPage)&&(clientVars.get("notifyOnPage") == 1))
	{
		debugLog("New Page");
		playSound('notifySound');
	}
	
	if (closePre)
	{
		textStyles.delete("font-family");
		textStyles.delete("white-space");
	}
}

function addNotification(windowObj, name)
{
	//	Create an array - [the notification window itself, its new position in the list]
	let dataValues = [windowObj, notifications.size];
	
	//	If the notification exists, kill the old one and overwrite it with this one
	
	//	Add it to the notifications map.
	notifications.set(name, windowObj);
	
	//	Set its offset
}

function dropNotification(name)
{
	//	grab the entry if it exists
	if (notifications.has(name))
	{
		debugLog("Found UI Object: " + name);
		
		debugLog(notifications.get(name));
		
		//	check its dataValues for its position
		//	kill the object
		let objToKill = notifications.get(name);
		debugLog(objToKill);
		objToKill.remove();
		
		//	for each of its younger siblings...
			//	move them forward a position
			//	reposition them
	} else {
		debugLog("Couldn't find UI Object: " + name);
	}
}

function parseServerEvent(text)
{
//	debugLog(">" + text + "<");

	var lines = text.split('\r\n');
	
	lines.forEach(parseMessage);
	
	//	send 'add to the buffer' content into main window
	mainTXT.innerHTML += newMessages;

	//	new 'add to the buffer' content
	newMessages = "";
	
	//	scroll down to end?
	if (scrollToBottom)
		mainTXT.scrollTop = mainTXT.scrollHeight - mainTXT.clientHeight;
}

function highlightVote()
{
	if (voteBar)
		return;
	
	debugLog('Creating the vote window.');
	
	voteBar = document.createElement("div");
	voteBar.style="background-color:#FFFFAF; color:#1f1f1f; position:sticky; top:0;";
	voteBar.innerHTML = "Don't forget to <a style=\"color:#333377; font-weight: bold;\" title=\"@vote\">@vote</a>!";
	voteBar.id = 'vote_bar';
	voteBar.className = 'message';
	mainTXT.prepend(voteBar);
}

function hideVote()
{
	debugLog('Hiding the vote window.');
	
	if (voteBar)
		if (document.getElementById('vote_bar'))
			document.getElementById('vote_bar').remove();
	
	voteBar = null;
}

function snapToBottom()
{
	scrollToBottom = true;
	mainTXT.scrollTop = mainTXT.scrollHeight - mainTXT.clientHeight;
	
	//	Make the snap-to button invisible
	let snapButton = document.getElementById("snap_button");
	snapButton.style.display = "none";
	
	if ((window.document.title.substring(0,2) == "* ")&&(!snapToBottom))
	{
		window.document.title = window.document.title.substring(2,window.document.title.length);
	}
}

function unSnapWindow()
{
	scrollToBottom = false;
	
	//	Make the snap-to button visible
	let snapButton = document.getElementById("snap_button");
	snapButton.style.display = "block";
}

//	Clean output

function cleanTags(dirtyTags)
{
	//	Check a whole load of <TAG>, </TAG>, and <TAG /> against the 'clean' list and discard the others
	let regexTags = /<(\w+?)([> ])/g;
	
	let tagsToStrip = new Map();
	let tagsToHide = new Map();
//	let cleanedTags = dirtyTags.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	let cleanedTags = dirtyTags.normalize("NFD");
	let myArray;
	
	while (myArray = regexTags.exec(dirtyTags))
	{
		//	<a> (with restrictions), <b>, <i>, <strong>, <em>, <font>
		switch (myArray[1])
		{
			case 'a':
				//	might check this doesn't have a 'href' value
			case 'b':
			case 'i':
			case 'em':
			case 'strong':
			case 'font':
				//	good results
				break;
			case 'pre':		//	Since we use this...
			case 'body':	//	Just in case it slips through
				//	hijacked results
				tagsToHide.set(myArray[1], true);
				break;
			default:
				//	bad results
				tagsToStrip.set(myArray[1], true);
		}
	}
	
	//	Links must not use href
	cleanedTags = cleanedTags.replace(/href\s*?=\s*?['"].+?['"]\s?/, "");
	
	if (tagsToHide.size > 0)
	{
		tagsToHide.forEach((value, key)=>{
			var re = new RegExp("<(?:\/)*" + key + "(>| [^>]*>)", 'g');
			cleanedTags = cleanedTags.replace(re, "");
			
			debugLog(key + " tag was hijacked by code.");
		})
	}
	
	if (tagsToStrip.size > 0)
	{
		tagsToStrip.forEach((value, key)=>{
			//	send a message about removed tags
			debugLog("Input: " + cleanedTags);

			var re = new RegExp("<(?:\/)*" + key + "(>| [^>]*>)", 'g');
			cleanedTags = cleanedTags.replace(re, unTagify);
			
			//	send a message about removed tags
			debugLog(key + " tag was stripped out for security reasons.");
			debugLog("Output: " + cleanedTags);
		})
	}
	
	//	Markdown; add in some more tags.
	cleanedTags = cleanedTags.replace(/\B-(\w+?)-\B/g, "<em>$1</em>").replace(/\B\*(\w+?)\*\B/g, "<strong>$1</strong>");
	
	//	And forceLightMode to finish!
	if (forceLightMode)
	{
		//	Halve the intensity of all colours as a cheap solution.
		cleanedTags = cleanedTags.replace(/<font color=(?:\")?(#......)(?:\")?>/g, halfColour);
	}
	
	if (gameName == "Allegory of Empires")
	{
		cleanedTags = cleanedTags.replace(/<a style=(?:[\"\'])(.*?)(?:[\"\']) title=(?:[\"\'])(.*?)(?:[\"\'])><font color=(?:\")?(?:#.*?)(?:[\"\'])?>(.*?)<\/font>/g, "<a style=\"$1\" title=\"$2\">$3");
	}

	return cleanedTags;
}

function unTagify(match)
{
	return "&lt;" + match.substring(1,match.length-1) + "&gt;";
}

//	Networking

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.clientVar && request.value)
		{
			if (request.gameName)
				if (request.gameName != gamePrefix)
					return;
				
			if (request.charName)
				if (request.charName != localCharacter)
					return;
				
			//	It is a new clientVar value
			updateClientVars(request.clientVar, request.value, request.game);
		}
		else if (request.trigger)
		{
			if (request.gameName)
				if (request.gameName != gamePrefix)
					return;
				
			if (request.charName)
				if (request.charName != localCharacter)
					return;
				
			//	It is a new macro value
			updateMacros(request.trigger, request.command, request.game);
		}
		else 
		{
			//	I think there has been an error here...
		}
  });
  
function serverMessage(event)
{
	switch(socketObject.binaryType)
	{
		case "blob":
			event.data.text().then(text => parseServerEvent(text));
			break;
			
		case "arraybuffer":
			reportClientMessage("I just got an ArrayBuffer", 'connection');
			break;
			
		default:
	}
	
//	debugLog(event.data);
}

function serverError(event)
{
	debugLog("Error!");
	switch(socketObject.binaryType)
	{
		case "blob":
			event.data.text().then(text => reportClientMessage(text, 'error'));
			break;
			
		case "arraybuffer":
			reportClientMessage("I just got an ArrayBuffer", 'error');
			break;
			
		default:
	}
	
	debugLog(event);
}

function serverDisconnect(event)
{
	window.document.title = "DISCONNECTED " + window.document.title;

	debugLog("Disco!");
	debugLog(event);
	
	playSound('shutDownSound');
	reportClientMessage("Disconnected", 'connection');
	SaveLogFile();
	hideVote();
	
//	Create a new UI element which calls serverConnect();
	//	Create new element
	let connectButton = document.createElement("div");
	
	connectButton.style="background-color:#FFFFAF; color:#1f1f1f; text-align: center; cursor: pointer; font-weight: bold";
	connectButton.innerHTML = "Reconnect";
	connectButton.id = 'connect-button';
	connectButton.className = 'message';
	document.getElementById("inputwrapper").prepend(connectButton);
	
	//	Give it an onClick of serverConnect();
	connectButton.addEventListener('click', serverConnect);
}

function closeServer(event)
{	
	SaveLogFile();

	if (socketObject.readyState == WebSocket.OPEN)
	{
		socketObject.close(1000,'Window was closed.');
	}
}

function menuClick(event)
{
	sendMessage(event.target.title);
}

//	Themes

function rotateColour (colourIn)
{
	if (colourIn.length == 7)
	{
		var r = parseInt(colourIn.substring(1,3), 16);
		var g = parseInt(colourIn.substring(3,5), 16);
		var b = parseInt(colourIn.substring(5,7), 16);
		
		r = (r + 128) % 256;
		g = (g + 128) % 256;
		b = (b + 128) % 256;
		
		var colourOut = "#" + g.toString(16) + b.toString(16) + r.toString(16);
//		debugLog(colourIn + " => " + colourOut);
		return colourOut;
	}
}

//"<font color=\"" + halfColour("$1") + "\">"
function halfColour (match, colourIn, offset, string)
{
	if (colourIn.length == 7)
	{
		var r = parseInt(colourIn.substring(1,3), 16);
		var g = parseInt(colourIn.substring(3,5), 16);
		var b = parseInt(colourIn.substring(5,7), 16);
	}
	else if (colourIn.length == 4)
	{
		var r = parseInt(colourIn.substring(1,2), 16) * 17;
		var g = parseInt(colourIn.substring(2,3), 16) * 17;
		var b = parseInt(colourIn.substring(3,4), 16) * 17;
	}
	else
	{
		var r = 0;
		var g = 0;
		var b = 0;
	}
	
	if (r+b+g > 383)
	{
		r = Math.floor(r/2).toString(16).padStart(2, '0');
		g = Math.floor(g/2).toString(16).padStart(2, '0');
		b = Math.floor(b/2).toString(16).padStart(2, '0');
	}
	else
	{
		r = r.toString(16).padStart(2, '0');
		g = g.toString(16).padStart(2, '0');
		b = b.toString(16).padStart(2, '0');
	}
	
	var colourOut = "#" + r + g + b;
	
	debugLog("halfColour: " + colourIn + " => " + colourOut);
	
	return "<font color=\"" + colourOut + "\">";
}

function iconColour (colourIn)
{
	//	TODO: This should literally recolour the icons
//	return;
	
	if (colourIn.length == 7)
	{
		let r = parseInt(colourIn.substring(1,3), 16);
		let g = parseInt(colourIn.substring(3,5), 16);
		let b = parseInt(colourIn.substring(5,7), 16);
		
		let totalValue = r + b + g;
		
		if (totalValue > 383)
		{
			//	light background, so dark icons
			let snapImage = document.getElementById("snap_image");
			snapImage.src = "images/download_b.png";
//			optionsIcon.src = "images/settings_b.png";
		}
		else
		{
			//	dark background, so light icons
			let snapImage = document.getElementById("snap_image");
			snapImage.src = "images/download_w.png";
		}
	}
}

function updateTheme(bodyTag)
{
	if (gameName == "Allegory of Empires")
		return;
	
	let regexBig = RegExp(' (.*?)=\'(.*?)\'', 'g');
	let myArray;
	
	while (myArray = regexBig.exec(bodyTag))
	{
		if (myArray[1] == "bgcolor")
		{
			themeMain = myArray[2];
			themeText = rotateColour(myArray[2]);
			themeContrast = rotateColour(myArray[2]);
			
			//	Let's recolour the icons
			iconColour(rotateColour(myArray[2]));
		}
		
		if (myArray[1] == "text")
		{
			themeText = myArray[2];
		}
		
		if (myArray[1] == "link")
			themeLink = myArray[2];
	}
	
	//	split off a new DIV as the main window, assign it to mainTXT as the new value.
	
	rebuildStyleSheet()
}

function rebuildStyleSheet()
{
	//	Should actually just assign these values to current maintext DIV once I create that functionality
	
	let windowStyle = 
			'.message, .UIText { ' +
				'font-family: ' + clientVars.get("font") + '; ' +
				'font-size: ' + clientVars.get("fontSize") + '; ' +
				'}' + 
			'div#output {' + 
				'padding: 0 ' + clientVars.get("outputMargin") + 'em;' +
				'}' +
			//	basic style
			'.themeMain { ' + 
				'background-color : ' + themeMain + '; ' +
				'color : ' + themeText + '; ' +
				'}' + 
			'.themeMain A { ' + 
				'color : ' + themeLink + '; ' +
				'}' + 
			'.themeContrast { ' + 
				'background-color : ' + themeContrast + '; ' +
				'color : ' + themeMain + '; ' +
//				'}' + 
			//	:hover style
//			'.target-assist:hover { ' + 
//				'background-color : ' + themeContrast + '; ' +
//				'color : ' + themeMain + '; ' +
				'}';
	
	outputStyles.set(outputName, 
			'#' + outputName + ' .message, .UIText { ' +
				'font-family: ' + clientVars.get("font") + '; ' +
				'font-size: ' + clientVars.get("fontSize") + '; ' +
				'}' + 
			//	basic style
			'#' + outputName + ' .themeMain { ' + 
				'background-color : ' + themeMain + '; ' +
				'color : ' + themeText + '; ' +
				'}' + 
			'#' + outputName + ' .themeMain A { ' + 
				'color : ' + themeLink + '; ' +
				'}' + 
			'#' + outputName + ' .themeContrast { ' + 
				'background-color : ' + themeContrast + '; ' +
				'}');
	
	//	Should foreach on outputStyles to compile a stylesheet
	styleSheet.innerHTML = windowStyle + '\n' + outputStyles.get(outputName);
	
	//	send these values to background.js for HTML logs
	let myStyles = new Object();
	
	myStyles.fonts =	'font-family: ' + clientVars.get("font") +
						'; font-size: ' + clientVars.get("fontSize") + ';';
	myStyles.colours =	'background-color : ' + themeMain + '; ' +
						'color : ' + themeText + ';';
	myStyles.links = 'color : ' + themeLink + ';';
	
	chrome.runtime.sendMessage({'htmlStyles': myStyles}, () => {return true;});
		
	lineHeight = getComputedStyle(inputGhost)['height'];
//	debugLog("Line height = " + lineHeight.toString());
}

//	Options

var clientVars = new Map([
  ['logging', 1],
  ['commandHistory', 50],
  ['minCharHistory', 2],
  ['messageHistory', 2000],
  ['useSound', 1],
  ['soundVolume', 10],
  ['useNotifySound', 'once'],
  ['notifyOnPage', 1],
  ['hideNpcNames', 1 ],
  ['nameSort', 'Default' ],
  ['echoInput', 1 ],
  ['outputMargin', 1],
  ['scrollHeader', '%day%D / %moon%M / %yra%YRA'],
  ['font', 'Verdana'],
  ['fontSize', 'medium'],
  ['mercifulTheme', 'Mercy'],
  ['useHealTimer', 0],
  ['useCombatPanel', 0],
  ['useTimeStamps', 0],
  ['logFormat', 'txt'],
  ['timeZone', 'local'],
  ['markDawn', 0],
  ['useDarkMode', 'Default'],
]);

var macros = new Map();

function updateClientVars(key, value, game)
{
	clientVars.set(key, value);
	
	debugLog(key + " is now equal to " + value)
	
	if ((key == "font")||(key == "fontSize")||(key == 'outputMargin'))
	{
		rebuildStyleSheet();
	}
	
	if (key == "nameSort")
	{
		reSortPersonList();
	}
}

function updateMacros(key, value, game)
{
	if (value)
		macros.set(key, value);
	else
		macros.delete(key);
	
	debugLog(">" + key + "< is now mapped to >" + value + "<");
	
	debugLog(macros);
}

//	Input pane

var commandHistory = new Array();
var commandHistoryLoc = 0;
var commandHistoryTemp = "";

function inputGiveFocus(e)
{
	if(window.getSelection().isCollapsed)
		inputWindow.focus();
}

function sendMessage(text)
{
	//	need to intercept some special values
	if (text == "@log")
	{
		SaveLogFile();
		return;
	}
	else if (text == "@reconnect")
	{
		//	This is an empty function
		
		return;
	}
	else if (text == "@options")
	{
		//	open options window
		let optionsWindow = window.open("options.html?game=" + gamePrefix + "&char=" + localCharacter, 'options', 'width=900, height=600');
		
		return;
	}
//	else if (text == "@healer")
//	{
//		healerWindow("Bob", "Novice", 5)
//		
//		//	This should never be sent to the server.
//		return;
//	}
	else if (text.substring(0,5) == "@vote")
	{
		hideVote();
	}
	else if (text.substring(0,14) == "@profile theme")
	{
		//	Correct for default style
		mainTXT.style = null;
		inputWindow.style = null;
		helperArea.style = null;
		rightBar.style = null;
		
		//	Let's recolour the icons
		iconColour("#FFFFFF");
	}
	
	if ((clientVars.get("echoInput") == 1) && (startedUp))
		reportMessage("> " + text)
	
	//	Strip accents and other stuff which doesn't show correctly in the other clients.
//	socketObject.send(text.normalize("NFD").replace(/[\u0300-\u036f]/g, "") + "\n");
	socketObject.send(text.normalize("NFD") + "\n");
}

function keyPress(e)
{
	switch (e.key)
	{
		case 'Save':
			SaveLogFile();
			break;
		case 'ArrowDown':
			setTimeout(function(oldStart, oldEnd) {
				//	if at least one value has changed, don't jump!
				if ((inputWindow.selectionStart == oldStart)&&(inputWindow.selectionEnd == oldEnd))
					nextCommand();
				else if ((inputWindow.selectionStart == inputWindow.selectionEnd) && (inputWindow.selectionStart == inputWindow.value.length))
					nextCommand();
				
			}, 0, inputWindow.selectionStart, inputWindow.selectionEnd);
			
			break;
		case 'PageDown':
			nextCommand();
			break;
			
		case 'ArrowUp':
			setTimeout(function(oldStart, oldEnd) {
				//	if at least one value has changed, don't jump!
				if ((inputWindow.selectionStart == oldStart)&&(inputWindow.selectionEnd == oldEnd))
					prevCommand();
				else if ((inputWindow.selectionStart == inputWindow.selectionEnd) && (inputWindow.selectionStart == 0))
					prevCommand();
			}, 0, inputWindow.selectionStart, inputWindow.selectionEnd);
			
			break;
		case 'PageUp':
			prevCommand();
			break;
			
		case 'Enter':
			checkForMacro();
			
			if (shiftDown)
				break;
			
			sendInputWindow();
			e.preventDefault();
			break;
		case 'Spacebar':
		case ' ':
			checkForMacro();
			break;
		case 'Shift':
			shiftDown = true;
			break;
		case 'Control':
			ctrlDown = true;
			break;
			
		default:
			//	Do nothing...
			break;
	}
}

function keyUp(e)
{
	switch (e.key)
	{
		case 'Shift':
			shiftDown = false;
			break;
		case 'Control':
			ctrlDown = false;
			break;
			
		default:
			//	Do nothing...
			break;
	}
	
	//	&zwnj; is used to force a newline in the invisible 
	
	inputGhost.innerHTML = inputWindow.value.replace(/\n/g, '<br>') + '&zwnj;';
	inputGhost.style.width = window.getComputedStyle(inputWindow).getPropertyValue('width');
		
	let lines = parseInt(getComputedStyle(inputGhost)['height']) / parseInt(lineHeight);
	
	if (inputWindow.rows != Math.max(lines, 2))
	{
		//	scroll down to end?
		if (scrollToBottom)
			mainTXT.scrollTop = mainTXT.scrollHeight - mainTXT.clientHeight;
		
		inputWindow.rows = Math.max(lines, 2);
	}
}

function nextCommand()
{
	if(commandHistory.length == commandHistoryLoc)
	{
		return;
	}
	
	commandHistoryLoc++;
	if (commandHistoryLoc > commandHistory.length -1)
		commandHistoryLoc = commandHistory.length;
	
	if (commandHistory[commandHistoryLoc])
		inputWindow.value = commandHistory[commandHistoryLoc];
	else 
		inputWindow.value = commandHistoryTemp;
}

function prevCommand()
{
	if(commandHistory.length == 0)
	{
		return;
	}
	
	//	Save what we have right now
	if ((commandHistoryLoc == commandHistory.length)&&(inputWindow.value != commandHistory[commandHistoryLoc-1]))
		commandHistoryTemp = inputWindow.value;
	
	commandHistoryLoc--;
	if (commandHistoryLoc < 0)
		commandHistoryLoc = 0;
	
	if (commandHistory[commandHistoryLoc])
		inputWindow.value = commandHistory[commandHistoryLoc];
	else 
		inputWindow.value = "";
}

function checkForMacro()
{
	//	give up if there are no macros
	if (macros.size < 1)
		return false;
	
	//	inputWindow.value
	let wordArray = inputWindow.value.split(/\s/);
	let thisWord = wordArray[wordArray.length-1];
	
	for (let [key, value] of macros) 
	{
		if (key != thisWord)
			continue;
		
		if (typeof(value) != 'string')
		{
			console.log(typeof(value));
			continue;
		}
		
		let multiMatch = /{(.*?)}/g;
		let myArray;
		
		let tempValue = value;
		
		while (myArray = multiMatch.exec(value))
		{
			let randReplace = myArray[1].split("|");
			let randEntry = Math.floor(Math.random() * randReplace.length);
			
			//	replace myArray[0] with  value from myArray[1]
			tempValue = tempValue.replace(myArray[0], randReplace[randEntry]);
			debugLog(myArray[0] + " => " + randReplace[randEntry]);
		}
		
//		debugLog(key + " => " + tempValue);
		
		inputWindow.value = inputWindow.value.substring(0, inputWindow.value.length - thisWord.length) + tempValue;
	}
}

function sendInputWindow()
{
	sendMessage(inputWindow.value);
	//	Add some logging of previous commands.
	
	if ((inputWindow.value != commandHistory[commandHistory.length-1])&&(inputWindow.value.length > clientVars.get('minCharHistory')-1))
		commandHistory.push(inputWindow.value);
	
	if (commandHistory.length > clientVars.get('commandHistory'))
	{
		commandHistory.shift();
		
//		debugLog("Command history filled. Deleting oldest member.");
	}
	
	commandHistoryLoc = commandHistory.length;
	inputWindow.value = "";
	commandHistoryTemp = "";
}

//	Parsing server data

function parseMessage(text)
{
	//	Need to strip off backspace characters
	while (text.substring(0,1) == String.fromCharCode(8))
	{
		text = text.substring(1,text.length);
	}
	
	var tmp = document.createElement("DIV");
	tmp.innerHTML = text;
	var textOut = tmp.textContent || tmp.innerText || "";
	
	if (text.substring(0,7) === "SECRET ")
	{
		var secret = text.substring(7, text.length);
		var hash = hexMD5(cookieUser + cookiePass + secret);
		
		debugLog('Sending username...');
		sendMessage("USER " + cookieUser);
		sendMessage("SECRET " + secret);
		sendMessage("HASH " + hash);
		sendMessage("CHAR " + localCharacter);
		
		playSound('startUpSound');
		
		startedUp = true;
		
		//	Autorun
		chrome.storage.local.get(['autoRun'], function(result) 
		{
			//	We need to delay this a few seconds
			
			if (result.autoRun)
				debugLog(result.autoRun);
//				sendMessage(result.autoRun);
		});
	}
	else if (text.substring(0,30) === "Authentication error: BAD HASH")
	{
		reportMessage("Cannot log in. Redirecting...");
		debugLog('Sending \'badHash: true\'');
		chrome.runtime.sendMessage({badHash: true, loginURL: loginURL}, () => {return true;});
	}
	else if (text.substring(0,6) === "SKOOT ")
	{
		doSKOOT(text.substring(6, text.length));
	}
	else if (text.substring(0,7) === "MAPURL ")
	{
		setMap(text.substring(7, text.length));
	}
	else if (text.substring(0,5) === "<body")
	{
		updateTheme(text.substring(5, text.length-1));
	}
	else if (((text.substring(22,16) === "Just a reminder!") 
		|| (text.substring(22,12) === "You may now ")) &&(gameName == "Castle Marrach"))
	{
		highlightVote();
		reportMessage(text);
	}
	else if (text === "> ")
	{
		//	No need to print this, but it keeps the connection live
		// debugLog('KEEPALIVE');
	}
	else	// if (text != "")
	{
		text = text.trim();
		if ((lastMessage != "")||(text != ""))	//	Stop spamming empty lines!
			reportMessage(text);
		
		lastMessage = text;
	}
	
	checkAudioTriggers(text);
	
	if ((text.substring(0,2) == "A ") &&(gameName == "Castle Marrach"))
		checkCourierTriggers(text);
}

function DeleteOldestNode()
{
		var iconTray = document.querySelector("#icon_tray");
		var oldestNode = iconTray.children[0];
		
		debugLog (oldestNode);
		
		oldestNode.remove();
}

//	Logging

/*
	Changes between MV2 and MV3 mean moving 90% of the logging back into the client window. 
	Background process should only be used for rescuing logs now.
*/

function sendToLogger(myMessage)
{
	//	Disable logging for characters who don't want a log
	if (clientVars.get('logging') == 0)
		return;
	
	var timeNow = new Date ();
	
	if (logFileName == "")
	{
		logFileName= "Log-" + localCharacter + "-" + 
				timeNow.getFullYear() + "." + 
				("0" + (timeNow.getMonth()+1)).slice(-2) + "." + 
				("0" + timeNow.getDate()).slice(-2) + "-" + 
				("0" + timeNow.getHours()).slice(-2) + "." + 
				("0" + timeNow.getMinutes()).slice(-2) + "." + 
				clientVars.get('logFormat');
	}
	
	if (clientVars.get('logFormat') == 'txt')
	{
		var tmp = document.createElement("DIV");
		tmp.innerHTML = myMessage;
		var textOut = tmp.textContent || tmp.innerText || "";
	}
	else
	{
		textOut = myMessage + '<br>';
	}
	
	logFileString += textOut + '\n';
	
	chrome.storage.local.get(['logFiles'], function (results) {
		if (!results.logFiles)
			results.logFiles = {};
		
		if (!results.logFiles[localCharacter])
			results.logFiles[localCharacter] = {};
		
		results.logFiles[localCharacter].logName = logFileName;
		results.logFiles[localCharacter].logText = logFileString;
		
		chrome.storage.local.set({logFiles : results.logFiles}, () => {
			if (chrome.runtime.lastError)
			{
				//  The storage cannot hold it!
				SaveLogFile();
			}
		});
	});
	
//	//	Sends logging to background.js
//	chrome.runtime.sendMessage({'logMessage': textOut});
}

function SaveLogFile()
{
	//	Sends logging to background.js
	chrome.runtime.sendMessage({'saveLog': true}, () => {return true;});
	logFileName = "";
	logFileString = "";
}

function debugLog(message)
{
	if (isDevMode())
		console.log(message);
}

//	Audio

var soundMap = new Map();

function checkAudioTriggers(text)
{
   var tmp = document.createElement("DIV");
   tmp.innerHTML = text;
   var textOut = tmp.textContent || tmp.innerText || "";
	
	audioTriggers.forEach((value, key) => {
		if (value.exec(text))
		{
			if (!playSound(key))
				debugLog("Unfulfilled audio trigger: " + key);
		}
	});
}

function playSound(soundEffect)
{
	if ((clientVars.get("useSound") == 0)||(clientVars.get("soundVolume") == 0))
		return true;	//	If they like it quiet, we should just quit now...
	
	let tempSound;
	
	if (!soundMap.has(soundEffect))
	{
		if (audioTriggersFixed.has(soundEffect))
			tempSound = new Audio(audioTriggersFixed.get(soundEffect));
		else
			return false;
		
		soundMap.set(soundEffect, tempSound);
	}
	else
	{
		tempSound = soundMap.get(soundEffect);
	}
	
//	debugLog("PlaySound: " + soundEffect);
	tempSound.volume = clientVars.get("soundVolume") / 10;
	tempSound.play();
	
	return true;
}

// ---------------------------------------------------

init();