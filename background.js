// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(){
  // No tabs or host permissions needed!
  chrome.tabs.executeScript(null, {file:'contentscript.js'});
});