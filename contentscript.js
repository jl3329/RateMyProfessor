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
* Given an array of HTML nodes, a class name, and a div,
* clears all children of given div, then repopulates it with copies
* of the nodes in the array while changing the class of each node to newClass
*/
function updateDiv(nodeArray, newClass, div){
	div.innerHTML = ''; //clear old results
	for (i=0; i<nodeArray.length; i++){
		var newNode = nodeArray[i].cloneNode(true);
		newNode.className = newClass;
		div.appendChild(newNode);
	}
}

/**
* Given an array of HTML nodes, changes all the relative hrefs
* in the nodes to absolute hrefs, with the given base url
*/
function relativeURLtoAbsoluteURL(nodeArray, baseURL){
	for (i=0; i<nodeArray.length; i++){
		nodeArray[i].getElementsByTagName('a')[0].href = 
			baseURL + nodeArray[i].getElementsByTagName('a')[0].getAttribute('href');
	}
}

/**
* Given an array of HTML elements containing the names of professors,
* their schools, and a link to their Rate My Professor page,
* creates a new HTML element on current page showing information in given array
*/
function showProfessors(array, url, pages){
	var popup = document.createElement('div');
	popup.setAttribute("id", "rmp-popup");

	popup.style.height = '300px';
	popup.style.width = '300px';
	popup.style.position = 'absolute';
	popup.style.zIndex = '900000000000'; //Is this necessary? For now, need this to superimpose on current page

	var sel = window.getSelection();
	var selRect = sel.getRangeAt(0).getBoundingClientRect();


	if (selRect.top <= window.innerHeight - selRect.bottom){ //closer to top of window
		popup.style.top = selRect.bottom + parseInt(window.scrollY, 10) + 'px';
	}
	else{ //closer to bottom of window
		popup.style.top = selRect.top - 300 + parseInt(window.scrollY, 10) + 'px';
	}

	if (selRect.left <= window.innerWidth - selRect.right){ // closer to left of window
		popup.style.left = selRect.left + parseInt(window.scrollX, 10) + 'px';
	}
	else{ //closer to right of window
		popup.style.left = selRect.right - 300 + parseInt(window.scrollX, 10) + 'px';
	}

	if (array.length === 1){ //only one match, display professor's scores
		var prof = document.createElement('div');
		prof.setAttribute('id', 'rmp-prof-name');
		prof.innerHTML = array[0].getElementsByClassName('main')[0].innerHTML;
		popup.appendChild(prof);

		var deptAndSchool = document.createElement('div');
		deptAndSchool.setAttribute('id', 'rmp-school-name');
		deptAndSchool.innerHTML = array[0].getElementsByClassName('sub')[0].innerHTML;

		var url = 'http://www.ratemyprofessors.com'
			+ array[0].getElementsByTagName('a')[0].getAttribute('href');

		var xmlRequest = new XMLHttpRequest();
		xmlRequest.onreadystatechange = function(){
			if (xmlRequest.readyState == 4 && xmlRequest.status == 200){
				var div = document.createElement('div');
				div.innerHTML = xmlRequest.responseText;

				var overallScores = Array.prototype.slice.call( //get Nodelist of scores, turn to array
					div.getElementsByClassName('grade'), 0, 2);  
				var subscores = Array.prototype.slice.call(
					div.getElementsByClassName('rating'), 0, 3); 
				var allScores = overallScores.concat(subscores); //array containing all relevant scores
				var categories = ['Overall Grade', 'Average Grade Received', 
					'Helpfulness', 'Clarity', 'Easiness'];

				for (i=0; i<categories.length; i++){ //create divs
					scoreDiv = document.createElement('div');
					scoreDiv.className = 'rmp-score-div';

					scoreLabel = document.createElement('span');
					scoreLabel.innerHTML = categories[i];
					scoreLabel.className = 'rmp-score-label';
					scoreDiv.appendChild(scoreLabel);

					score = document.createElement('span');
					score.innerHTML = allScores[i].innerHTML;
					score.className = 'rmp-num-score';
					scoreDiv.appendChild(score);

					popup.appendChild(scoreDiv);				
				} 
			}
		}
		xmlRequest.open("GET", url, true);
		xmlRequest.send();
	}
	else if (array.length > 1){
		var wrapperDiv = document.createElement('div');
		wrapperDiv.className = 'rmp-result-wrapper';
		popup.appendChild(wrapperDiv);

		relativeURLtoAbsoluteURL(array, 'http://www.ratemyprofessors.com');
		updateDiv(array, 'rmp-result', wrapperDiv);

		if (pages.length > 0){ //if there are multiple pages, create button to show next page
			var currentPage = 0;
			var lastPage = pages[pages.length-1].innerHTML;

			var prevButton = document.createElement('BUTTON');
			prevButton.className = 'rmp-button';
			prevButton.innerHTML = 'PREV';
			prevButton.style.visibility = 'hidden'; //on first page, button is hidden
			popup.appendChild(prevButton);

			prevButton.onclick = function(){
				nextButton.style.visibility = 'visible';
				currentPage--;
				pageCount.innerHTML = 'Page ' + (currentPage+1) + ' of '+ lastPage;
				if (currentPage === 0){
					prevButton.style.visibility = 'visible';
				}

				var prevPageURL = url + '&max=20&offset=' + currentPage*20;
				console.log(prevPageURL);
				var xmlRequest = new XMLHttpRequest();
				xmlRequest.onreadystatechange = function(){
					if (xmlRequest.readyState == 4 && xmlRequest.status == 200){
						var div = document.createElement('div');
						div.innerHTML = xmlRequest.responseText;
						var listingsArray = div.getElementsByClassName('listing PROFESSOR');

						relativeURLtoAbsoluteURL(listingsArray, 'http://www.ratemyprofessors.com');
						updateDiv(listingsArray, 'rmp-result', wrapperDiv);
					}
				}
				xmlRequest.open("GET", prevPageURL, true);
				xmlRequest.send();
				
			}

			var pageCount = document.createElement('div');
			pageCount.className = 'rmp-page-count';
			pageCount.innerHTML = 'Page ' + (currentPage+1) + ' of '+ lastPage;
			popup.appendChild(pageCount);

			var nextButton = document.createElement('BUTTON');
			nextButton.className = 'rmp-button';
			nextButton.innerHTML = 'NEXT';
			popup.appendChild(nextButton);

			nextButton.onclick = function(){
				prevButton.style.visibility = 'visible';
				currentPage++;
				pageCount.innerHTML = 'Page ' + (currentPage+1) + ' of '+ lastPage;
				if (currentPage === lastPage-1){
					nextButton.style.visibility = 'hidden';
				}
				
				var nextPageURL = url + '&max=20&offset=' + currentPage*20;
				console.log(nextPageURL);
				var xmlRequest = new XMLHttpRequest();
				xmlRequest.onreadystatechange = function(){
					if (xmlRequest.readyState == 4 && xmlRequest.status == 200){
						var div = document.createElement('div');
						div.innerHTML = xmlRequest.responseText;
						var listingsArray = div.getElementsByClassName('listing PROFESSOR');

						relativeURLtoAbsoluteURL(listingsArray, 'http://www.ratemyprofessors.com');
						updateDiv(listingsArray, 'rmp-result', wrapperDiv);
					}
				}
				xmlRequest.open("GET", nextPageURL, true);
				xmlRequest.send();
			}
		}
	}
	else{ //no matches
		var notificationDiv = document.createElement('div');
		notificationDiv.setAttribute('id', 'rmp-notification');
		notificationDiv.innerHTML = 'Sorry, no professors found.';
		popup.appendChild(notificationDiv);
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
	if (school === undefined) school = '';
	if (department === undefined) department = '';

	url = 'http://www.ratemyprofessors.com/search.jsp?queryBy=teacherName&queryoption=HEADER&facetSearch=true'
		+ '&query=' + name
		+ '&schoolName=' + school
		+ '&dept=' + department;
	console.log(url);
	var xmlRequest = new XMLHttpRequest();
	xmlRequest.onreadystatechange = function(){
		if (xmlRequest.readyState == 4 && xmlRequest.status == 200){
			var div = document.createElement('div');
			div.innerHTML = xmlRequest.responseText;
			var listingsArray = div.getElementsByClassName('listing PROFESSOR');
			var pageArray = div.getElementsByClassName('step');
			showProfessors(listingsArray, url, pageArray);
		}
	}
	
	xmlRequest.open("GET", url, true);
	xmlRequest.send();
}
getProfessors('alex');