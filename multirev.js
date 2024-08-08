'use strict';

var gamePrefix = 'MR';
var gameName = "Multiverse Revelations";
var loginURL = 'https://login.multirev.net';
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

function healerWindow(patient, level, time)
{
	return;
}

function checkCourierTriggers (text)
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
