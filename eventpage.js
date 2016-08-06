chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	var xmlRequest = new XMLHttpRequest();
	xmlRequest.onreadystatechange = function(){
		if (xmlRequest.readyState == 4 && xmlRequest.status == 200){
			sendResponse({source: xmlRequest.responseText});
		}
	}
	xmlRequest.open("GET", request.query, true);
	xmlRequest.send();
	return true;
});