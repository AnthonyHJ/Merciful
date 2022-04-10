/*
 *	Merciful is an attempt to make a client for Skotos Chat Theatre games which is less Zealous.
 *	Credit goes to Zell (for Zealous) and the Zealotry team.
 *	The Orchil client is also an inspiration.
 */

'use strict';

var pageNames = {
	'CM':'marrach',
	'AE':'allegory',
	'MR':'multirev',
	'EC':'eternal',
	'LP':'lazarus',
	};

//	var gameTabs = new Map();	//	List of active tabs
//	var gameTabLog = new Map();	//	List of tabs which may have an active log-file

//	Logging
//	var logFileName = new Map();
//	var logFileString = new Map();
//	var logFileID = new Map();
//	var logFileStyle = new Map();

//	var fileExt = "txt";

//	var logFiles = new Object();

//	Recieves messages and passes them along
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.login)	//	login a character
		{
			chrome.storage.local.get(['gameTabs'], function(result) 
			{
				let gameTabs = {};
				
				if (result.gameTabs)
					gameTabs = result.gameTabs;
			
				//	Check for the character
				let targetTab = 0;
				
				for (const [key, value] of Object.entries(gameTabs)) {
					if (value == request.login)
						targetTab = key;
				}
				
				//	If there is no tab with that character...
				if (targetTab == 0)
				{
					chrome.tabs.create({"url": pageNames[request.game] + ".html?charName=" + request.login, "active": true}, function (tab) {
						console.log("Logging in " + request.login + " to " + request.game + ".");
						
						gameTabs[tab.id] = request.login;
						chrome.storage.local.set({gameTabs : gameTabs});
		
						chrome.storage.local.get(['gameTabs'], function(result) {
							let gameTabLog = {};
							if (result.gameTabLog)
								gameTabLog = result.gameTabLog;
							
							gameTabLog[tab.id] = request.login;
							chrome.storage.local.set({gameTabLog : gameTabLog});
						});
					});
				}
				else //	Else switch to that tab...
				{
					chrome.tabs.update(targetTab,{highlighted:true});
					
					//	Now opens the window
					chrome.tabs.get(targetTab,function (tab) {
						//	Should check the windowId - if it's 'minimized' then set it to 'normal'
						chrome.windows.get(tab.windowId, function (window) {
							if (window.state == 'minimized')
								chrome.windows.update(
									tab.windowId,
									{
										state: 'normal'
									}
								)
						})
					});
				}
			});
		}
		else if (request.logMessage != null)	//	We're sending a log
		{
			if (request.logBAK)
			{
				logFileName.set('recoverLogs-' + sender.tab.id, request.logFileName);
				logFileString.set('recoverLogs-' + sender.tab.id, request.logMessage);
				SaveLogFile('recoverLogs-' + sender.tab.id);
				return;
			}
			
			sendToLogger(sender.tab.id, request.logMessage);
		}
		else if (request.saveLog)	//	We're sending a log
		{
			SaveLogFile(sender.tab.id);
		}
		else if (request.charList)	//	login page trying to update character list
		{
			console.log(request.charList);
			
			//	console.log(request.charList);
			let charList = new Map();
			
			chrome.storage.local.get(['charList'], function(result) {
				let cookieUser = "";
				
				console.log(request.game);
				
				chrome.storage.local.get(['cookieUser'+request.game], function(resultC) {
					cookieUser = resultC['cookieUser'+request.game];
					
					console.log(cookieUser);
					console.log(charList);
						
					if (result.charList)
					{
						//	read in existing values
						for (const [key, value] of Object.entries(result.charList)) {
							if (value != cookieUser)
								charList.set(key,value);
							};
					}
					
					//	read in new values and override
					for (const key of request.charList) {
						console.log(key + "," + cookieUser);
						charList.set(key,cookieUser);
						charList.set(key,{'user': cookieUser, 'game': request.game});
						};
					
					let charListObj = Object.fromEntries(charList);
					chrome.storage.local.set({charList : charListObj});
					
					console.log(charListObj);
				});
			});
		}
		else if (request.badHash)	//	Authentication error: BAD HASH
		{
			console.log("Got a badHash");
			
			/*
			 * This should be handled in the originating window, surely...
			 */
			chrome.storage.local.get(['gameTabs'], function(result) {
				if (result.gameTabs)
				{
					delete result.gameTabs[sender.tab.id];
					chrome.storage.local.set({gameTabs : result.gameTabs});
				}
			});
	
			//	Remove the window from list of active play sessions
			chrome.storage.local.get(['gameTabs'], function(result) {
				if (result.gameTabs)
				{
					if (!result.gameTabs[tabId])
						return;
					
					delete result.gameTabs[tabId];
					chrome.storage.local.set({gameTabs : result.gameTabs});
				}
			});
			
			//	Open the login page in that window
			chrome.tabs.update(sender.tab.id,{"url": request.loginURL});
		}
		else if (request.clientVar == 'logFormat')	//	change to the file extension
		{
			console.log('updating log format from ' + fileExt + ' to ' + request.value);
			
			chrome.storage.local.get(['gameTabs'], function(result) {
				if (result.gameTabs)
				{
					for (const [key, value] of Object.entries(result.gameTabs)) {
						//	Save the old logs
						SaveLogFile(key);
					}
				}
			});
			
			fileExt = request.value;
		}
		else if (request.htmlStyles)
		{
			let styleSheet =	"body { " + request.htmlStyles.colours + request.htmlStyles.fonts + " }\n" +
								"a { " + request.htmlStyles.links + " }";
			
			logFileStyle.set(sender.tab.id, styleSheet);
		}
		else 	//	Pass a message to all active game windows (probably from options page)
		{
			chrome.storage.local.get(['gameTabs'], function(result) {
				if (result.gameTabs)
				{
					for (const [key, value] of Object.entries(result.gameTabs)) {
					  chrome.tabs.sendMessage(key, request);
					}
				}
			});
		}
	return true;
	});

//	Startup script
chrome.runtime.onStartup.addListener(function() {
	chrome.storage.local.remove(['gameTabs'], function() {
          console.log('Game tabs list unset');
        });
	
	chrome.storage.local.remove(['cookieUser', 'cookiePass'], function() {
          console.log('default cookies unset');
        });
	
	chrome.storage.local.remove(['cookieUserCM', 'cookiePassCM'], function() {
          console.log('Castle Marrach cookies unset');
        });
	
	chrome.storage.local.remove(['cookieUserAE', 'cookiePassAE'], function() {
          console.log('Allegory of Empires cookies unset');
        });
	
	chrome.storage.local.remove(['cookieUserMR', 'cookiePassMR'], function() {
          console.log('Multiverse Revelations cookies unset');
        });
	
	chrome.storage.local.remove(['cookieUserEC', 'cookiePassEC'], function() {
          console.log('Eternal City cookies unset');
        });
	
	chrome.storage.local.remove(['cookieUserLP', 'cookiePassLP'], function() {
          console.log('Lazarus Project cookies unset');
        });
	
	//	Log file extension
	chrome.storage.local.get(['logFormat'], function(result) 
	{
		if (result.logFormat)
			fileExt = result.logFormat;
	});
});

//	Update scrolls 
 chrome.webNavigation.onCompleted.addListener(function(details) {
	chrome.scripting.executeScript({target: {tabId: details.tabId},files: ["time.js"],}, 
		(result) => {chrome.scripting.executeScript({target: {tabId: details.tabId},files: ["insertMercyProp.js"],})
		})
	
}, {url: [{urlPrefix : 'http://game.marrach.com:8080/SAM/Prop/'}]});

//	Update login options
//	TODO - this should be one function, not three
 chrome.webNavigation.onCompleted.addListener(function(details) {
//	gameTabs.set(details.tabId, "");	//	if we are playing here, play here
	
	chrome.scripting.executeScript({
		target: {tabId: details.tabId},
		files: ["insertMercyCM.js"],
	})
}, {url: [{urlMatches : 'http://game.marrach.com/?$'}]});
 

 chrome.webNavigation.onCompleted.addListener(function(details) {
//	gameTabs.set(details.tabId, "");	//	if we are playing here, play here
	
	chrome.scripting.executeScript({
		target: {tabId: details.tabId},
		files: ["insertMercyAoE.js"],
	})
}, {url: [{urlMatches : 'http://game.allegoryofempires.com/SAM/Prop/Allegory:Theatre:Theatre/Index?$'}]});
 

 chrome.webNavigation.onCompleted.addListener(function(details) {
//	gameTabs.set(details.tabId, "");	//	if we are playing here, play here
	
	chrome.scripting.executeScript({
		target: {tabId: details.tabId},
		files: ["insertMercyMR.js"]
	})
}, {url: [{urlMatches : 'http://game.multirev.net/SAM/Prop/Lazarus:Web:Theatre/Index?$'}]});
 
 //	Grab login cookies
 chrome.webNavigation.onCompleted.addListener(function() {
	//	try to get the username and password cookies
	getLoginCookies('https://login.marrach.com','CM');
}, {url: [{urlMatches : 'https://login.marrach.com/overview.php'}]});
 
 chrome.webNavigation.onCompleted.addListener(function() {
	//	try to get the username and password cookies
	getLoginCookies('https://login.multirev.net/','MR');
}, {url: [{urlMatches : 'https://login.multirev.net/overview.php'}]});
 
 chrome.webNavigation.onCompleted.addListener(function() {
	//	try to get the username and password cookies
	getLoginCookies('https://login.allegoryofempires.com/','AE');
}, {url: [{urlMatches : 'https://login.allegoryofempires.com/overview.php'}]});
 
//	TODO: Other games
	//	Eternal City
	//	Lazarus Project
		
//	Need to check EVERY SINGLE TIME a window was shut?
//	Use script to send message to background?
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
	chrome.storage.local.get(['gameTabs'], function(result) {
		if (result.gameTabs)
		{
			if (!result.gameTabs[tabId])
				return;
			
			delete result.gameTabs[tabId];
			chrome.storage.local.set({gameTabs : result.gameTabs});
			
			SaveLogFile(tabId);
		}
	});
});

chrome.runtime.onInstalled.addListener(function(details) {
	if (details.reason == "update")
	{
		if (details.previousVersion == chrome.runtime.getManifest().version)
			return;
	
		chrome.tabs.create({"url": "ChangeLog.html", "active": true}, function (tab) {console.log(tab);});
		
		//	TODO: Fix your local variables
		if ((parseFloat(details.previousVersion.slice(2)) < 4) && (details.previousVersion[0] == '0'))
		{
			//	update your charlist (just delete it)
			chrome.storage.local.remove('charList');
		
			chrome.storage.local.get(null, function(result) 
			{
				for (const [key, value] of Object.entries(result)) {
					//	update your currentDate-* values
					if (key.substring(0, 12) == 'currentDate-')
					{
						chrome.storage.local.remove([key]);
						
						let newVal = new Object();
						newVal[key.substring(0, 12) + "CM-" + key.substring(12)] = value;
						
						console.log(newVal);
						chrome.storage.local.set(newVal);
					}
				
					//	update your clientvars (move the CM specific ones over)
					if (key == "clientVars")
					{
						let newVal = new Object();
						newVal.clientVars = new Object();
						newVal.clientVars.game = new Object();
						newVal.clientVars.game.CM = new Object();
						
						newVal.clientVars.game.CM.useCourierSound = value["useCourierSound"];
						newVal.clientVars.game.CM.scrollHeader = value["scrollHeader"];
						delete value.useCourierSound;
						delete value.scrollHeader;
						delete value.logging;
						
						newVal.clientVars.core = value;
						
						//	Save the 'fixed' version.
						console.log(newVal);
						chrome.storage.local.set(newVal);
					}
				
					//	update your macros (they are now CM macros)
					if (key == "macros")
					{
						let newVal = new Object();
						newVal.macros = new Object();
						newVal.macros.game = new Object();
						newVal.macros.game.CM = new Object();
						newVal.macros.game.CM.core = result;
						
						//	Save the 'fixed' version.
						console.log(newVal);
						chrome.storage.local.set(newVal);
					}
				
				}
			})
		}
		else if ((parseFloat(details.previousVersion.slice(2)) < 4.2) && (details.previousVersion[0] == '0'))
		{
			chrome.storage.local.get("macros", function(result) 
			{
				//	update your macros (they are now CM macros)
				let newVal = new Object();
				newVal.macros = new Object();
				newVal.macros.game = new Object();
				newVal.macros.game.CM = new Object();
				newVal.macros.game.CM.core = result.macros.game.CM;
				
				//	Save the 'fixed' version.
				console.log(newVal);
				chrome.storage.local.set(newVal);
			})
		}
	}
});

//	Skotos games store your session login as cookies, so we... 'borrow' them to let us log in more easily.
function getLoginCookies(URL,gameCode)
{
	chrome.cookies.getAll({'url':URL}, function(cookies){
		console.log(cookies);
		
		let cookieUser = [];
		let cookiePass = [];

		//	cycle through the cookies to get 'user' and 'pass'
		for (const thisCookie of cookies) {
			if(thisCookie.name == 'user')
				cookieUser[gameCode] = thisCookie.value;
			if(thisCookie.name == 'pass')
				cookiePass[gameCode] = thisCookie.value;
		}
			
		chrome.storage.local.set({['cookieUser' + gameCode]: cookieUser[gameCode]}, function() {
		  console.log('cookieUser[\'' + gameCode + '\'] is set to ' + cookieUser[gameCode]);
		});
		chrome.storage.local.set({['cookiePass' + gameCode]: cookiePass[gameCode]}, function() {
		  console.log('cookiePass[\'' + gameCode + '\'] is set to ' + cookiePass[gameCode]);
		});
	});
}

function sendToLogger(windowID, myMessage)
{
	/*
	*	Need to use the more complex code from insertMercyProp.js so it uses in-game time
	*/
//	if (localCharacter == 'null')
//		return;
	
	var timeNow = new Date ();
	
	if ((!logFileName.has(windowID))||(!logFileString.has(windowID)))
	{
		//	Create a new logFileName
		logFileName.set(windowID, "Log-" + gameTabLog.get(windowID) + "-" + 
			timeNow.getFullYear() + "." + 
			("0" + (timeNow.getMonth()+1)).slice(-2) + "." + 
			("0" + timeNow.getDate()).slice(-2) + "-" + 
			("0" + timeNow.getHours()).slice(-2) + "." + 
			("0" + timeNow.getMinutes()).slice(-2) + "." + 
			fileExt);
		
		logFileString.set(windowID, '');
		
		if (true)
		{
			console.log("The log is now called: " + logFileName.get(windowID));
			console.log("Local character is " + gameTabLog.get(windowID));
		}
		
		if (!logFiles[gameTabLog.get(windowID)])
		{
			logFiles[gameTabLog.get(windowID)] = new Object();			
		}
		
		logFiles[gameTabLog.get(windowID)].logName = logFileName.get(windowID);
		
		chrome.storage.local.set({logFiles : logFiles}, function() {});

	}
	
	if ((myMessage == "") && (fileExt == "txt"))
		return false;
	
	let currentText = logFileString.get(windowID);
	logFileString.set(windowID, currentText + myMessage + "\n");
	logFiles[gameTabLog.get(windowID)].logText = logFileString.get(windowID);
	
	chrome.storage.local.set({logFiles : logFiles}, function() {
          if (chrome.runtime.lastError)
		  {
			  //  The storage cannot hold it!
			  SaveLogFile(windowID);
		  }
        });
}

function SaveLogFile(windowID)
{	
	if (logFileID.has(windowID))
	{
		console.log("Download already in progress!");
		return;
	}
	
	if ((!logFileName.has(windowID))||(!logFileString.has(windowID)))
	{
		if (!logFileString.has(windowID))
			console.log("Log is empty.");
		return;
	}
	
	logFileID.set(windowID, -1);
	
	//	save logFileString to logFileName;
	console.log("Saving: " + logFileName.get(windowID));
	
	let logFileOutput = logFileString.get(windowID);
	
	if (logFileName.get(windowID).substr(-4) == 'html')
	{
		logFileOutput = "<html><body>" + logFileOutput + "<style>" + logFileStyle.get(windowID) + "</style></body></html>";
	}
	
	let file;
	
	if (logFileName.get(windowID).substr(-4) == 'html')
		file = 'data:text/html;base64,'+btoa(logFileOutput);
//		file = new Blob([logFileOutput], {type: 'text/html'});
	else
		file = 'data:text/plain;base64,'+btoa(logFileOutput);
//		file = new Blob([logFileOutput], {type: 'text/plain'});

	chrome.downloads.download({ url : file, filename : logFileName.get(windowID), conflictAction : "uniquify" }, (newID) => { 
		logFileID.set(windowID, newID); 
//		console.log ('Watching download with ID: ' + logFileID.get(windowID));
	});
}

chrome.downloads.onChanged.addListener(DownloadComplete);

function DownloadComplete(downloadDelta) 
{	
	let windowID;
	
	//	Find the windowID
	logFileID.forEach((value, key, map) =>{
		if (value == downloadDelta.id)
			windowID = key;
	});
	
	if ((!windowID) || (downloadDelta.state == null))
		return;
	
	if (downloadDelta.state.current == "in_progress")
		return;
	
	if (downloadDelta.state.current == "interrupted")
	{
		//	Something stopped the download!
		logFileID.delete(windowID);
		//	reportClientMessage('Your attempt to download the log has been cancelled.', 'error');
		//	TODO: We need to be able to send an error back...
		return;
	}
	
//	console.log("File with ID : " + downloadDelta.id + " has completed.");
	
	//	Once the file finishes downloading, reset the values
//	console.log("gameTabLog : " + gameTabLog.get(windowID));
	
	//	Reset the log
	logFileName.delete(windowID);
	logFileString.delete(windowID);
	logFileID.delete(windowID);
	
//	console.log(windowID);
//	console.log(gameTabLog.get(windowID));
	
	delete logFiles[gameTabLog.get(windowID)];
	
	chrome.storage.local.set({logFiles : logFiles});
}

//	TODO: Check for rescued log data and save it to disk.
chrome.storage.local.get('logFiles', function (items) {
	if (items['logFiles'])
	{
		logFiles = items.logFiles;
	
		for (const logData in items.logFiles) {
			let filenameMatch = new Object();
			filenameMatch.filenameRegex = items.logFiles[logData].logName;
			
			chrome.downloads.search(filenameMatch, function(result)
			{
				if (result.length > 0)
				{
					if (result[0].state == 'complete')
					{
						//	Back to loop
						return;
					}
				}
				
				let windowID = 'recoverLogs-' + logData;
			
				gameTabLog.set(windowID, logData);
				logFileName.set(windowID, items.logFiles[logData].logName);
				
				logFileString.set(windowID, items.logFiles[logData].logText);
				SaveLogFile(windowID);
			})
		}
		//	remove logFiles;
		chrome.storage.local.set({'logFiles': null});
	}
});
