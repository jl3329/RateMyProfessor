function popup_search() {
	chrome.tabs.executeScript({
		file: 'contentscript.js'
	});
	chrome.tabs.insertCSS(null, {
		file: 'stylesheet.css'
	}); 

	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, 
			{school: document.querySelectorAll('input[type="text"]')[0].value,
			department: document.querySelectorAll('input[type="text"]')[1].value});
	});
	chrome.storage.sync.set(
		{'school': document.querySelectorAll('input[type="text"]')[0].value,
		'department': document.querySelectorAll('input[type="text"]')[1].value}
	);
}

document.body.onload = function(){
	chrome.storage.sync.get(['school','department'], function(items){
		if (items.school != undefined){
			document.querySelectorAll('input[type="text"]')[0].value = items.school;
		}
		if (items.department != undefined){
			document.querySelectorAll('input[type="text"]')[1].value = items.department;
		}
		
	});

	// chrome.storage.sync.get('department', function(items){
	// 	document.querySelectorAll('input[type="text"]')[1].value = items.department;
	// });

}


document.getElementById('rmp-search').addEventListener('click', popup_search);
