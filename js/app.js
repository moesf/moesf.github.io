/* for cross-domain Ajax request */
var sony = sony || {};

sony = (function(){
	var currentCount = 1;
	var getCORS = function(url) {
		var success = function(response){	
			( new Function( 'return sony.' + response ) )();
		};
		var failure = function(error){
			var p = document.createElement('p')
			p.textContent =  error.message;
			document.getElementsByTagName('header')[0].appendChild(p);
		};
	    var request = new XMLHttpRequest();
	    request.open('GET', url);
	    request.onload = function(){
			if (request.status == 200) {
				success(request.response);
			} else {
				failure(Error(request.statusText));
			}    	
	    }
		request.onerror = function(){
			failure(Error('Issues happened when fetching data.'));
		};
	    request.send();
	};
	var pagination = function(link_self,link_prev,link_next,totalPages) {
	    	var prevPage = document.getElementById('prevPage');
	    	prevPage.innerHTML = '';
	    	var nextPage = document.getElementById('nextPage');
	    	nextPage.innerHTML = '';
	    	var currentPage = document.getElementById('currentPage');
	    	if (link_prev) {
	    		// 
	    		var link_back = document.createElement('a');
	    		link_back.setAttribute("href", link_prev);
	    		link_back.innerHTML = '&#60;';
	    		link_back.onclick = function(event){
	    			event.preventDefault();
	    			var url = link_prev+'&callback=formatData';
	    			getCORS(url);
	    			sony.currentCount--;
	    		};
	    		prevPage.appendChild(link_back);
	    		prevPage.style.display = 'inline-block';
	    	}
	    	if (link_next && sony.currentCount < totalPages) {
	    		var link_forward = document.createElement('a');
	    		link_forward.setAttribute("href", link_next);
	    		link_forward.innerHTML = '&#62;';
	    		link_forward.onclick = function(event){
	    			event.preventDefault();
	    			var url = link_next+'&callback=formatData';
	    			getCORS(url);
	    			sony.currentCount++;
	    		};
	    		nextPage.appendChild(link_forward);
	    		nextPage.style.display = 'inline-block';
	    	}
	    	currentPage.innerHTML = sony.currentCount;
	};
	var createData = function(stream) {
    	var previewImgSrc = stream.preview.medium;
    	var streamLink = stream._links.self;
    	var displayName = stream.channel.display_name;
    	var gameName = stream.channel.game;
    	var viewerCount = stream.viewers;
    	var description = stream.channel.status;
    	var data = '<tr><td class="previewImg">'
    		+ '<a href="'+streamLink+'">'
    		+ '<img src="'+previewImgSrc+'">' 
    		+ '</a>'
    		+ '</td><td class="details">' 
    		+ '<a href="'+streamLink+'">'
    		+ '<h2>'+displayName+'</h2>'
    		+ '</a>'
    		+ '<span class="gameName">' +gameName+ '</span> - '
    		+ '<span class="viewerCount">' +viewerCount+ ' viewers</span>'
    		+ '<p>' +description+ '</p>'
    		+ '</td></tr>';
    	return data;
	};
	var formatData = function(data) {
	    // JSON data in form of a JavaScript object
	    var link_self = data._links.self;
	    var link_prev = data._links.prev;
	    var link_next = data._links.next;
	    var streams = data.streams;
	    //console.log(streams)
	    document.getElementById("total").innerHTML = data._total;
		var totalPages = Math.ceil(data._total/10);
		document.getElementById("totalPages").innerHTML = totalPages;
	    pagination(link_self,link_prev,link_next,totalPages);

	    var table = document.createElement('table');
	    var dataRows = '';
	    for (var i=0; i<streams.length; i++) {
	    	dataRows += createData(streams[i]);
	    }
	    table.innerHTML= dataRows;
	    document.getElementById('dataList').innerHTML = '';
	    document.getElementById('dataList').appendChild(table);
	    document.getElementById('result').style.display = 'block';
	}
	var search = function(event) {
		event.preventDefault();
		var query = document.querySelector('#search-query').value;
		var url = 'https://api.twitch.tv/kraken/search/streams?q='+query+'&callback=formatData'
		getCORS(url);
	}
	// public API
	return {
		currentCount: currentCount,
		formatData: formatData,
		search: search		
	}
})();

document.querySelector('form').onsubmit = sony.search;
