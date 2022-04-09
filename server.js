"use strict";

var manifestData = chrome.runtime.getManifest();

var client = {
		"name":     manifestData.name,
		"version":  manifestData.version
	};