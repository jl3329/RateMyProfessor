//User flow:
// 1. (Optional) Set school (maybe department)
// 2. Highlight text
// 3. Select professor
// 4. View scores
// 5. (Optional) Create new window to continue viewing scores 



/*
* Gets the text highlighted by user and returns it as a string
*/
function getSelectedText(){
	var sel = window.getSelection();
	var selectedText = sel.toString();
	return selectedText;
}

/**
* Returns: Array of all professors that match given parameters and
* urls to their respective Rate My Professors page
*
* Supports following formats for name:
* 	1. First name Last name (Joe Smith)
*	2. Last name, First name (Smith, Joe)
*	3. Last name only (Smith)
*	4. First initial Last name (J Smith)
*	5. Last name, First initial (Smith, J)
*/
function getProfessors(name){
	// For case 1-3, we can just search normally

	// For case 4 and 5 (if there is an initial),
	// We search the last name, then filter by initial
	var xmlRequest = new XMLHttpRequest();

	xmlRequest.onreadystatechange = function(){
		if (xmlRequest.readyState == 4 && xmlRequest.status == 200){
			response = xmlRequest.responseXML;
			professors = response.getElementsByClassName('main');
			txt = '';
			for (i = 0; i < professors.length; i++) {
				txt += professors[i].childNodes[0].nodeValue + "<br>";
			}
			console.log(txt);
		}

		url = 'www.ratemyprofessors.com/search.jsp?queryBy=teacherName&queryoption=HEADER&facetSearch=true'
			+ '&query=' + name;
			// + '&schoolName=' + school
			// + &'dept=' + department;
		xmlhttp.open("GET", url, false);
		xmlhttp.send;
	}
}

function initialize() {
	document.addEventListener('mouseup', function() {
		console.log(getSelectedText());
	}, false);
}

initialize();