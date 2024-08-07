/*
 *	Merciful is an attempt to make a client for Castle Marrach which is 
 *	less Zealous.
 *	Credit goes to Zell (for Zealous) and the Zealotry team.
 *	The Orchil client is also an inspiration.
 */

'use strict';

	/*
	*	Let's split off the SKOOT commands becauce they are just so much fun...
	*	MAPURL can go here too.
	*/
	
	/*
	* scrape 'http://game.marrach.com/Marrach/Zealous/Right.sam' (since there seems no other way to get theme values)
		get element where id="elementTheme"
		use regex to steal the values of each <option> or maybe just drop it into my new <select> element unaltered
	*/

function isDevMode() {
    return !('update_url' in chrome.runtime.getManifest());
}

var myItems = new Map();
var roomItems = new Map();
var roomPeople = new Map();
var roomNPCs = new Map();
var roomExits = new Array();
var compassPoints = new Map();

var miniMap = document.getElementById("map_area");
var fullMapURL;

var popUp, mapPopUp, artPopUp;

var peopleList, npcList, objectList, invList, exitList, themeList;
var tmpNPC, tmpItem, tmpInv, tmpExit, tmpTheme;

function populateSkoot()
{
	
	//	People in room
	peopleList = document.createElement("div");
	peopleList.style.overflow = "auto";
	peopleList.style.flex = "1";
	peopleList.innerHTML = "<div class='strong UIText'>People</div><hr />";
	peopleList.className  = "UIText";
	
	//	NPCs in room
	npcList = document.createElement("select");
	npcList.className  = "right-col-list UIText";
	tmpNPC = document.createElement("option");
	tmpNPC.style.color = "#7f7f7f";
	tmpNPC.text = "NPCs...";
	tmpNPC.disabled = "disabled";
	tmpNPC.selected = "selected";
	npcList.appendChild(tmpNPC);
	npcList.addEventListener('change', sendSelection);
	
	//	All characters in room (HIDDEN - used for Zealotry mode)
	
	//	Do a... (HIDDEN - used for Zealotry mode)
	//		Bow / Curtsy / Exa / Exits / Inv / Look / Nod / Smile
	
	//	Help on... (HIDDEN - used for Zealotry mode)
	//		Next Tip / Using Help / Topic Overview / Communication / Movement / Object Usage / Perception
	
	//	Objects in room
	objectList = document.createElement("select");
	objectList.className  = "right-col-list UIText";
	tmpItem = document.createElement("option");
	tmpItem.style.color = "#7f7f7f";
	tmpItem.text = "Examine...";
	tmpItem.disabled = "disabled";
	tmpItem.selected = "selected";
	objectList.appendChild(tmpItem);
	objectList.addEventListener('change', sendSelection);
	
	//	Objects in inventory
	invList = document.createElement("select");
	invList.className  = "right-col-list UIText";
	tmpInv = document.createElement("option");
	tmpInv.style.color = "#7f7f7f";
	tmpInv.text = "Inventory...";
	tmpInv.disabled = "disabled";
	tmpInv.selected = "selected";
	invList.appendChild(tmpInv);
	invList.addEventListener('change', sendSelection);
	
	//	Exits
	exitList = document.createElement("select");
	exitList.className  = "right-col-list UIText";
	tmpExit = document.createElement("option");
	tmpExit.style.color = "#7f7f7f";
	tmpExit.text = "Exits...";
	tmpExit.disabled = "disabled";
	tmpExit.selected = "selected";
	exitList.appendChild(tmpExit);
	exitList.addEventListener('change', sendSelection);
	
	//	Populate the helperArea
	
	helperArea.appendChild(peopleList);
	helperArea.appendChild(npcList);
	helperArea.appendChild(objectList);
	helperArea.appendChild(invList);
	
	if (gameName == "Castle Marrach")
		helperArea.appendChild(exitList);
	
	//	Themes
	themeList = document.createElement("select");
	themeList.className  = "right-col-list UIText";
	tmpTheme = document.createElement("option");
	tmpTheme.style.color = "#7f7f7f";
	tmpTheme.text = "Themes...";
	themeList.appendChild(tmpTheme);
	themeList.addEventListener('change', sendSelection);
	
	compassPoints.set("N", document.getElementById("go_n"));
	compassPoints.set("NE", document.getElementById("go_ne"));
	compassPoints.set("E", document.getElementById("go_e"));
	compassPoints.set("SE", document.getElementById("go_se"));
	compassPoints.set("S", document.getElementById("go_s"));
	compassPoints.set("SW", document.getElementById("go_sw"));
	compassPoints.set("W", document.getElementById("go_w"));
	compassPoints.set("NW", document.getElementById("go_nw"));
	
	for (const myKey of compassPoints.keys()) {
		compassPoints.get(myKey).addEventListener("click", menuClick);
	}
	
	let myRequest;
	
	if (gameName == "Castle Marrach")
		myRequest = new Request('http://game.marrach.com/Marrach/Zealous/Right.sam');
//	else if (gameName == "Allegory of Empires")
//		myRequest = new Request('http://game.allegoryofempires.com/Theatre/Flash/index.sam');
	else if (gameName == "Multiverse Revelations")
		myRequest = new Request('http://game.multirev.net/Theatre/Flash/index.sam');
	else if (gameName == "The Lazarus Project")
		myRequest = new Request('http://game.lazarus-project.net/Theatre/Flash/index.sam');
	else
		return;
	
	fetch(myRequest)
		.then(response => response.text())
		.then(myResponse => {
			let regexTags = /<option value="">\(Select a theme \.\.\.\)<\/option>(?:\n|\r)(<option.+?<\/option>)(?:\n|\r)<\/select>/g;
			let myArray;
			
			if (myArray = regexTags.exec(myResponse))
			{
				themeList.innerHTML += myArray[1];
				debugLog("Themes loaded from Marrach.com");
				
				//	TODO: Save themes to Local in case we lose access
				//	~magical backup~ = myArray[1];
			}
			//	else
			//	{
				//	console.log('loading themes from backup');
				//	debugLog("Themes loaded from local back-up.");
				//	load from Local
				//	themeList.innerHTML += ~magical backup~;
			//	}
		});
	
	themeList.selectedIndex  = 0;
	
	helperArea.appendChild(themeList);
}

function doSKOOT(rawSKOOT)
{
//	debugLog("SKOOT " + rawSKOOT);
	
	if (rawSKOOT.length < 1)
		return;
	
	var skootID = Number(rawSKOOT.split(" ")[0]);
	var skootData = rawSKOOT.split(" ")[1];
	var skootText = rawSKOOT.substring (rawSKOOT.split(" ")[0].length + 1, rawSKOOT.length)
	var skootDetail;
	
	if (rawSKOOT.split(" ")[2])
	{
		skootDetail = rawSKOOT.substring (rawSKOOT.split(" ")[0].length + skootData.length+2, rawSKOOT.length);
	}
	
	switch (skootID)
	{
		case 2:
			//	Show some art - 286x450 window
			console.log("Show some art in a 286x450 box: " + skootText);
			
			//	correct URL
			skootText = skootText.replace('http://www.skotos.net/MarrachGame', 'http://images.marrach.com');
			
			artPopUp = window.open(skootText, 'Art', 'innerWidth=312, innerHeight=548, status=no, location=no, toolbar=no, menubar=no');
			if (!artPopUp)
				reportError('I just tried to open a new window, but I seem to have failed.');
			else 
				artPopUp.focus();
			break;
		
		case 3:
			//	This is not a valid skoot - seems to show the images server...
			break;
		
		case 4:
			//	update the main map
			fullMapURL = skootText;
//			console.log("The main map was updated: " + skootText);
			break;
		
		case 5:
			//	TODO: exits to light up on the minimap? 13x13
			
			var exitBitArray = Number(skootData);
			var bitMask = 1;
			
			for (const myKey of compassPoints.keys()) {
				if (exitBitArray & bitMask)
					compassPoints.get(myKey).style.display = "block";
				else
					compassPoints.get(myKey).style.display = "none";
				
				bitMask *= 2;
			}
			break;
		
		case 6:
			//	Open a new window - 800x600
			console.log("Show a page in a 800x600 box: " + skootText);
			chrome.windows.create(
				{
					focused : true,
					height : popupSize.h,
					type : "popup",	//	"popup" | "panel"
					url : skootText,
					width : popupSize.w
				},
				(window) => {
					if (!window){
						reportClientMessage('I just tried to open a new window, but I seem to have failed.', 'error');
						return;
					}

					console.log(window?.tabs[0].height, window?.tabs[0].width);

					let newHeight = window?.tabs[0].height + 2 * (popupSize.height - window?.tabs[0].height);
					let newWidth = window?.tabs[0].width + 2 * (popupSize.width - window?.tabs[0].width);

					chrome.windows.update(
						window?.id,
						{
							height: newHeight,
							width: newWidth,
						}
					  )
				}
			);
			break;
		
		case 7:
			//	Show the compass?
		case 8:
			//	Show the status bar?
		case 9:
			//	Show an ENV Icon?
		case 10:
			//	Show MV Map Links
			if (isDevMode)
				reportClientMessage("Unusual SKOOT: " + rawSKOOT, 'client');
			break;
		
		case 21:	//	A person is here
			addPerson(skootDetail, skootData);
			break;
		
		case 22:	//	A person left the room
			removePerson(skootData);
			break;
		
		case 31:	//	A thing in the room
			addToRoom(skootDetail, skootData);
			break;
		
		case 32:	//	A thing leaves the room
			takeFromRoom(skootData);
			break;
		
		case 41:	//	Indicates a thing I am holding / wearing
			addToMe(skootDetail, skootData);
			break;
		
		case 42:	//	I just lost a thing I am holding / wearing
			takeFromMe(skootData);
			break;
		
		case 51:	//	An exit
			addExit(skootDetail, skootData);
			break;
		
		case 70:	//	SkotosToolSourceView - 800x600
			popUp = window.open(skootText, 'Castle Marrach', 'width=800, height=600');
			if (!popUp)
				reportError('I just tried to open a new window, but I seem to have failed.');
			else 
				popUp.focus();
			break;
		
		case 80:
			//	CM:		Urgent message -> a popup! (suppress)
			//	AoE:	Stats for hunger / health / energy
			skoot80 (skootText);
			break;
		
		case 90:
			//	Weather in AoE
			skoot90 (skootText);
			break;
		
		//	Values that just say 'FOO' or 'dummy'
		case 20:	//	Prepare for a list of people
		case 30:	//	Prepare for a list of items in the room
		case 50:	//	Prepare for a list of exits
			if ((skootText != 'foo')&&(isDevMode))
				reportClientMessage("Junk SKOOT: " + rawSKOOT, 'client');
			break;
		case 61:
			if ((skootText != 'dummy')&&(isDevMode))
				reportClientMessage("Junk SKOOT: " + rawSKOOT, 'client');
			break;
		
		default:
			//	We fell out. Must be a skoot we don't care about.
			if (isDevMode)
				reportClientMessage("Unhandled SKOOT: " + rawSKOOT, 'error');
	}
}

function setMap(mapURL)
{
	//	Set the minimap to this URL
//	console.log("The minimap is now: " + mapURL);
//	miniMap.style.backgroundImage = "url('"+mapURL+"')";
	miniMap.style.backgroundImage = "url('"+mapURL.replace("www.skotos.net","images.marrach.com")+"')";
	
	//	Changed room
	roomNPCs.clear();
	roomItems.clear();
	roomPeople.clear();
	roomExits = new Array();
	peopleList.innerHTML = "<div class='strong UIText'>People</div><hr />";
	
	npcList.innerHTML = "";
	npcList.appendChild(tmpNPC);
	
	objectList.innerHTML = "";
	objectList.appendChild(tmpItem);
	
	exitList.innerHTML = "";
	exitList.appendChild(tmpExit);
}

//	A trio of helpers which use the SKOOT commands to track the contents of a room.
function addToMe(name, ID)
{
	name = name.split(" from")[0].split(" which")[0];
	
//	console.log("Adding an inventory object: " + name + " (ID: " + ID + ")");
	let tmpItem = document.createElement("option");
	tmpItem.id = "inv" + ID;
	tmpItem.value = "examine " + name;
	
	if (name.substring(0,3) == "An ")
		name = name.substring(3, name.length);
	else if (name.substring(0,2) == "A ")
		name = name.substring(2, name.length);
	else
		name = name.toLowerCase();
	
	tmpItem.text = name;
	
	if (!myItems.has(ID))
		invList.appendChild(tmpItem);

	myItems.set(ID, name);
}

function takeFromMe(ID)
{
	if (!myItems.has(ID))
		return;
	
	let invToRemove = document.getElementById("inv" + ID);
	
	if (invToRemove)
		invToRemove.remove();
	
	myItems.delete(ID);
}

function addToRoom(name, ID)
{
//	console.log("Adding an object: " + name + " (ID: " + ID + ")");
	let tmpItem = document.createElement("option");
	tmpItem.id = "room" + ID;
	tmpItem.value = "examine " + name;
	tmpItem.text = name;
	
	if (!roomItems.has(ID))
		objectList.appendChild(tmpItem);
	
	roomItems.set(ID, name);
}

function takeFromRoom(ID)
{
	if (!roomItems.has(ID))
		return;
	
	let invToRemove = document.getElementById("room" + ID);
	
	if (invToRemove)
		invToRemove.remove();
	
	myItems.delete(ID);
}

function addExit(name, exit)
{
//	console.log("Adding an exit: " + name);
	let tmpExit = document.createElement("option");
	tmpExit.id = name;
	if (exit != "NONE")
		tmpExit.value = "go " + exit;
	else if (name.substring(0,3) == "the")
		tmpExit.value = "go " + name.substring(4, name.length);
	else if (name.substring(0,2) == "an")
		tmpExit.value = "go " + name.substring(3, name.length);
	else if (name.substring(0,2) == "a ")
		tmpExit.value = "go " + name.substring(2, name.length);
	else
		tmpExit.value = "go " + name;
	tmpExit.text = name;
	
	if (!roomExits.includes(name))
	{
		exitList.appendChild(tmpExit);
		roomExits.push(name);
	}
}

function addPerson(name, ID)
{
	if ((clientVars.get('hideNpcNames'))&&((name.substring(0,2) == "A ") || (name.substring(0,2) == "a ") || (name.substring(0,3) == "An ") || (name.substring(0,3) == "an ") || (name.substring(0,5) == "<font")))
	{
		addNPC(name, ID)
		return;
	}
	
	let tmpPerson = document.createElement("div");
	tmpPerson.id = "player" + ID;
	tmpPerson.className = 'target-assist';
	
	tmpPerson.addEventListener('contextmenu', event => {
		
		//	TODO: Open a context menu!
		
		event.preventDefault();
	});
	
	tmpPerson.innerHTML = name;
	let nameSplit = name.split(" ");
	let sortName = nameSplit[nameSplit.length -1];
	
	//	Which node (player name) to put the new one BEFORE
	let nodePlacement = null;
	
	//	
	if ((peopleList.children.length > 3) && (clientVars.get('nameSort') == 'Alpha'))
	{
		for (let nodeNumber = 3; nodeNumber < peopleList.children.length; nodeNumber++) 
		{
			let nodeName = peopleList.children[nodeNumber].innerText;
			let nodeSplit = nodeName.split(" ");
			let sortNode = nodeSplit[nodeSplit.length -1];
			
			if (sortNode.localeCompare(sortName) > 0)
			{
				nodePlacement = peopleList.children[nodeNumber];
				break;
			}
		}
	}
	
	//	peopleList.children[2].innerText
	
	if (!roomPeople.has(ID))
		peopleList.insertBefore(tmpPerson, nodePlacement);
	
	roomPeople.set(ID, name);
}

function reSortPersonList()
{
	peopleList.innerHTML = "<div class='strong UIText'>People</div><hr />";
	
	let clone = new Map(roomPeople);
	roomPeople.clear();
	
	//	foreach on the peopleList variable
	clone.forEach((value, key)=>{
		addPerson(value, key)
	});
	//	addPerson(name, ID)
}

function addNPC(name, ID)
{
	if (name.substring(0,5) == "<font")
	{
		let regexTags = /<font color=#......>(.+?)<\/font>/g;
			let myArray;
			
			if (myArray = regexTags.exec(name))
				name = myArray[1];
	}
	
	let tmpNPC = document.createElement("option");
	tmpNPC.id = "NPC" + ID;
	tmpNPC.value = "look " + name;
	tmpNPC.text = name;
	
	if (!roomNPCs.has(ID))
	{
		npcList.appendChild(tmpNPC);
	}
	roomNPCs.set(ID, name);
}

function removePerson(ID)
{
	if (roomPeople.has(ID))
	{
		var divToRemove = document.getElementById("player" + ID);
		
		if (divToRemove)
			divToRemove.remove();
		
		roomPeople.delete(ID);
	}
	if (roomNPCs.has(ID))
	{
		let npcToRemove = document.getElementById("NPC" + ID);
	
		if (npcToRemove)
			npcToRemove.remove();
		
		roomNPCs.delete(ID);
	}
}

function sendSelection(event)
{
	sendMessage(event.target.value);
	
	console.log(event.target.value);
	
	event.target.selectedIndex  = 0;
	
	inputGiveFocus(event);
}

populateSkoot();