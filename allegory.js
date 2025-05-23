'use strict';

var gamePrefix = 'AE';
var gameName = "Allegory of Empires";
var loginURL = 'https://login.allegoryofempires.com';
var fullMapURL = "https://allegoryofempires.com/wp-content/uploads/Maps/Rinascita.jpg";
var runOnStart = true;

var mapSize = {width: 468, height: 468};
var popupSize = {width: 800, height: 600};
var artSize = {width: 286, height: 450};	//	Size used by CM

var forceLightMode = window.matchMedia('(prefers-color-scheme: light)').matches;

var profile = {
		"method":   "websocket",
		"protocol": "ws",
	    "server":   "game.allegoryofempires.com",
		"port":      8080,
		"path":     "/ironclaw",
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
	
//	May need to send some autotext at the start to set the theme.
//	Run auto after first skoot?

function skoot80 (skootText)
{
	console.log(skootText);
	
	let values = skootText.split(" ");
	
	document.getElementById(values[0] + '_bar').style.setProperty("--percentValue", values[1] + '%');

}

function skoot90 (skootText)
{
	console.log(skootText);
//	console.log("<img src='" + iconsLoc+timesOfDay['value'] + "'><img src='" + iconsLoc+weatherIcons['value'] + "'><img src='" + iconsLoc+windIcons['value'] + "'>");
	
	let iconsLoc = 'http://client.allegoryofempires.com/allegory/icons/';
	let values = skootText.split(" ");
	
	if (isDevMode)
	{
		if (!timesOfDay.get(values[0]))
			reportClientMessage("No time entry for: " + values[0], 'error');
		
		if (!weatherIcons.get(values[1]))
			reportClientMessage("No weather entry for: " + values[1], 'error');
		
		if (!windIcons.get(values[2]))
			reportClientMessage("No wind entry for: " + values[2], 'error');
	}
	
	if (timesOfDay.get(values[0]))
		document.getElementById("time_Image").src = iconsLoc + timesOfDay.get(values[0]);
	
	if (weatherIcons.get(values[1]))
		document.getElementById("weather_Image").src = iconsLoc + weatherIcons.get(values[1]);
	
	if (windIcons.get(values[2]))
		document.getElementById("wind_Image").src = iconsLoc + windIcons.get(values[2]);
	
	//	time is iconsLoc+timesOfDay['value']
	//	weather is iconsLoc+weatherIcons['value']
	//	wind is iconsLoc+windIcons['value']
	
	/*
	SKOOT 90 evening snow calm
	*/
	
}

function LoadStyles()
{
	//	forceLightMode
	let darkMode = clientVars.get("useDarkMode");
	let cssFile = "allegoryDynamic";
	
	if (darkMode == 'Light')
	{
		forceLightMode = true;
		cssFile = "allegoryLight";
	}
	else if (darkMode == 'Dark')
	{
		forceLightMode = false;
		cssFile = "allegoryDark";
	}
	else
	{
		forceLightMode = window.matchMedia('(prefers-color-scheme: light)').matches;
	}
	
	//	Load my CSS
	let head  = document.getElementsByTagName('head')[0];
    let link  = document.createElement('link');
    link.type = 'text/css';
    link.href = cssFile + ".css";
    link.rel  = 'stylesheet';
    head.appendChild(link);
}

function RunOnStart()
{
	if (!runOnStart)
		return;
	
	console.log("Running startup code.");
	
	document.getElementById("player_name").innerText = localCharacter.substring(0,1).toUpperCase() + 
										localCharacter.substring(1,localCharacter.length).toLowerCase();
	
	runOnStart = false;
}

var timesOfDay = new Map([
  ['night', 'time/night.png'],
  ['dawn', 'time/sunrise.png'],
  ['morning', 'time/day.png'],
  ['midday', 'time/day.png'],
  ['afternoon', 'time/day.png'],
  ['dusk', 'time/sunset.png'],
  ['evening', 'time/night.png'],
  ['midnight', 'time/night.png'],
  ['aftermidnight', 'time/night.png'],
]);

var weatherIcons = new Map([
  ['clear', 'weather/clear.png'],
  ['cloudy', 'weather/clouds.png'],
  ['fog', 'weather/clouds.png'],
  ['overcast', 'weather/clouds.png'],
  ['partly', 'weather/clouds.png'],
  ['rain', 'weather/rain.png'],
  ['snow', 'weather/snow.png'],
  ['stormy', 'weather/thunder.png'],
  ['windy', 'weather/wind.png'],
]);

var windIcons = new Map([
  ['breeze', 'weather/wind.png'],
  ['calm', 'weather/clear.png'],
  ['gale', 'weather/wind.png'],
  ['windy', 'weather/wind.png'],
]);

var audioTriggersFixed = new Map([
  ['startUpSound', 'sound/startup.wav'],
  ['notifySound', 'sound/notify.wav'],
  ['shutDownSound', 'sound/shutdown.wav'],
  ['mistSound', 'sound/sinister.wav'],
  ['badSound', 'sound/sinister.wav'],
  ['courierSound', 'sound/notify.wav'],
]);

var audioTriggers = new Map([
	['badSound', /^[^\"]+?You encounter monsters!/],
]);

var titlesFilter = {
	"Doctor" : "Dr.",
	"StoryPlotter" : "SP",
	"StoryHost" : "SH",
	"StoryCoder" : "SC",
};