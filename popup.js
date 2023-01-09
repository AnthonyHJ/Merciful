/*
	If we know of any characters, let's list them here.
*/

'use strict';

var charWindows = new Map();

var pageNames = ['CM','AE','MR','EC','LP'];

chrome.storage.local.get(['charList'], function(charListImported) {
			
	let cookieUser = "";
	let charList = document.getElementById('CharList');
	
	/*
	 * TODO: cookieUserCM is a temp fix
	 */
	
	chrome.storage.local.get(['cookieUserCM', 'cookieUserAE', 'cookieUserMR', 'cookieUserEC', 'cookieUserLP'], function(result) {
		let loginOptions = false;
		
		charList.innerHTML = "";
		
		if (charListImported.charList != null)
		{
			//	console.log({charList: charListImported.charList});
		
			for (const [key, value] of Object.entries(charListImported.charList)) {
				for (const thisGame of pageNames) {
					if ((value.user == result['cookieUser'+thisGame])&&(value.game == thisGame))
					{
						CreateLink (key, thisGame);
						loginOptions = true;
					}
				}
			};
			
			//	console.log ("[Merciful->popup.js] Login?: "+loginOptions);
		}
				
				
		if (!loginOptions)
		{
			charList.innerHTML = "No known characters!";
			
			/*
			 * Should list the login pages
			 * 
			 * marrach
			 * allegory
			 * multirev
			 * eternal
			 * lazarus
			 */
			
			return;
		}
		
	});
	
	//	should get the ID for the game window if it exists!
	//	That or get the background script to do it
	
	window.addEventListener('click', HandleClick);
	window.addEventListener('auxclick', HandleClick);

	function CreateLink (charName, gameName)
	{
		let localCharacterCap = charName.substring(0,1).toUpperCase() + 
			charName.substring(1, charName.length).toLowerCase();
		
		let loginSpan = document.createElement("span");
			let loginLink = document.createElement("a");
			loginLink.href="#";
			loginLink.title=charName;
			loginLink.innerText=localCharacterCap + " (" + gameName + ")";
			loginLink.dataset.game = gameName;	//	TODO: should use actual game name
			loginSpan.appendChild(loginLink);
			
			//	Flag as online or offline
	//						loginSpan.classList += 'online';
	//						loginSpan.classList += 'offline';
		
		charList.appendChild(loginSpan);
		charList.appendChild(document.createElement("br"));
	}
});
	
function HandleClick (event) {
	if (typeof event != 'object')
		return;
	
	event.preventDefault();
	
	if (event.button > 1)
		return;
	
	var targ = event.target;
	
	if (!targ.title && targ.href)
	{
		chrome.tabs.create({"url": targ.href, "active": true});
		return;
	}
	
	if (targ.title == "options")
	{
		let optionsWindow = window.open("options.html", 'options', 'width=900, height=600');
		return;
	}
	
	//	if it's a link with a title
	if (targ.localName == "a")
	{
		chrome.runtime.sendMessage({'login': targ.title, 'game': targ.dataset.game});
	}
}