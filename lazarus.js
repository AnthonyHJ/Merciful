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
	"Reserve Officer" : "R.O.",
	"Delivery-Tech" : "",
	"Med-Student" : "Med.",
	"Field-Medic" : "Med.",
	"Administrator" : "Admin",
	"StoryPlotter" : "SP",
	"StoryHost" : "SH",
};