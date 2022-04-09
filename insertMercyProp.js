var textBody;

function insertMercyProp()
{
	let clientVarsImported = {};

	//	Client vars
	//	If you can get it from chrome.storage.local then do so.
	chrome.storage.local.get(['clientVars'], function(result) {
		if (result.clientVars)
		{
			//	read in values and add to clientVarsImported Map
			for (const [key, value] of Object.entries(result.clientVars)) {
				clientVarsImported = result.clientVars;
				};
		}
		else
			return;
		
		if (!('update_url' in chrome.runtime.getManifest()))
		{
			console.log("clientVars Imported");
			console.log(clientVarsImported.game);
		}

		if (document.title = "SkyWriter! Composing: a scroll")
		{
			if (textBody)
				return;
				
			if (!clientVarsImported.game)
				return;
				
			if (!clientVarsImported.game.CM)
				return;
				
			if (!clientVarsImported.game.CM.scrollHeader)
				return;

			if (textBody = document.getElementsByTagName("textarea")[0])
			{
				if (!textBody.value)
					textBody.value = textVariables(clientVarsImported.game.CM.scrollHeader) + "\n";
			}
		}
	}); 
}

function textVariables(input)
{
	let output = input;
	
	//	Date
	
	marrachTime.updateTime();
	
	output = output.replace("%weekday%", marrachTime.weekday);
	output = output.replace("%day%", marrachTime.day);
	output = output.replace("%moon%", marrachTime.moon);
	output = output.replace("%yra%", marrachTime.yra);
	
//	output = timeYear.toString().substring(2,4) + "YRA " + timeMoon + "M " + timeDate + "D; TOPIC"
	
	return output;
}

insertMercyProp();