/*
 *	Merciful is an attempt to make a client for Castle Marrach which is 
 *	less Zealous.
 *	Credit goes to Zell (for Zealous) and the Zealotry team.
 *	The Orchil client is also an inspiration.
 */

'use strict';

//	Font check (from: https://stackoverflow.com/a/62755574/12099222)
const fontCheck = new Set([
  // Windows 10
  'Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Cambria', 'Cambria Math', 'Candara', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New', 'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Georgia', 'HoloLens MDL2 Assets', 'Impact', 'Ink Free', 'Javanese Text', 'Leelawadee UI', 'Lucida Console', 'Lucida Sans Unicode', 'Malgun Gothic', 'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft New Tai Lue', 'Microsoft PhagsPa', 'Microsoft Sans Serif', 'Microsoft Tai Le', 'Microsoft YaHei', 'Microsoft Yi Baiti', 'MingLiU-ExtB', 'Mongolian Baiti', 'MS Gothic', 'MV Boli', 'Myanmar Text', 'Nirmala UI', 'Palatino Linotype', 'Segoe MDL2 Assets', 'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Historic', 'Segoe UI Emoji', 'Segoe UI Symbol', 'SimSun', 'Sitka', 'Sylfaen', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Yu Gothic',
  // FOSS
  'Bitstream Charter', 'DejaVu', 'Breeze Sans', 'Cascadia Code', 'Cantarell', 'Charis SIL', 'Computer Modern', 'Concrete Roman', 'Courier Prime', 'Doulos SIL', 'Droid', 'Noto', 'Open Sans', 'Fira', 'GNU FreeFont', 'GNU Unifont', 'Go and Go Mono', 'Liberation', 'Croscore', 'Lato', 'Literata', 'Lohit', 'Nimbus Mono', 'Nimbus Sans', 'Nimbus Roman', 'OCR-A', 'OCR-B', 'Overpass', 'Roboto', 'Roboto Condensed', 'Selawik', 'Source Code', 'Source Han Sans', 'Source Han Serif', 'Source Sans', 'Source Serif', 'Tiresias', 'Ubuntu', 'Utopia', 'Vera', 'Zilla Slab',
  // macOS
  'American Typewriter', 'Andale Mono', 'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold', 'Arial Unicode MS', 'Athelas', 'Avenir', 'Avenir Next', 'Avenir Next Condensed', 'Baskerville', 'Big Caslon', 'Bodoni 72', 'Bodoni 72 Oldstyle', 'Bodoni 72 Smallcaps', 'Bradley Hand', 'Brush Script MT', 'Chalkboard', 'Chalkboard SE', 'Chalkduster', 'Charter', 'Cochin', 'Comic Sans MS', 'Copperplate', 'Courier', 'Courier New', 'Didot', 'DIN Alternate', 'DIN Condensed', 'Futura', 'Geneva', 'Georgia', 'Gill Sans', 'Helvetica', 'Helvetica Neue', 'Herculanum', 'Hoefler Text', 'Impact', 'Lucida Grande', 'Luminari', 'Marker Felt', 'Menlo', 'Microsoft Sans Serif', 'Monaco', 'Noteworthy', 'Optima', 'Palatino', 'Papyrus', 'Phosphate', 'Rockwell', 'Savoye LET', 'SignPainter', 'Skia', 'Snell Roundhand', 'Tahoma', 'Times', 'Times New Roman', 'Trattatello', 'Trebuchet MS', 'Verdana', 'Zapfino',
  // misc
  'Athelas ', 'Bookerly', 'Caecilia',
].sort());

var optionCategories = ['Logging', 'Sounds', 'Interface', 'AutoText', 'Macros'/*, 'Experimental'*/];

//	Default values
var clientVarsCore = {
	'commandHistory' : {
		'pretty' : 'Command history size',
		'defaultValue' : 50,
		'desc' : 'After you enter a command, Merciful stores it so you can hit up and down arrows to scroll through them. This variable tells Merciful how many commands to hold in memory.',
		'type' : 'number',
		'min' : '0',
		'category' : 'Logging',
		'specificity' : 'core'
	},
	'minCharHistory' : {
		'pretty' : 'Minimum history size',
		'defaultValue' : 3,
		'desc' : 'This is how long a command has to be for Merciful to hold it in the command history. A value of 3 means short commands like \'n\' or \'se\' will not be stored. A value of 1 or 0 means every command is stored.',
		'type' : 'number',
		'min' : '0',
		'max' : '9',
		'category' : 'Logging',
		'specificity' : 'core'
	},
	'messageHistory' : {
		'pretty' : 'Message history',
		'defaultValue' : 2000,
		'desc' : 'This variable decides how many old messages to keep in the chat window. Reduce this number to use less memory.',
		'type' : 'number',
		'min' : '250',
		'category' : 'Logging',
		'specificity' : 'core'
	},
	'useSound' : {
		'pretty' : 'Sound Effects',
		'defaultValue' : 1,
		'pattern' : '(true|false)',
		'desc' : 'This variable decides whether you want to hear sound effects.',
		'type' : 'bool',
		'category' : 'Sounds',
		'specificity' : 'core'
	},
	'soundVolume' : {
		'pretty' : 'Sound Volume',
		'defaultValue' : 10,
		'desc' : 'This variable sets the volume for sound effects. A value of 0 is muted, a value of 10 is full volume.',
		'type' : 'range',
		'min' : '0',
		'max' : '10',
		'category' : 'Sounds',
		'specificity' : 'core'
	},
	'useNotifySound' : {
		'pretty' : 'Notify when distracted',
		'defaultValue' : 'once',
		'pattern' : 'never|once|always',
		'desc' : 'This variable decides whether you want to hear a sound effect whenever a new message arrives if you are in another window or have scrolled up in the text log.',
		'type' : 'select',
		'category' : 'Sounds',
		'specificity' : 'core'
	},
	'notifyOnPage' : {
		'pretty' : 'Notify when paged',
		'defaultValue' : 1,
		'pattern' : '(true|false)',
		'desc' : 'This variable decides whether you want to hear a sound effect whenever a new page arrives.',
		'type' : 'bool',
		'category' : 'Sounds',
		'specificity' : 'core'
	},
	'hideNpcNames' : {
		'pretty' : 'Hide NPCs from character list',
		'defaultValue' : 1,
		'pattern' : '(true|false)',
		'desc' : 'This variable decides whether common non-player characters (couriers, bar staff, etc.) will appear on the right-hand side of the screen.',
		'type' : 'bool',
		'category' : 'Interface',
		'specificity' : 'core'
	},
	'nameSort' : {
		'pretty' : 'Character list sort',
		'defaultValue' : 'Default',
		'pattern' : 'Default|Alpha',
		'desc' : 'This variable decides whether player characters are listed according to the order they entered the room (default) or in alphabetical order.',
		'type' : 'select',
		'category' : 'Interface',
		'specificity' : 'core'
	},
//	'mercifulTheme' : {
//		'pretty' : 'Merciful theme',
//		'defaultValue' : 'Mercy',
//		'pattern' : 'classic|mercy',
//		'desc' : 'This variable changes the additional theme options for Merciful. (NOT IMPLEMENTED)',
//		'type' : 'select',
//		'category' : 'Interface',
//		'specificity' : 'core'
//	},
//	'useHealTimer' : {
//		'pretty' : 'Heal timer',
//		'defaultValue' : 0,
//		'pattern' : '(true|false)',
//		'desc' : 'The heal timer tells you how long you have left when healing a patient. Only visible when healing.',
//		'type' : 'bool',
//		'category' : 'Experimental',
//		'specificity' : 'core'
//	},
//	'useCombatPanel' : {
//		'pretty' : 'Combat panel',
//		'defaultValue' : 'off',
//		'pattern' : 'off|combat|always',
//		'desc' : 'The combat panel provides some extra UI elements during combat. Setting to \'combat\' will only show the panel during combat.',
//		'type' : 'select',
//		'category' : 'Experimental',
//		'specificity' : 'core'
//	},
//	'combatPanelPosition' : {
//		'pretty' : 'Combat panel position',
//		'defaultValue' : 'top',
//		'pattern' : 'top|left',
//		'desc' : 'Where to place the combat panel.',
//		'type' : 'select',
//		'category' : 'Experimental',
//		'specificity' : 'core'
//	},
	'echoInput' : {
		'pretty' : 'Echo Input',
		'defaultValue' : 1,
		'pattern' : '(true|false)',
		'desc' : 'This variable tells Merciful whether to show you the commands you typed in the main window or just their results. False means you will not see your typed commands in the log either.',
		'type' : 'bool',
		'category' : 'Interface',
		'specificity' : 'core'
	},
	'outputMargin' : {
		'pretty' : 'Output Indent',
		'defaultValue' : 1,
		'desc' : 'How much empty space to add to the edge of the output window to aide in legibility.',
		'type' : 'number',
		'min' : '0',
		'max' : '4',
		'immediate' : 1,
		'category' : 'Interface',
		'specificity' : 'core'
	},
	'font' : {
		'pretty' : 'Text font',
		'defaultValue' : 'Verdana',
		'pattern' : 'Verdana',
		'desc' : 'The font face used for all text in the game where possible.',
		'type' : 'select',
		'category' : 'Interface',
		'specificity' : 'core'
	},
	'fontSize' : {
		'pretty' : 'Text size',
		'defaultValue' : 'medium',
		'pattern' : 'xx-small|x-small|small|medium|large|x-large|xx-large|xxx-large',
		'desc' : 'The font size used for all text in the game where possible.',
		'type' : 'select',
		'category' : 'Interface',
		'specificity' : 'core'
	},
	'useTimeStamps' : {
		'pretty' : 'Time Stamps',
		'defaultValue' : 0,
		'pattern' : '(true|false)',
		'desc' : 'Should Merciful add a timestamp to your screen?',
		'type' : 'bool',
		'category' : 'Interface',
		'specificity' : 'core'
	},
	'logFormat' : {
		'pretty' : 'Log-file format',
		'defaultValue' : 'txt',
		'pattern' : 'txt|html',
		'desc' : 'Save logs in plain text or HTML?',
		'type' : 'select',
		'category' : 'Logging',
		'specificity' : 'core'
	},
	'timeZone' : {
		'pretty' : 'Log time zone',
		'defaultValue' : 'local',
		'pattern' : 'local|server',
		'desc' : 'Should Merciful use your own time-zone or server time for logs?',
		'type' : 'select',
		'category' : 'Logging',
		'specificity' : 'core'
	},
	'markDawn' : {
		'pretty' : 'Label new days',
		'defaultValue' : 0,
		'pattern' : '(true|false)',
		'desc' : 'Tell Merciful whether to add a new line in your logs for the start of a new day.',
		'type' : 'bool',
		'category' : 'Logging',
		'specificity' : 'core'
	}
};

var clientVarsChar = {
	'logging' : {
		'pretty' : 'Automatic logs',
		'defaultValue' : 1,
		'pattern' : '(true|false)',
		'desc' : 'This variable decides whether you want to save your logs automatically. Manual saving will still work regardless.',
		'type' : 'bool',
		'category' : 'Logging',
		'specificity' : 'char'
	}
};

var clientVarsGame = {
	'core' : {
	},
	'CM' : {
		'scrollHeader' : {
			'pretty' : 'Scroll Template',
			'defaultValue' : '%day%D / %moon%M / %yra%YRA',
			'desc' : 'Text to enter on any blank scroll. Useful for players who forget to add the date on their scrolls. \nUse %day%, %moon% and %yra% for automatic date values.',
			'key' : '%weekday% : Day of the week (CM style)<br>%day% : Day in the month<br>%moon% : Month of the year<br>%yra% : Year (CM numbering)',
			'type' : 'textbox',
			'category' : 'AutoText',
			'specificity' : 'game'
		},
		'useCourierSound' : {
			'pretty' : 'Notify on new mail',
			'defaultValue' : 1,
			'pattern' : '(true|false)',
			'desc' : 'This variable decides whether you want to hear a sound effect whenever you receive a new package or scroll from a courier.',
			'type' : 'bool',
			'category' : 'Sounds',
			'specificity' : 'game'
		}
	},
	'AE' : {
		'useDarkMode' : {
			'pretty' : 'Light / dark mode',
			'defaultValue' : 'Default',
			'pattern' : 'Default|Dark|Light',
			'desc' : 'This variable decides whether you want to use the default colours for your system (Default), force light mode (Light) or force dark mode (Dark) instead.',
			'type' : 'select',
			'category' : 'Interface',
			'specificity' : 'game'
		}
	}
};

var clientVars = {};

var clientVarsImported = {};
	
var clientVarsMap = new Map();

var categoryGroupList = new Map();

var macrosImported = {};
var macrosMap = new Map();
var macroCounter = 0;
var macroTable;

var styleSheet = document.getElementsByTagName("style")[0];

var argsMap = new Map();
	
//	Used to clear vars
//	chrome.storage.local.remove(['clientVars']);
//	chrome.storage.local.remove(['autoRun']);
//	chrome.storage.local.remove(['macros']);

//	NOT YET UPDATED
var audioTriggersFixed = {
	'startUpSound' : {
		'pretty' : 'Startup',
		'defaultValue' : 'sound/startup.wav',
		'pattern' : '.*',
		'desc' : 'The sound played when Merciful loads your character into the world.',
	},
	'notifySound' : {
		'pretty' : 'Notification',
		'defaultValue' : 'sound/notify.wav',
		'pattern' : '.*',
		'desc' : 'The sound played when a new message is delivered while you are in another window or scrolled up.'
	},
	'shutDownSound' : {
		'pretty' : 'Shutdown',
		'defaultValue' : 'sound/shutdown.wav',
		'pattern' : '.*',
		'desc' : 'The sound played when you lose your connection to the server or quit.'
	}
};

var audioTriggers = new Map([
	['You suddenly hear an urgent harmonious note in the distance', 'sound/silverwhistle.wav'],
//  ['STRING FOR DUCK CALL', 'sound/duckcall.wav'],
])

function findFonts()
{
	//	Font check (from: https://stackoverflow.com/a/62755574/12099222)
	let fontPattern = "";

	for (const font of fontCheck.values()) {
		if (document.fonts.check(`12px "${font}"`)) {
			fontPattern += "|" + font;
		}
	}

	//	set the font pattern 
	clientVarsCore.font.pattern = fontPattern.substring(1);
}

function loadClientVars()
{
	let rightCell = document.getElementById("right-cell");
	
	let audioTriggersFixedImported = new Map();
	let audioTriggersImported = new Map();
	
	//----- LEFT COLUMN ----- //

	//	Client vars
	
	//	default values
	for (const [key, value] of Object.entries(clientVarsCore)) {
		clientVarsMap.set(key,value.defaultValue);
		//	set as CORE (clientVars.core)
		};
	
	Object.assign(clientVars, clientVarsCore);
	
	var findArgs = document.URL.split("?")[1];
	var args;

	if (findArgs)
		args = findArgs.split("&");
	
	if (args)
	{
		args.forEach(function(item, index) {
			let argsplit = item.split("=");
			argsMap.set(argsplit[0], argsplit[1]);
		});
	}
	
	for (const [key, value] of Object.entries(clientVarsChar)) {
		clientVarsMap.set(key,value.defaultValue);
		//	set as CHAR (clientVars.char[charName])
		};
	
	if (argsMap.has('game'))
	{
		for (const [key, value] of Object.entries(clientVarsGame.core)) {
			clientVarsMap.set(key,value.defaultValue);
			//	set as GAME (clientVars.game[gamePrefix])
			};
		
		Object.assign(clientVars, clientVarsGame.core);
		
		if (clientVarsGame[argsMap.get('game')])
		{
			for (const [key, value] of Object.entries(clientVarsGame[argsMap.get('game')])) {
				clientVarsMap.set(key,value.defaultValue);
				//	set as GAME (clientVars.game[gamePrefix])
				};
			Object.assign(clientVars, clientVarsGame[argsMap.get('game')]);
		}
	}
	
	if (argsMap.has('char'))
	{
		for (const [key, value] of Object.entries(clientVarsChar)) {
			clientVarsMap.set(key,value.defaultValue);
			//	set as GAME (clientVars.game[gamePrefix])
			};
			
			Object.assign(clientVars, clientVarsChar);
	}

	//	If you can get it from chrome.storage.local then overwrite defaults
	chrome.storage.local.get(['clientVars'], function(result) {
		if (result.clientVars)
		{
			clientVarsImported = result.clientVars;
			
			//	read in core values and add to clientVarsMap Map
			if (result.clientVars.core)
				for (const [key, value] of Object.entries(result.clientVars.core)) {
					clientVarsMap.set(key,value);
					};
			
			//	read in GAME values and add to clientVarsMap Map
			if (result.clientVars.game)
				if (result.clientVars.game[argsMap.get('game')])
					for (const [key, value] of Object.entries(result.clientVars.game[argsMap.get('game')])) {
						clientVarsMap.set(key,value);
//						console.log("Game (" + argsMap.get('game') + "): " + key + " => " + value);
						};
			
			//	read in CHAR values and add to clientVarsMap Map
			if (result.clientVars.char)
				if (result.clientVars.char[argsMap.get('game')])
					if (result.clientVars.char[argsMap.get('game')][argsMap.get('char')])
						for (const [key, value] of Object.entries(result.clientVars.char[argsMap.get('game')][argsMap.get('char')])) {
							clientVarsMap.set(key,value);
//							console.log("Character (" + argsMap.get('char') + "): " + key + " => " + value);
							};
		}
		
		populateClientVars();
		updateFonts(clientVarsMap.get('font'), clientVarsMap.get('fontSize'));
		
		if (!clientVarsImported.core)
			clientVarsImported.core = {};
		
		if (!clientVarsImported.game)
			clientVarsImported.game = {};
		
		if (!clientVarsImported.game[argsMap.get('game')])
			clientVarsImported.game[argsMap.get('game')] = {};
		
		if (!clientVarsImported.char)
			clientVarsImported.char = {};
		
		if (!clientVarsImported.char[argsMap.get('game')])
			clientVarsImported.char[argsMap.get('game')] = {};
		
		if (!clientVarsImported.char[argsMap.get('game')][argsMap.get('char')]);
			clientVarsImported.char[argsMap.get('game')][argsMap.get('char')] = {};
	}); 
	
/*		
	//	Audio trigger
	//	If you can get it from chrome.storage.local then do so.
	chrome.storage.local.get(['audioTriggersFixed'], function(result) {
		if (result.audioTriggersFixed)
		{
			//	read in values and add to audioTriggersFixedImported Map
			for (const [key, value] of Object.entries(result.audioTriggersFixed)) {
				audioTriggersFixedImported.set(key,value);
				};
			
			let thisTable = document.createElement("table");
			rightCell.appendChild(thisTable);
			
			for (const [key, value] of Object.entries(audioTriggersFixed)) {
				//	Create a whole bunch of entries
				let thisTR = document.createElement("tr");
				let nameTD = document.createElement("td");
				let inputTD = document.createElement("td");
				let descTD = document.createElement("td");
				let thisInput = document.createElement("input");
				
				nameTD.innerHTML = value.pretty + ": ";
				
				thisInput.setAttribute("name", key);
				thisInput.setAttribute("type", 'file');
				thisInput.setAttribute("value", audioTriggersFixedImported.get(key));
				thisInput.setAttribute("accept", 'audio/*');
				thisInput.addEventListener('change', updateAudioTriggers);
				
				descTD.innerHTML = value.desc;
				
				thisTable.appendChild(thisTR);
					thisTR.appendChild(nameTD);
					thisTR.appendChild(inputTD);
						inputTD.appendChild(thisInput);
					thisTR.appendChild(descTD);
				};
		}
		else
		{
			let thisTable = document.createElement("table");
			rightCell.appendChild(thisTable);
			
			for (const [key, value] of Object.entries(audioTriggersFixed)) {
				audioTriggersFixedImported.set(key,value.defaultValue);
				
				//	Create a whole bunch of entries
				//	Create a whole bunch of entries
				let thisTR = document.createElement("tr");
				let nameTD = document.createElement("td");
				let inputTD = document.createElement("td");
				let descTD = document.createElement("td");
				let thisInput = document.createElement("input");
				
				nameTD.innerHTML = value.pretty + ": ";
				
				thisInput.setAttribute("name", key);
				thisInput.setAttribute("type", 'file');
				thisInput.setAttribute("value", value.defaultValue);
				thisInput.setAttribute("accept", 'audio/*');
				thisInput.addEventListener('change', updateAudioTriggers);
				
				descTD.innerHTML = value.desc;
				
				thisTable.appendChild(thisTR);
					thisTR.appendChild(nameTD);
					thisTR.appendChild(inputTD);
						inputTD.appendChild(thisInput);
					thisTR.appendChild(descTD);
				};
		}
		
		console.log(audioTriggersFixedImported);
	}); 
*/
	//----- RIGHT COLUMN ----- //
/*
	//	Autorun
	chrome.storage.local.get(['autoRun'], function(result) {
		let autorunTitle = document.createElement("H1");
		rightCell.appendChild(autorunTitle);
		autorunTitle.innerHTML = "Autorun (NOT YET IMPLEMENTED)"
		
		let AutorunHR = document.createElement("HR");
		rightCell.appendChild(AutorunHR);
		
		let autorunInput = document.createElement("textarea");
		rightCell.appendChild(autorunInput);
		
		autorunInput.setAttribute("id", 'autorun');
		autorunInput.setAttribute("name", 'autorun');
		autorunInput.setAttribute("rows", '8');
		autorunInput.setAttribute("cols", '50');
		autorunInput.setAttribute("placeholder", 'Enter text here to run after you log in.\nOne command per line.');
		autorunInput.addEventListener('blur', updateAutoRun);
		
		if (result.autoRun)
		{
			autorunInput.setAttribute("value", result.autoRun);
			autorunInput.value  = result.autoRun;
		}
		
		let AutorunHR2 = document.createElement("HR");
		rightCell.appendChild(AutorunHR2);
		
	});
	*/
	if (!argsMap.has('char'))
		return;
	
	//	Macro
	chrome.storage.local.get(['macros'], function(result) {
		if (result.macros)
		{
			macrosImported = result.macros;
			
			let tempMacros;
			
			//	if not the character, maybe the game?
			if (result.macros.game)
				if (result.macros.game[argsMap.get('game')])
					if (result.macros.game[argsMap.get('game')].core)
						tempMacros = result.macros.game[argsMap.get('game')].core;
					else
						tempMacros = result.macros.game[argsMap.get('game')]
			
			//	check for character having macros
			if (result.macros.game)
				if (result.macros.game[argsMap.get('game')])
					if (result.macros.game[argsMap.get('game')].char)
						if (result.macros.game[argsMap.get('game')].char[argsMap.get('char')])
							tempMacros = result.macros.game[argsMap.get('game')].char[argsMap.get('char')];
						
			if (tempMacros)
				for (const [key, value] of Object.entries(tempMacros)) {
					macrosMap.set(key, value);
					};
		}
			
		populateMacros();
		updateFonts(clientVarsMap.get('font'), clientVarsMap.get('fontSize'));
		
		console.log(macrosMap);
	});
		
}

function updateAutoRun(e)
{
	let targ = e.target;
	
	//	Update the value
	chrome.storage.local.set({autoRun : targ.value});
	
	console.log(targ.value);
}

function updateAudioTriggers(e)
{
	let targ = e.target;
	
	console.log(e);
	console.log(targ.name);
	console.log(targ.pattern);
	console.log(targ.value);
}

function resetAudioTriggers(e)
{
	let targ = e.target;
	
	console.log(targ);
	console.log(targ.name);
	console.log(targ.value);
}

function populateClientVars()
{
	console.log("populateClientVars()");
	
	let mainDiv = document.getElementById("options");
	
	let tempCats = optionCategories.slice();
	let myCat = '';
	
	while (myCat = tempCats.shift())
	{
		//	Only need Macros if there is a character
		if ((!argsMap.has('char')) && (myCat == "Macros"))
			continue;
		
		//	Only CM has autotext right now
		if ((argsMap.get('game') != "CM") && (myCat == "AutoText"))
			continue;
		
		//	Make the tabs
		let tempInput = document.createElement("input");
		tempInput.type = 'radio';
		tempInput.name = 'tabs';
		tempInput.id = 'tab-nav-' + myCat;
		
		let tempLabel = document.createElement("label");
		tempLabel.htmlFor ='tab-nav-' + myCat;
		tempLabel.innerText = myCat;
		tempLabel.id = myCat;
		tempLabel.className  = "UIText";
		
		tempInput.addEventListener('change', event => {
			let myCategoryTabs = document.getElementsByClassName("tabs-list")[0].getElementsByTagName('div');
			
			myCat = event.target.id;
			
			let myCatTab;
			
			let myX = 0;
			
			while (myCatTab = myCategoryTabs.item(myX))
			{
				if (myCatTab.id == myCat.substring(8,myCat.length) + "content")
				{
					myCatTab.style.display = 'block';
				}
				else
				{
					myCatTab.style.display = 'none';
				}
				
				myX++;
			}
		});
	
		mainDiv.appendChild(tempInput);
		mainDiv.appendChild(tempLabel);
	}
	
	mainDiv.getElementsByTagName('input')[0].checked = true;
	
	tempCats = optionCategories.slice();
	let tempCategories = document.createElement("div");
	tempCategories.className  = "tabs-list";
	mainDiv.appendChild(tempCategories);
	
	while (myCat = tempCats.shift())
	{
		let tempBox = document.createElement("div");
		tempBox.id = myCat + "content";
		tempCategories.appendChild(tempBox);
		
		if (myCat != "Macros") {
			let clientVarsTitle = document.createElement("H1");
			tempBox.appendChild(clientVarsTitle);
			clientVarsTitle.innerHTML = "Variables"
			clientVarsTitle.className  = "UIText";
			
			let clientVarsHR = document.createElement("HR");
			tempBox.appendChild(clientVarsHR);
			
			let clientVarsTip = document.createElement("p");
			tempBox.appendChild(clientVarsTip);
			clientVarsTip.innerHTML = "Hover your cursor over a variable for more information."
			clientVarsTip.className  = "UIText";
		}
		
		let thisTable = document.createElement("table");
		tempBox.appendChild(thisTable);
		
		categoryGroupList[myCat] = thisTable;
	}
	
	tempCategories.getElementsByTagName('div')[0].style.display = 'block';
	
	findFonts();
	
	for (const [key, value] of Object.entries(clientVars)) {
		//	Create a whole bunch of entries
		let thisTR = document.createElement("tr");
		let nameTD = document.createElement("td");
		let inputTD = document.createElement("td");
		let descTD = document.createElement("td");
		let thisInput = document.createElement("input");
		
		if (value.type == "textbox")
			thisInput = document.createElement("textarea");
		
		if ((value.type == "bool") || (value.type == "select"))
			thisInput = document.createElement("select");
		
		nameTD.innerHTML = value.pretty + ": ";
		nameTD.className  = "UIText";
		thisTR.setAttribute("title", value.desc);
		
		thisInput.setAttribute("name", key);
		thisInput.setAttribute("id", key);
		thisInput.className  = "UIText";
		
		
		if ((value.type != "bool") && (value.type != "select") && (value.type != "textbox"))
		{
			thisInput.setAttribute("type", value.type);
			thisInput.style.width = "calc(6em - 8px)";
			
			if (clientVarsMap.get(key))
				thisInput.setAttribute("value", clientVarsMap.get(key));
		}
		
		if (value.pattern)
			thisInput.setAttribute("pattern", value.pattern);
		
		if (value.minlength)
			thisInput.setAttribute("minlength", value.minlength);
		if (value.maxlength)
			thisInput.setAttribute("maxlength", value.maxlength);
		
		if (value.min)
			thisInput.setAttribute("min", value.min);
		if (value.max)
			thisInput.setAttribute("max", value.max);
		
		thisInput.setAttribute("required", true);
		
		thisInput.dataset.specificity = value.specificity;
		
		if (value.type == "range")
		{
			thisInput.style.width = "calc(6em - 4px)";
		}
		
		if (value.type == "textbox")
		{
			thisInput.rows = 5;
			thisInput.cols = 45;
			nameTD.style.verticalAlign  = "text-top";
			
			if (clientVarsMap.get(key))
				thisInput.innerText = clientVarsMap.get(key);
		}
		
		if (value.type == "bool")
		{
			let tempTrue = document.createElement("option");
			tempTrue.value = 1;
			tempTrue.text = 'true';
			let tempFalse = document.createElement("option");
			tempFalse.value = 0;
			tempFalse.text = 'false';
			
			if (clientVarsMap.get(key) == 1)
				tempTrue.selected = true;
			else
				tempFalse.selected = true;
			
			thisInput.appendChild(tempTrue);
			thisInput.appendChild(tempFalse);
			thisInput.style.width = "6em";
		}
		
		if (value.type == "select")
		{
			//	split the values string
			let optionsArray = value.pattern.split("|");
			
			//	run a foreach on the resulting array
			optionsArray.forEach(optionValue =>{
				let tempOption = document.createElement("option");
				tempOption.value = optionValue;
				tempOption.text = optionValue;
				thisInput.appendChild(tempOption);
				
				if (clientVarsMap.get(key) == optionValue)
					tempOption.selected = true;
			});
			thisInput.style.width = "6em";
		}
		
		if ((value.type == "bool") || (value.type == "select"))
			thisInput.addEventListener('change', updateClientVars);
		else if (value.immediate)
			thisInput.addEventListener('change', updateClientVars);
		else 
			thisInput.addEventListener('blur', updateClientVars);
		
		descTD.innerHTML = value.desc;
		
		categoryGroupList[value.category].appendChild(thisTR);
			thisTR.appendChild(nameTD);
			thisTR.appendChild(inputTD);
				inputTD.appendChild(thisInput);
		
		if ((value.type == "textbox")&&(value.key))
		{
			let extraTD = document.createElement("td");
			let extraP = document.createElement("p");
			
			extraP.innerHTML = value.key;
			extraP.className  = "UIText";
			extraTD.style.verticalAlign  = "text-top";
			
			extraTD.appendChild(extraP);
			thisTR.appendChild(extraTD);
		}
	};
}

function updateClientVars(e)
{
	let targ = e.target;
	
	if (!targ.validity.valid)
	{
		//	Just set it back to its old value
		targ.value = clientVarsMap.get(targ.name);
	}
	else
	{
		//	Update the value
		clientVarsMap.set(targ.name, targ.value);
		
		switch(e.target.dataset.specificity)
		{
			case "core":
				console.log("clientVars -> core -> " + targ.name + " : " + targ.value);
				chrome.runtime.sendMessage({clientVar: targ.name, value: targ.value});
				clientVarsImported.core[targ.name] = targ.value;
				
				break;
				
			case "game":
				console.log("clientVars -> game -> " + argsMap.get('game') + " -> " + targ.name + " : " + targ.value);
				chrome.runtime.sendMessage({clientVar: targ.name, value: targ.value, gameName: argsMap.get('game')});
				clientVarsImported.game[argsMap.get('game')][targ.name] = targ.value;
				break;
			
			case "char":
				console.log("clientVars -> char -> " + argsMap.get('game') + " -> " + argsMap.get('char') + " -> " + targ.name + " : " + targ.value);
				chrome.runtime.sendMessage({clientVar: targ.name, value: targ.value, gameName: argsMap.get('game'), charName: argsMap.get('char')});
				clientVarsImported.char[argsMap.get('game')][argsMap.get('char')][targ.name] = targ.value;
				break;
			
			default:
				console.log("INVALID Specificity!");
			
		}
		
		chrome.storage.local.set({clientVars : clientVarsImported});
		
		console.log(clientVarsImported);
	}
	
	if (targ.name == 'font')
	{
		updateFonts(targ.value, clientVarsMap.get('fontSize'));
	}
	
	if (targ.name == 'fontSize')
	{
		updateFonts(clientVarsMap.get('font'), targ.value);
	}
}

function updateFonts(fontFamily, fontSize)
{
	styleSheet.innerHTML = 
			'.UIText { ' +
				'font-family: ' + fontFamily + '; ' +
				'font-size: ' + fontSize + '; ' +
			'}';
}

function resetClientVars(e)
{
	let targ = e.target;
	
	targ.value = clientVarsMap.get(targ.name);
}

function populateMacros()
{
	let macroTitle = document.createElement("H1");
	categoryGroupList['Macros'].appendChild(macroTitle);
	macroTitle.innerHTML = "Macros"
	macroTitle.className  = "UIText";
	
	let macroHR = document.createElement("HR");
	categoryGroupList['Macros'].appendChild(macroHR);
		
	let macroTip = document.createElement("p");
	categoryGroupList['Macros'].appendChild(macroTip);
	macroTip.innerHTML = "Place trigger words on the left side and your commands on the right. When you type the text on the left into Merciful, the text on the right will be inserted in its place. Macros run from top to bottom. No spaces are allowed in trigger text (left side), but you may use triggers in the command (right side)."
	macroTip.className  = "UIText";
	
	macroTable = document.createElement("table");
	categoryGroupList['Macros'].appendChild(macroTable);
	
	let macroHead = document.createElement("tr");
	macroHead.innerHTML = "<th class='UIText'>Trigger</th><th class='UIText'>Command</th>"
	
	macroTable.appendChild(macroHead);
	
	macroCounter = 0;
	
	macrosMap.forEach(function(value, key){
		let newTR = drawMacros(key, value, macroCounter);
		
		macroTable.appendChild(newTR);
	});
	
	let newTR = drawMacros("", "", macroCounter);
	macroTable.appendChild(newTR);
	
	let macroHR2 = document.createElement("HR");
	categoryGroupList['Macros'].appendChild(macroHR2);
}

function drawMacros(key, value, counter)
{
		//	Create a whole bunch of entries
		let thisTR = document.createElement("tr");
		let triggerTD = document.createElement("td");
		let commandTD = document.createElement("td");
		let thisTrigger = document.createElement("input");
		let thisCommand = document.createElement("input");
		
		thisTrigger.setAttribute("name", "Trigger" + macroCounter);
		thisTrigger.setAttribute("id", "Trigger" + macroCounter);
		thisTrigger.setAttribute("type", "text");
		thisTrigger.setAttribute("placeholder", "Trigger");
		thisTrigger.setAttribute("data-pairid", macroCounter);
		thisTrigger.setAttribute("data-key", key);
		thisTrigger.setAttribute("value", key);
		thisTrigger.style.width = "80px";
		thisTrigger.setAttribute("required", true);
		thisTrigger.addEventListener('blur', updateMacros);
		thisTrigger.className  = "UIText";
		
		thisCommand.setAttribute("name", "Command" + macroCounter);
		thisCommand.setAttribute("id", "Command" + macroCounter);
		thisCommand.setAttribute("type", "text");
		thisCommand.setAttribute("placeholder", "Command");
		thisCommand.setAttribute("data-pairid", macroCounter);
		thisCommand.setAttribute("data-value", value);
		thisCommand.setAttribute("value", value);
		thisCommand.style.width = "380px";
		thisCommand.setAttribute("required", true);
		thisCommand.addEventListener('blur', updateMacros);
		thisCommand.className  = "UIText";
		
		thisTR.appendChild(triggerTD);
			triggerTD.appendChild(thisTrigger);
		thisTR.appendChild(commandTD);
			commandTD.appendChild(thisCommand);
				
		macroCounter++;
		return thisTR;
}

function updateMacros(e)
{
	let targ = e.target;
	let triggerInput;
	let commandInput;
	
	console.log(targ.dataset.pairid);
	
	if (targ.placeholder == "Trigger")
	{
		triggerInput = targ;
		commandInput = document.getElementById("Command" + targ.dataset.pairid);
	}
	else if (targ.placeholder == "Command")
	{
		triggerInput = document.getElementById("Trigger" + targ.dataset.pairid);
		commandInput = targ;
	}
	else
	{
		//	ERROR!
		console.log("updateMacros called for the wrong element!");
		return;
	}
	
	triggerInput.value = triggerInput.value.replace(/\s/g, "");
	
	console.log(triggerInput);
	console.log(commandInput);
	
	if ((triggerInput.value == "") || (commandInput.value == ""))	//	should do a validity check really
	{
		//	If the key exists, remove the entry
		if (macrosMap.has(triggerInput.dataset.key))
			macrosMap.delete(triggerInput.dataset.key);
		
		console.log("Removing: " + triggerInput.dataset.key);
		chrome.runtime.sendMessage({trigger: triggerInput.dataset.key});
	}
	else
	{
		//	set the macro!
		macrosMap.set(triggerInput.value, commandInput.value);
		
		if (triggerInput.dataset.key != triggerInput.value)
		{
			macrosMap.delete(triggerInput.dataset.key);
			chrome.runtime.sendMessage({trigger: triggerInput.dataset.key});
		}
		
		triggerInput.dataset.key = triggerInput.value;
		commandInput.dataset.value = commandInput.value;
		
		chrome.runtime.sendMessage({trigger: triggerInput.value, command: commandInput.value});
	}
	
	console.log(macrosMap);
	
	
	//	check for character having macros
	if (!macrosImported.game)
		macrosImported.game = {};
		
	if (!macrosImported.game[argsMap.get('game')])
		macrosImported.game[argsMap.get('game')] = {}
		
	if (!macrosImported.game[argsMap.get('game')].char)
		macrosImported.game[argsMap.get('game')].char = {}
	
	macrosImported.game[argsMap.get('game')].char[argsMap.get('char')] = Object.fromEntries(macrosMap);
	chrome.storage.local.set({macros : macrosImported});
	
	if (macrosMap.size > macroCounter - 1) //	i.e. you filled up the macro list
	{
		console.log("Need more space!");
		
		//	Add a new one!
		let newTR = drawMacros("", "", macroCounter);
		macroTable.appendChild(newTR);
		
		updateFonts(clientVarsMap.get('font'), clientVarsMap.get('fontSize'));
	} else {
		console.log(macrosMap.size + "<" + macroCounter);
	}
}

function resetMacro(e)
{
	let targ = e.target;
	
	targ.value = macrosMap.get(targ.name);
}

loadClientVars();