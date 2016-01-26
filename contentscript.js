//User flow:
// 1. (Optional) Set school (maybe department)
// 2. Highlight text
// 3. Select professor
// 4. View scores
// 5. (Optional) Create new window to continue viewing scores 



/**
* Gets the text highlighted by user and returns it as a string
*/
function getSelectedText(){
	var sel = window.getSelection();
	var selectedText = sel.toString();
	return selectedText;
}

/**
* Given an array of HTML elements containing the names of professors,
* their schools, and a link to their Rate My Professor page,
* creates a new HTML element on current page showing information in given array
*/
function showProfessors(array){
	console.log(array);

	var sel = window.getSelection();
	var selRect = sel.getRangeAt(0).getBoundingClientRect();

	var popup = document.createElement('div');
	popup.setAttribute("id", "RMP_popup");

	popup.style.height = '300px';
	popup.style.width = '300px';
	popup.style.position = 'absolute';
	popup.style.zIndex = '900000000000'; //Is this necessarry? For now, need this to superimpose on current page

	if (selRect.top <= window.innerHeight - selRect.bottom){ //closer to top of window
		console.log('top');
		console.log(selRect.bottom);
		popup.style.top = selRect.bottom + parseInt(window.scrollY, 10) + 'px';
	}
	else{ //closer to bottom of window
		console.log('bottom');
		console.log(selRect.top);
		popup.style.top = selRect.top - 300 + parseInt(window.scrollY, 10) + 'px';
	}

	if (selRect.left <= window.innerWidth - selRect.right){ // closer to left of window
		console.log('left');
		popup.style.left = selRect.left + parseInt(window.scrollX, 10) + 'px';
	}
	else{ //closer to right of window
		console.log('right');
		popup.style.left = selRect.right - 300 + parseInt(window.scrollX, 10) + 'px';
	}

	
	document.body.appendChild(popup);
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
function getProfessors(name, school, department){
	// For case 1-3, we can just search normally

	// For case 4 and 5 (if there is an initial),
	// We search the last name, then filter by initial
	var xmlRequest = new XMLHttpRequest();
	xmlRequest.onreadystatechange = function(){
		if (xmlRequest.readyState == 4 && xmlRequest.status == 200){
			console.log(xmlRequest.responseText);
			var div = document.createElement('div');
			div.innerHTML = xmlRequest.responseText;
			var listings = div.getElementsByClassName('listing PROFESSOR');


		}
	}
	if (school === undefined) school = '';
	if (department === undefined) department = '';

	url = 'http://www.ratemyprofessors.com/search.jsp?queryBy=teacherName&queryoption=HEADER&facetSearch=true'
		+ '&query=' + name;
		+ '&schoolName=' + school
		+ '&dept=' + department;
	xmlRequest.open("GET", url, true);
	xmlRequest.send();
}

showProfessors('hi');