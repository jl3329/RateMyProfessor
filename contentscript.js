chrome.runtime.onMessage.addListener( function showPopup(request, sender, sendResponse) {
	url = 'http://www.ratemyprofessors.com/search.jsp?queryBy=teacherName&queryoption=HEADER&facetSearch=true'
	+ '&query=' + parseName(getSelectedText())
	+ '&schoolName=' + request.school
	+ '&dept=' + request.department;

	// response parameters:
	//source: responseText of XML HTTP Request to the given url
	chrome.runtime.sendMessage({query: url}, function(response) {
		var popup = createPopup('rmp-popup');

		var div = document.createElement('div'); //create fake div to search for HTML nodes
		div.innerHTML = response.source;
		var resultsArray = div.getElementsByClassName('listing PROFESSOR');

		if (resultsArray.length === 1){ //only one match, display professor's scores
			var prof = document.createElement('div');
			prof.setAttribute('id', 'rmp-prof-name');
			prof.innerHTML = resultsArray[0].getElementsByClassName('main')[0].innerHTML;
			popup.appendChild(prof);

			var deptAndSchool = document.createElement('div');
			deptAndSchool.setAttribute('id', 'rmp-school-name');
			deptAndSchool.innerHTML = resultsArray[0].getElementsByClassName('sub')[0].innerHTML;

			var profUrl = 'http://www.ratemyprofessors.com'
				+ resultsArray[0].getElementsByTagName('a')[0].getAttribute('href');

			chrome.runtime.sendMessage({query:profUrl}, function(response){
				var div = document.createElement('div');
				div.innerHTML = response.source;
				if (div.getElementsByClassName('dosanddonts').length === 0){ //dosanddonts class only present if professor has no ratings
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
				else{
					var notificationDiv = document.createElement('div');
					notificationDiv.setAttribute('id', 'rmp-notification');
					notificationDiv.innerHTML = 'Sorry, this professor has no ratings yet.';
					popup.appendChild(notificationDiv);
				}
			});
		}
		else if (resultsArray.length>1){ //multiple results
			var wrapperDiv = document.createElement('div');
			wrapperDiv.className = 'rmp-result-wrapper';
			popup.appendChild(wrapperDiv);

			relativeURLtoAbsoluteURL(resultsArray, 'http://www.ratemyprofessors.com');
			updateDiv(resultsArray, 'rmp-result', wrapperDiv);
			var pageArray = div.getElementsByClassName('step'); //empty means only 1 page of results

			if (pageArray.length>0){ //create buttons to navigate thru results
				var currentPage = 0;
				var lastPage = pageArray[pageArray.length-1].innerHTML;

				var prevButton = document.createElement('BUTTON');
				prevButton.className = 'rmp-button';
				prevButton.innerHTML = 'PREV';
				prevButton.style.visibility = 'hidden'; //on first page, button is hidden
				popup.appendChild(prevButton);

				var pageCount = document.createElement('div');
				pageCount.className = 'rmp-page-count';
				pageCount.innerHTML = 'Page ' + (currentPage+1) + ' of '+ lastPage;
				popup.appendChild(pageCount);

				var nextButton = document.createElement('BUTTON');
				nextButton.className = 'rmp-button';
				nextButton.innerHTML = 'NEXT';
				popup.appendChild(nextButton);

				var changePage = function(){
					pageCount.innerHTML = 'Page ' + (currentPage+1) + ' of '+ lastPage;
					if (currentPage === lastPage-1){nextButton.style.visibility = 'hidden';}
					if (currentPage === 0){prevButton.style.visibility = 'hidden';}
					
					var pageURL = url + '&max=20&offset=' + currentPage*20;
					chrome.runtime.sendMessage({query:pageURL}, function(response){
						var div = document.createElement('div');
						div.innerHTML = response.source;
						var resultsArray = div.getElementsByClassName('listing PROFESSOR');

						relativeURLtoAbsoluteURL(resultsArray, 'http://www.ratemyprofessors.com');
						updateDiv(resultsArray, 'rmp-result', wrapperDiv);
					});
				}

				nextButton.onclick = function(){
					prevButton.style.visibility = 'visible';
					currentPage++;
					changePage();
				}

				prevButton.onclick = function(){
					nextButton.style.visibility = 'visible';
					currentPage--;
					changePage();
				}
			}
		}
		else{ //no matches
			var notificationDiv = document.createElement('div');
			notificationDiv.setAttribute('id', 'rmp-notification');
			notificationDiv.innerHTML = 'Sorry, no professors found.';
			popup.appendChild(notificationDiv);
		}

		var remove = function (event){ //remove popup if user clicks outside it
			if (event.target != popup && event.target.parentNode != popup){
				document.body.removeChild(popup);
				window.removeEventListener('mouseup', remove);
			}
		}	
		window.addEventListener('mouseup', remove);
		chrome.runtime.onMessage.removeListener(showPopup);
	});
});

/**
* Gets the text highlighted by user and returns it as a string
*/
function getSelectedText(){
	var sel = window.getSelection();
	var selectedText = sel.toString();
	return selectedText;
}

/**
* Given a full name in one of the following formats, 
* returns the full name in First name (Middle name) Last name format.
* 	1. First name Last name (Joe Smith)
*	2. Last name, First name (Smith, Joe)
*	3. First name Middle name Last name (Joe Tom Smith)
*	4. Last name, First name Middle name (Smith, Joe Tom)
*
* Given a full name and middle initial, returns the full name in
* First name Last name format
*	5. First name Middle initial Last name (Joe T Smith)
*	6. Last name, First name Middle initial (Smith, Joe T)
* 
* Given a last name (and first initial) in one of the following formats, 
* returns the last name.
*	7. Last name only (Smith)
*	8. First initial Last name (J Smith)
*	9. Last name, First initial (Smith, J)
*/
function parseName(name){
	var comma = name.indexOf(',');
	if (comma !== -1){ //comma in input, must be parsed
		var beforeComma = name.slice(0, comma);
		beforeComma = beforeComma.replace(/\s+/g,' ').trim();
		var beforeArray = beforeComma.split(' ');

		var afterComma = name.slice(comma+1);
		afterComma = afterComma.replace(/\s+/g,' ').trim();
		var afterArray = afterComma.split(' ');

		var newName
		if (beforeArray.length === afterArray.length){ //No middle initial or name
			if (afterArray[0].length === 1) {newName = beforeArray[0];} //Only first initial
			else {newName = afterArray[0] + ' ' + beforeArray[0];} //Full first name
		}
		else if (beforeArray.length > afterArray.length){ //Middle initial or name before comma
			if (beforeArray[0].length === 1){ //middle initial
				newName = afterArray[0]+' '+beforeArray[1];
			}
			else{ //middle name
				newName = afterArray[0]+' '+beforeArray[0]+' '+beforeArray[1];
			}
		}
		else{ //Middle initial or name after comma 
			if (afterArray[1].length === 1){ //Middle initial
				newName = afterArray[0]+' '+beforeArray[0];
			}
			else{ //Middle name
				newName = afterArray[0]+' '+afterArray[1]+' '+beforeArray[0];
			}
		}
	}	
	else{  //No comma
		//replace all sequential spaces with single space
		//also removes spaces at ends of name
		var newName = name.replace(/\s+/g,' ').trim();
		nameArray = newName.split(' ');
		if (nameArray.length === 3 && nameArray[1].length === 1){ //middle initial exists
			newName = nameArray[0] + ' ' + nameArray[2];
		}
		else if (nameArray[0].length === 1){ //first initial only
			newName = nameArray[1];
		}
	}
	return newName;
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
* Given an id, create a div positioned below the user's selected text
* If selected text is closer to the left side of the page, div will lineup with
* the left edge of the selected text and vice-versa
* Returns created popup.
*/
function createPopup(id){
	var popup = document.createElement('div');
	popup.setAttribute("id", id);

	//get bounding box of selected text and position popup
	var sel = window.getSelection();
	var selRect = sel.getRangeAt(0).getBoundingClientRect(); 

	popup.style.top = selRect.bottom 
		+ parseInt(window.scrollY, 10) + 'px';
	
	if (selRect.left <= window.innerWidth - selRect.right){ // closer to left of window
		popup.style.left = selRect.left 
			+ parseInt(window.scrollX, 10) + 'px';
	}
	else{ //closer to right of window
		popup.style.right = window.innerWidth - selRect.right
			+ parseInt(window.scrollX, 10) + 'px';
	}
	document.body.appendChild(popup);
	return popup;
}

