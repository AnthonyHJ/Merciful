//  get the HTML
let outputPane = document.getElementById("output");
console.log(outputPane);

chrome.storage.local.get(['logFiles'])
    .then(logs=>{
        console.log(logs);

        for (const [charName, logData] of Object.entries(logs.logFiles)) {
            let charNameElement = document.createElement("div");
            let logNameElement = document.createElement("div");
            let logTextElement = document.createElement("div");

            charNameElement.innerHTML = charName;
            logNameElement.innerHTML = logData.logName;
            logTextElement.innerHTML = logData.logText;

            outputPane.appendChild(charNameElement);
            outputPane.appendChild(logNameElement);
            outputPane.appendChild(document.createElement("hr"));

            if (logData.logName.substr(-4) == 'html')
            {
                chrome.storage.session.get(['logFileStyle'], function(result) {
                    logData.logText = "<html><body>" + logData.logText + "</body></html>";
                    
                    let file = URL.createObjectURL(new Blob([logData.logText], {type: "text/html"}));

                    chrome.downloads.download({ url : file, filename : logData.logName, conflictAction : "uniquify" }, (newID) => { 
                    //  delete the log
                    });
                });
            }
            else
            {
                let file = URL.createObjectURL(new Blob([logData.logText], {type: "text/plain"}));

                chrome.downloads.download({ url : file, filename : logData.logName, conflictAction : "uniquify" }, (newID) => { 
                    //  delete the log
                });
            }

            delete logs.logFiles[charName];

            chrome.storage.local.set({"logFiles": logs.logFiles});
        }
    }).then(out=>{
        //  close this window!
        window.close();
    });