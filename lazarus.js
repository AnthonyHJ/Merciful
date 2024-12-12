'use strict';

var gamePrefix = 'LP';
var gameName = "The Lazarus Project";
var loginURL = 'https://login.lazarus-project.net';
var fullMapURL = "https://images.lazarus-project.net/bigmaps/ColonyBigmapDisplay.jpg";
var runOnStart = false;
var forceLightMode = false;

var mapSize = {width: 800, height: 533};
var popupSize = {width: 790, height: 575};
var artSize = {width: 800, height: 600};

var profile = {
		"method":   "websocket",
		"protocol": "ws",
	    "server":   "game.lazarus-project.net",
		"port":      8080,
		"path":     "/lazarus",
	};

//	Healing
const regexSuturePermission = /^(?:.. )?(\w.*?) allows you to suture (\w.*?)\.$/mg;

var healTarget = "UNKNOWN";

/**
 * Handles commands from the player to the server
 * @param {String} clientCommand Command from the server
 * @returns {Boolean} True if the command is not sent to the server
 */
function checkClientCommands(clientCommand){
	let commandsList = clientCommand.toLocaleLowerCase().split(" ");

	if (commandsList[0] == "@healer")
	{
		//	healerWindow("Bob", "Novice", 5)
		//	
		//	This should never be sent to the server.
		return true;
	} else if (commandsList[0] == "suture") {
		//	You just healed someone!

		//	Cut off the command
		commandsList.shift();

		//	Check for the practice-dummy
		if (commandsList[0] == "headless"){
			console.log("Probably healed: a dummy.");

			return false;
		}
		else if (commandsList[0] == "me" || commandsList[0] == "myself" || commandsList[0] == "self"){
			//	you healed yourself
			healTarget = localCharacter.substring(0,1).toUpperCase() + localCharacter.substring(1,localCharacter.length).toLowerCase();
		}
		else{
			//	you might have healed a real person
			healTarget = commandsList.join(" ");
		}

		//	I can look at list of characters in the scene and maybe find the target
		let roomPeopleList = [...roomPeople.values()];
		let roomPeopleSearchList = [];

		roomPeopleList.forEach((roomPerson) => {
			roomPeopleSearchList.push(roomPerson.split(" ").pop().toLocaleLowerCase());
		});

		//	Quick search of players
		let healTargetRegEx = new RegExp(roomPeopleSearchList.join("|").toLocaleLowerCase());
		let healTargetRegExResult;

		if (healTargetRegExResult = healTargetRegEx.exec(healTarget.toLocaleLowerCase())){
			healTarget = healTargetRegExResult[0];

			let targetIndex = roomPeopleSearchList.findIndex((n) => n == healTarget);

			if (targetIndex > -1){
				healTarget = roomPeopleList[targetIndex];
			}
		}
	}

	return false;
}

/**
 * Handles commands from the server to the player
 * @param {String} serverCommand Raw text from the server
 * @returns {Boolean} Hide return from the player?
 */
function checkServerCommands(serverCommand){
	if ((skillsData = regexSuturePermission.exec(serverCommand)) !== null){
		healTarget = skillsData[1];
	} else if (serverCommand.slice(0,68) == "You position the suturing device close to the wound, and activate it"){

		console.log("Probably healed: " + healTarget);

		//	TODO - a timer?
	}

	return false;
}

function healerWindow(patient, level, time)
{
	return;
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
  ['courierSound', 'sound/notify.wav'],
]);

var audioTriggers = new Map([
//	['mistSound', /^A frigid chill runs throughout your core as the icy white mists coarse over you./],
]);

var titlesFilter = {
	"Professor" : "Prof.",
	"Doctor" : "Dr.",
	"First Advisor" : "Adv.",
	"Reserve Officer" : "Res.",
	"Delivery-Tech" : "Post.",
	"Med-Student" : "Med.",
	"Field-Medic" : "Med.",
	"Administrator" : "Admin",
	"StoryPlotter" : "SP",
	"StoryHost" : "SH",
	"StoryCoder" : "SC",
	"StoryWrangler" : "SW",	//	This is a thing?
};