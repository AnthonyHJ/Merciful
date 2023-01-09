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

//	Recieves messages and passes them along
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.registerTab){	//	login a character
			chrome.storage.session.get(['gameTabs'], function(tabResult) 
			{
				chrome.storage.local.get(['gameTabLog'], function(logResult) 
				{
					console.log("[Merciful] Registering " + request.login + " to tab id: " + sender.tab.id);
					let gameTabs = {};
					let gameTabLog = {};
					
					if (tabResult.gameTabs)
						gameTabs = tabResult.gameTabs;
				
					if (logResult.gameTabLog)
						gameTabLog = logResult.gameTabLog;
				
					if (!gameTabs[sender.tab.id])
					{
						gameTabs[sender.tab.id] = request.login;
						gameTabLog[sender.tab.id] = request.login;
						chrome.storage.session.set({gameTabs : gameTabs});
						chrome.storage.local.set({gameTabLog : gameTabLog});
					}
				});
			});
		}
		else if (request.login)	//	login a character
		{
			chrome.storage.session.get(['gameTabs'], function(result) 
			{
				let gameTabs = {};
				
				if (result.gameTabs)
					gameTabs = result.gameTabs;
			
				//	Check for the character
				let targetTab = 0;
				
				for (const [key, value] of Object.entries(gameTabs)) {
					if (value == request.login)
						targetTab = parseInt (key);
				}
				
				//	If there is a tab with that character...
				if (targetTab != 0)
				{
					console.log("[Merciful] Trying to get tab: " + targetTab);

					//	Now opens the window
					chrome.tabs.get(targetTab,function (tab) {
						if (chrome.runtime.lastError)
						{
							console.warn(chrome.runtime.lastError);
							SaveLogFile(targetTab);
							delete gameTabs[targetTab]
							return;
						}

						chrome.tabs.update(targetTab,{highlighted:true});
					
						if(tab){
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
						}
					});
				}

				chrome.tabs.create({"url": pageNames[request.game] + ".html?charName=" + request.login, "active": true}, function (tab) {
					console.log("[Merciful] Logging in " + request.login + " to " + request.game + ".");
					
					gameTabs[tab.id] = request.login;
					chrome.storage.session.set({gameTabs : gameTabs});
	
					chrome.storage.local.get(['gameTabLog'], function(result) {
						let gameTabLog = {};
						if (result.gameTabLog)
							gameTabLog = result.gameTabLog;
						
						gameTabLog[tab.id] = request.login;
						chrome.storage.local.set({gameTabLog : gameTabLog});
					});
				});
			});
		}
		else if (request.saveLog)	//	We're sending a log
		{
			SaveLogFile(sender.tab.id);
		}
		else if (request.charList)	//	login page trying to update character list
		{
			console.log("[Merciful] Character List["+request.game+"]: "+request.charList.join(", "));
			
			let charList = new Map();
			
			chrome.storage.local.get(['charList'], function(result) {
				let cookieUser = "";
				
				chrome.storage.session.get(['cookieUser'+request.game], function(resultC) {
					cookieUser = resultC['cookieUser'+request.game];
					
					if (result.charList)
					{
						//	read in existing values
						for (const [key, value] of Object.entries(result.charList)) {
							if ((value.user != cookieUser) || (value.game != request.game))
								charList.set(key,value);
						};
					}
					
					//	read in new values and override
					for (const key of request.charList) {
						charList.set(key,cookieUser);
						charList.set(key,{'user': cookieUser, 'game': request.game});
						};
					
					let charListObj = Object.fromEntries(charList);
					chrome.storage.local.set({charList : charListObj});
				});
			});
		}
		else if (request.badHash)	//	Authentication error: BAD HASH
		{
			console.log("[Merciful] Got a badHash; can't log in");
			
			/*
			 * This should be handled in the originating window, surely...
			 */
			chrome.storage.session.get(['gameTabs'], function(result) {
				if (result.gameTabs)
				{
					delete result.gameTabs[sender.tab.id];
					chrome.storage.session.set({gameTabs : result.gameTabs});
				}
			});
	
			//	Remove the window from list of active play sessions
			chrome.storage.session.get(['gameTabs'], function(result) {
				if (result.gameTabs)
				{
					if (result.gameTabs[tabId])
					{
						delete result.gameTabs[tabId];
						chrome.storage.session.set({gameTabs : result.gameTabs});	
					}
				}
			});
			
			//	Open the login page in that window
			chrome.tabs.update(sender.tab.id,{"url": request.loginURL});
		}
		else if (request.clientVar == 'logFormat')	//	change to the file extension
		{
			console.log('[Merciful] updating log format to ' + request.value);
			
			chrome.storage.session.get(['gameTabs'], function(result) {
				if (result.gameTabs)
				{
					for (const [key, value] of Object.entries(result.gameTabs)) {
						//	Save the old logs
						SaveLogFile(key);
					}
				}
			});
		}
		else if (request.htmlStyles)
		{
			let styleSheet =	"body { " + request.htmlStyles.colours + request.htmlStyles.fonts + " }\n" +
								"a { " + request.htmlStyles.links + " }";
			
			chrome.storage.session.get(['logFileStyle'], function(result) {
				if (!result.logFileStyle)
					result.logFileStyle = {};
				
				result.logFileStyle[sender.tab.id] = styleSheet
				chrome.storage.session.set({logFileStyle : result.logFileStyle});	
			});
		}
		else 	//	Pass a message to all active game windows (probably from options page)
		{
			chrome.storage.session.get(['gameTabs'], function(result) {
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
	//	TODO: Check for rescued log data and save it to disk.
	chrome.storage.local.get(['gameTabLog','logFiles'], function (items) {
		if (items['logFiles'])
		{
			if (items['logFiles'] == null)
				return;
			
			console.log("[Merciful] Recovering logs.");
			console.log(items.logFiles);
			
			if (!items['gameTabLog'])
				items['gameTabLog'] = {};
			
			for (const logData in items.logFiles) {
				let filenameMatch = new Object();
				filenameMatch.filenameRegex = items.logFiles[logData].logName;
				
				console.log("[Merciful] Log found for: " + logData);
				
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
				
					console.log (items);
				
					items.gameTabLog[windowID] = logData;
					
					chrome.storage.local.set({'gameTabLog': items.gameTabLog});
					
					SaveLogFile(windowID);
				})
			}
		} else {
			chrome.storage.local.remove(['gameTabLog',  'logFileID'])
				.then(()=>{console.log('[Merciful] Game session data reset.');});
		}
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
	
	console.log("[Merciful] Adding Merciful login links.");
	
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
	chrome.storage.session.get(['gameTabs'], function(result) {
		if (result.gameTabs)
		{
			if (!result.gameTabs[tabId])
				return;
			
			delete result.gameTabs[tabId];
			chrome.storage.session.set({gameTabs : result.gameTabs});

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
		else if ((parseFloat(details.previousVersion.slice(2)) < 5) && (details.previousVersion[0] == '0'))
		{
			//	Remove the variables now moved to session.
			chrome.storage.local.remove(['gameTabs', 'logFileStyle', 'cookieUser', 'cookiePass', 'cookieUserCM', 'cookiePassCM', 'cookieUserAE', 'cookiePassAE', 'cookieUserMR', 'cookiePassMR', 'cookieUserEC', 'cookiePassEC', 'cookieUserLP', 'cookiePassLP'])
				.then(a=>{console.log("Session variables removed from local storage.")});
		}
	}
});

//	Skotos games store your session login as cookies, so we... 'borrow' them to let us log in more easily.
function getLoginCookies(URL,gameCode)
{
	chrome.cookies.getAll({'url':URL}, function(cookies){
		let cookieUser = [];
		let cookiePass = [];

		//	cycle through the cookies to get 'user' and 'pass'
		for (const thisCookie of cookies) {
			if(thisCookie.name == 'user')
				cookieUser[gameCode] = thisCookie.value;
			if(thisCookie.name == 'pass')
				cookiePass[gameCode] = thisCookie.value;
		}
			
		chrome.storage.session.set({['cookieUser' + gameCode]: cookieUser[gameCode]}, function() {
		});
		chrome.storage.session.set({['cookiePass' + gameCode]: cookiePass[gameCode]}, function() {
		});
	});
}

function SaveLogFile(windowID)
{	
	chrome.storage.local.get(['gameTabLog','logFileID','logFiles'], function (items) {
		if (!items.gameTabLog)
		{
			console.error("[Merciful] Cannot find gameTabLog!");
			return;
		}
		
		if (!items.gameTabLog[windowID])
		{
			console.error("[Merciful] Cannot find a name for this character! WindowID: " + windowID);
			console.error(items.gameTabLog);
			return;
		}
		
		if (!items.logFiles[items.gameTabLog[windowID]])
		{
			console.error("[Merciful] Cannot find a log for this character! Name: " + items.gameTabLog[windowID]);
			return;
		}
		
		if (!items.logFileID)
			items.logFileID = {};
		
		if (items.logFileID[windowID])
		{
			console.log("[Merciful] Download already in progress!");
			return;
		}
		
		items.logFileID[windowID] = -1; 
		chrome.storage.local.set({logFileID : items.logFileID});
		
		//	save log to file
		console.log("[Merciful] Saving: " + items.logFiles[items.gameTabLog[windowID]].logName);
		
		let logFileOutput = items.logFiles[items.gameTabLog[windowID]].logText;
		
		if (items.logFiles[items.gameTabLog[windowID]].logName.substr(-4) == 'html')
		{
			chrome.storage.session.get(['logFileStyle'], function(result) {
				if (result.logFileStyle)
				{
					if (result.logFileStyle[windowID])
						logFileOutput = "<html><body>" + logFileOutput + "<style>" + result.logFileStyle[windowID] + "</style></body></html>";
					else
						logFileOutput = "<html><body>" + logFileOutput + "</body></html>";
				}
				else
					logFileOutput = "<html><body>" + logFileOutput + "</body></html>";
				
				let file = 'data:text/html,'+logFileOutput;
				chrome.downloads.download({ url : file, filename : items.logFiles[items.gameTabLog[windowID]].logName, conflictAction : "uniquify" }, (newID) => { 
					items.logFileID[windowID] = newID; 
					chrome.storage.local.set({logFileID : items.logFileID});
				});
			});
		}
		else
		{
			let file = 'data:text/plain,'+logFileOutput;

			chrome.downloads.download({ url : file, filename : items.logFiles[items.gameTabLog[windowID]].logName, conflictAction : "uniquify" }, (newID) => { 
				items.logFileID[windowID] = newID; 
				chrome.storage.local.set({logFileID : items.logFileID});
			});
		}

		delete items.gameTabLog[windowID];
		chrome.storage.local.set({gameTabLog : items.gameTabLog});
	});
}

chrome.downloads.onChanged.addListener(DownloadComplete);

function DownloadComplete(downloadDelta) 
{	
	chrome.storage.local.get(['logFileID','logFiles','gameTabLog'], function (items) {
		let windowID;
		
		//	Find the windowID
		if (items.logFileID)
		{
			for (const [key, value] of Object.entries(items.logFileID)) {
				if (value == downloadDelta.id)
					windowID = key;
			}	
		}
		
		if ((!windowID) || (downloadDelta.state == null))
			return;
		
		if (downloadDelta.state.current == "in_progress")
			return;
		
		if (downloadDelta.state.current == "interrupted")
		{
			//	Something stopped the download!
			delete items.logFileID[windowID];
			chrome.storage.local.set({logFileID : items.logFileID});
			//	reportClientMessage('Your attempt to download the log has been cancelled.', 'error');
			//	TODO: We need to be able to send an error back...
			return;
		}
		
		//	Once the file finishes downloading, reset the values
		
		//	Reset the log
		delete items.logFileID[windowID];
		delete items.logFiles[items.gameTabLog[windowID]];
		
		chrome.storage.local.set({logFileID : items.logFileID});
		chrome.storage.local.set({logFiles : items.logFiles});
	});
}
