
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
	myTables = document.getElementsByTagName("table")[0].getElementsByTagName("table");

	let charList = new Array();	//	list of characters
	
	for (let thisTable of myTables) {
		let rows = thisTable.getElementsByTagName("tr");
		let newChar, personArray;
		
		if(rows.length < 3)
			continue;
		
		for (let row of rows) {
			let cells = row.getElementsByTagName("td");
			
			let searchRegEx = /\.htm\?charName=(\w*)/g;
			
			if (personArray = searchRegEx.exec(cells[0].innerHTML))
				newChar = personArray[1];
			else
				continue;
			
			charList.push(newChar.toLowerCase());
			
			let newCharFU = newChar[0].toUpperCase() + newChar.slice(1,newChar.length);
			
			cells[0].innerHTML += "<br /><font color = '#ffffff'>" + newCharFU + "</font> [ ";
			
			//	Create a new a element
			let loginLink = document.createElement("a");
			
			//	Give it some values
			loginLink.href = "#";
			loginLink.title = newChar.toLowerCase();
			loginLink.innerText = "Merciful";
			loginLink.dataset.game = 'CM';
			
			//	Insert it into the text
			cells[0].appendChild(loginLink);
			
			cells[0].innerHTML += " ]";
			
			console.log(newChar);
		}
	}

	window.addEventListener('click', HandleClick);
	window.addEventListener('auxclick', HandleClick);
		
	function HandleClick(event) 
	{
		var targ = event.target;
		
		//	if it's a link with a title
		if ((targ.localName == "a") && (targ.title))
		{
			if (event.button > 1)
				return;
			
			event.preventDefault();
			console.log("Logging in: " + targ.title);
			chrome.runtime.sendMessage(editorExtensionId, {'login': targ.title, 'game': targ.dataset.game});
		}
	};
	
	console.log(charList);
	
	chrome.runtime.sendMessage(editorExtensionId, {'charList': charList, 'game': 'CM'});
}
	
insertMercy();