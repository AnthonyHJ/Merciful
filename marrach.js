'use strict';

var gamePrefix = 'CM';
var gameName = "Castle Marrach";
var loginURL = 'https://login.marrach.com';
var fullMapURL = "https://www.skotos.net/MarrachGame/images/bigmaps/OB%20Second.jpg";
var runOnStart = false;
var forceLightMode = false;

var mapSize = {width: 468, height: 468};
var popupSize = {width: 800, height: 600};
var artSize = {width: 286, height: 450};	//	Size used by CM

var profile = {
		"method":   "websocket",
		"protocol": "ws",
	    "server":   "game.marrach.com",
		"port":      9080,
		"woe_port":  9084,
		"path":     "/marrach",
	};

/**
 * Handles commands from the player to the server
 * @param {String} clientCommand Command from the server
 * @returns {Boolean} True if the command is not sent to the server
 */
function checkClientCommands(clientCommand){
	if (clientCommand == "@healer")
	{
		//	healerWindow("Bob", "Novice", 5)
		//	
		//	This should never be sent to the server.
		return true;
	}

	return false;
}

/**
 * Handles commands from the server to the player
 * @param {String} serverCommand Raw text from the server
 * @returns {Boolean} Hide return from the player?
 */
function checkServerCommands(serverCommand){
	if (serverCommand.substring(0,2) == "A "){
		checkCourierTriggers(serverCommand);
	}
	
	return false;
}
	
function healerWindow(patient, level, time)
{
	//	Heal timer (experimental)
	let healTimer = document.createElement("div");
	healTimer.style.zIndex = "99";
	healTimer.style.position = "absolute";
	healTimer.style.width = "200px";
	healTimer.style.height = "100px";
	healTimer.style.top = "10px";
	healTimer.style.right = "156px";
	healTimer.style.border = "3px solid " + textStyles.get("color");
	healTimer.style.color = textStyles.get("color");
	healTimer.style.backgroundColor = textStyles.get("background-color");
	
	healTimer.innerHTML = "Healing: " + patient + "<br /><br />";
	healTimer.innerHTML += "Time remaining: " + time + " minutes";
	
	mainTXT.appendChild(healTimer);
}

function checkCourierTriggers (text)
{
	if (text.substring(0,2) != "A ")
		return;
	
	let regexTags = /^A(?:.+?) courier gives (?:you (.+?)|(.+?) to you)\.$/;
	
	let myArray;
	
	if (myArray = regexTags.exec(text))
	{
		//	A courier gave you something.
		debugLog("You were given: " + myArray[1]);
		
		if (clientVars.get("useCourierSound") == 1)
			playSound('courierSound');
		
		//	Flash the icon?
		var iconTray = document.querySelector("#icon_tray");
		var template = document.querySelector('#notificationIcon');
		
		var notificationIcon = template.content.cloneNode(true);
		iconTray.appendChild(notificationIcon);
		
		window.setTimeout(DeleteOldestNode, 10*1000);
	}
}

function skoot80 (skootText)
{
	if (isDevMode)
		reportClientMessage(skootText);
}

function skoot90 (skootText)
{
	if (isDevMode)
		reportClientMessage(skootText);
}

function RunOnStart()
{
}

var audioTriggersFixed = new Map([
  ['startUpSound', 'sound/startup.wav'],
  ['notifySound', 'sound/notify.wav'],
  ['shutDownSound', 'sound/shutdown.wav'],
//['mistSound', 'sound/sinister.wav'],
//  ['ghastSound', 'sound/sinister.wav'],
  ['badSound', 'sound/sinister.wav'],
  ['courierSound', 'sound/notify.wav'],
  ['healersSound', 'sound/silverwhistle.wav'],
  ['healersSound2', 'sound/silver-trill.wav'],
  ['healersSound3', 'sound/silver-trill.wav'],
  ['silverBellSound', 'sound/silverbell.wav'],
  ['watchSound', 'sound/duck-blow.wav'],
  ['watchSound2', 'sound/duck-toot.wav'],
]);

var audioTriggers = new Map([
//	['mistSound', /^A frigid chill runs throughout your core as the icy white mists coarse over you./],
//	['ghastSound', /^((?!&quot;).)*(ghast).((?!&quot;).)*$/],
	['badSound', /^[^\"]+?You encounter monsters!/],
	['healersSound', /^You suddenly hear an urgent harmonious note in the distance/],
	['healersSound2', /^You hear a short light harmonious note in the distance/],
	['healersSound3', /^You hear a short thin harmonious note in the distance/],
    ['silverBellSound', /^[^\"]+? rings an enameled silver bell from .+? in need of assistance/],
	['watchSound', /^In the distance, you hear the desperate \"QUACK!\" of a duckcall/],
	['watchSound2', /^In the distance, you hear the mild \"Toot!\" of a duckcall/]
]);

var titlesFilter = {
	"Armswoman" : "Arms.",
	"Armsman" : "Arms.",
	"Captain" : "Cpt.",
	"Constable" : "W.C.",
	"Corporal " : "Cpl.",
	"Deputy" : "Dep.",
	"Doctor" : "Dr.",
	"Lieutenant" : "Lt.",
	"Major" : "Mjr.",
	"Priestess" : "Rev.",
	"Private" : "Pvt.",
	"Seneschal" : "Sen.",
	"Serjeant" : "Sjt.",
	"Watchwoman" : "W.W.",
	"Watchman" : "W.W.",
	"Yeoman" : "Yeo.",
	"StoryPlotter" : "SP",
	"StoryHost" : "SH",
	"StoryCoder" : "SC",
};