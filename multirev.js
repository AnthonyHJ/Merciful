'use strict';

var gamePrefix = 'MR';
var gameName = "Multiverse Revelations";
var loginURL = 'https://login.multirev.net';
var fullMapURL = "https://imagizer.imageshack.com/v2/641x641q70/924/weXBro.jpg";
var runOnStart = false;
var forceLightMode = false;

var mapSize = {width: 468, height: 468};
var popupSize = {width: 800, height: 600};
var artSize = {width: 286, height: 450};	//	Size used by CM

var profile = {
		"method":   "websocket",
		"protocol": "ws",
	    "server":   "game.multirev.net",
		"port":      8080,
		"woe_port":  8084,
		"path":     "/lazarus",
	};

/**
 * Handles commands from the player to the server
 * @param {String} clientCommand Command from the server
 * @returns {Boolean} True if the command is not sent to the server
 */
function checkClientCommands(clientCommand){
return false;
}

/**
 * Handles commands from the server to the player
 * @param {String} serverCommand Raw text from the server
 * @returns {Boolean} Hide return from the player?
 */
function checkServerCommands(){
return false;
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
	"StoryPlotter" : "SP",
	"StoryHost" : "SH",
	"StoryCoder" : "SC",
};