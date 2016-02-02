function popup_search() {
	console.log('click');
  chrome.tabs.executeScript({
    file: 'contentscript.js'
  });
  chrome.tabs.insertCSS(null, {
  	file: 'stylesheet.css'
  }); 
}

document.getElementById('rmp-search').addEventListener('click', popup_search);
