
'use strict';

var myBody;
var myTables;

function insertMercy()
{
	// The ID of the extension we want to talk to.
	var editorExtensionId = chrome.runtime.id;

	if (myBody)
		return;

	myBody = document.getElementsByTagName("body");
	myTables = document.getElementsByTagName("a");
	
	let charList = new Array();	//	list of characters
	
	for (let thisTable of myTables) {
		if (thisTable.innerText != "Orchil")
			continue;
		
		console.log(thisTable.innerHTML);
		
		let searchRegEx = /\.htm\?charName=(\w*)/g;
		let newChar, personArray;
		
		if (personArray = searchRegEx.exec(thisTable.href))
			newChar = personArray[1];
		else
			continue;
		
		console.log(newChar);
		
		charList.push(newChar.toLowerCase());
		let newCharFU = newChar[0].toUpperCase() + newChar.slice(1,newChar.length);
		
			//	Create a new a element
			let loginLink = document.createElement("span");
			
			//	Give it some values
			loginLink.title = newChar.toLowerCase();
			loginLink.innerText = "Merciful";
			loginLink.dataset.game = 'MR';
			loginLink.style.padding = '5px';
			loginLink.style.marginLeft = '5px';
			loginLink.style.marginRight = '5px';
			loginLink.style.cursor = 'pointer';
			loginLink.style.backgroundColor = '#700';
			loginLink.style.color = '#fff';
			
			//	Insert it into the text
			//	cells[0].appendChild(loginLink);
			thisTable.parentNode.insertBefore(loginLink, thisTable)
	}

	window.addEventListener('click', HandleClick);
	window.addEventListener('auxclick', HandleClick);
		
	function HandleClick(event) 
	{
		var targ = event.target;
		
		//	if it's a link with a title
		if ((targ.localName == "span") && (targ.title))
		{
			if (event.button > 1)
				return;
			
			event.preventDefault();
			console.log("Logging in: " + targ.title);
			chrome.runtime.sendMessage(editorExtensionId, {'login': targ.title, 'game': targ.dataset.game});
		}
	};
	
	console.log(charList);
	
	chrome.runtime.sendMessage(editorExtensionId, {'charList': charList, 'game': 'MR'});
}
	
insertMercy();