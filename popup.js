function popup_search() {
	chrome.tabs.executeScript({
		file: 'contentscript.js'
	});
	chrome.tabs.insertCSS(null, {
		file: 'stylesheet.css'
	}); 

	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		console.log('message');
		chrome.tabs.sendMessage(tabs[0].id, 
			{school: document.querySelectorAll('input[type="text"]')[0].value,
			department: document.querySelectorAll('input[type="text"]')[1].value});
	});
}

document.getElementById('rmp-search').addEventListener('click', popup_search);
