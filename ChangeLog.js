chrome.storage.local.get(['clientVars'], function(result) {
	if (result.clientVars)
	{
		let clientVars = new Map();
		
		//	read in values and override
		for (const [key, value] of Object.entries(result.clientVars)) {
			clientVars.set(key,value);
			};
		
		// Create our stylesheet
		var style = document.createElement('style');
		style.innerHTML =
			'h1, h2, li { ' +
				'font-family: ' + clientVars.get("font") + '; ' +
				'font-size: ' + clientVars.get("fontSize") + '; ' +
				'margin-left: 50px; ' +
				'margin-right: 50px; ' +
			'}\n' + 
			
			'h1 { ' +
				'margin-top: 50px; ' +
			'}\n\n' + 
			
			'@media (prefers-color-scheme: light) {\n' + 
			'\thtml, body { font-size: 100%; background-color:Canvas; color:CanvasText; }\n' + 
			'}\n\n' + 
			
			'@media (prefers-color-scheme: dark) {\n' + 
			'\thtml, body { font-size: 100%; background-color:#333; color:FFF; }\n' + 
			'\ta, a:visited { color:#81D9FE ; }\n' + 
			'}';

		// Get the first script tag
		var ref = document.querySelector('h1');

		// Insert our new styles before the first script tag
		ref.parentNode.insertBefore(style, ref);
	}
});