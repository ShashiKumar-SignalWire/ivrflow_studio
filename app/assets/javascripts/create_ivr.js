var totalItem = 1;
var selectNode;
var GOTOData = [];
var IvrStudioId;
$('document').ready(function () {
	IvrStudioId = window.location.pathname.split("/")[2];
	let DbIVRData = getIvrStudioData();
	tmpIVRData = JSON.parse(DbIVRData.replace(/u003e/g,'"')).ivr_data;

     
	if (tmpIVRData) {
		totalItem = JSON.parse(DbIVRData).total_item;
		tmpGOTOData = JSON.parse(DbIVRData.replace(/u003e/g,'"')).goto_data;
		IVRData = JSON.parse(tmpIVRData);
		GOTOData = JSON.parse(tmpGOTOData);
		
	}

	createTreeMapData();
	new Treant(chart_config);


	if (GOTOData.length > 0) {
		updateGOTOData();
		drawLine();
	}

	$('.node.node_ivr_flow_data').click(function () {
		selectNode = this;
		reset();
		$('#nodeSelect').hide();
		$('#ivrFlowModal').modal('show');
		if ($(this).attr("id") == "1") {
			$('button#editBtn').prop('disabled', true);
			$('button#deleteBtn').prop('disabled', true);
		}
		if ($(this).text().startsWith("Hangup")) {
			$('button#addBtn').prop('disabled', true);
		}
		GOTOData.forEach(data => {
			if ($(this).attr("id") == data.split("-")[0])
			{
				$('button#addBtn').prop('disabled', true);
			}
		});
		
		IVRData.forEach(data => {
			if (data.parent == selectNode.id) {
				$('button#addBtn').prop('disabled', true);
			}
		});
		$('.inputBtnHolder').show();
	})

})

function getIvrStudioData() {
	let xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", '/ivr_studios/' + IvrStudioId + '.json', false); // false for synchronous request
	xmlHttp.send(null);
	return xmlHttp.responseText;
}
function addOrupdatIvrStudioData(ivrStudioData) {
	const XHR = new XMLHttpRequest();
	let urlEncodedData = "",
		urlEncodedDataPairs = [],
		name;
	for (name in ivrStudioData) {
		urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(JSON.stringify(ivrStudioData[name])));
	}
	urlEncodedDataPairs.push(encodeURIComponent('ivr_studio') + '=' + encodeURIComponent(ivrStudioData));
	urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');
	// Set up our request
	XHR.open('PUT', '/update_ivr_flow/' + IvrStudioId);
	// Add the required HTTP header for form data POST requests
	XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
	// Finally, send our data.
	XHR.send(urlEncodedData);
}

function addNodeModal() {
	if (selectNode !== undefined) {
		$('.addWindow').show();
		$('.inputBtnHolder').hide();
		$('#nodeSelect').show();
		$('#edit-btn').hide();
		$('#save-btn').show();
		$('#delelte-btn').hide();
		$("#selectAction").text("Enter Node details to Add");
		$('#select-gather-nodes-div').show();
	}
}
function deleteNodeModal() {
	if (selectNode !== undefined) {
		$('#edit-btn').hide();
		$('#save-btn').hide();
		$('#delete-btn').show();
		$('.inputBtnHolder').hide();
		$('.deleteWindow').show();
		$('#nodeSelect').hide();
		$("#selectAction").text("Delete Node");
	}
}

function editNodeModal() {
	if (selectNode !== undefined) {
		$('.inputBtnHolder').hide();
		$('.addWindow').show();
		$('#save-btn').hide();
		$('#edit-btn').show();
		$('#delelte-btn').hide();
		$("#selectAction").text("Enter Node details to Edit");
		$('#nodeSelect').hide();
		//$("#select-menu").hide();
		$('#select-gather-nodes-div').hide();
		createEditConainerforNode();
	}
}


//called while saving the node
function saveNode(param) {
	switch (param) {
		case 'add':
			addNode();
			createTreeMapData();
			break;
		case 'delete':
			deleteNode();
			createTreeMapData();
			break;
		case 'edit':
			editNode();
			createTreeMapData();
			break;
	}

	$('#ivrFlowModal').modal('hide');

	$('#basic-example').empty();
	new Treant(chart_config);
	$('.node.node_ivr_flow_data').click(function () {
		reset();
		$('#nodeSelect').hide();
		$('.node.node_ivr_flow_data').removeClass('selected');
		selectNode = this;
		$(this).addClass('selected');
		$('#ivrFlowModal').modal('show');

		if ($(this).attr("id") == "1") {
			$('button#editBtn').prop('disabled', true);
			$('button#deleteBtn').prop('disabled', true);
		}
		if ($(this).text().startsWith("Hangup")) {
			$('button#addBtn').prop('disabled', true);
		}
		GOTOData.forEach(data => {
			if ($(this).attr("id") == data.split("-")[0])
			{
				$('button#addBtn').prop('disabled', true);
			}
		});
		IVRData.forEach(data => {
			if (data.parent == selectNode.id) {
				$('button#addBtn').prop('disabled', true);
			}
		});
		$('.inputBtnHolder').show();
	});
	var saveData = { "ivr_data": IVRData, "select_node": "1", "total_item": totalItem, "goto_data": GOTOData }

	addOrupdatIvrStudioData(saveData);
	updateGOTOData();
	drawLine();
}


// Switch case
function createEditConainerforNode() {
	for (var i = 1; i < IVRData.length; i++) {
		if (IVRData[i].id == $(selectNode).attr("id")) {
			$('#select-container-' + IVRData[i].name.toLowerCase()).show();
			switch (IVRData[i].name) {
				case "Play":
					$('#play-name').val(IVRData[i].nodeName);
					$('#play-content-text').val(IVRData[i]['play-text-value']);
					$('#play-loop-count').val(IVRData[i]['play-loop-count']);
					break;
				case "Say":
					$('#say-name').val(IVRData[i].nodeName);
					$("textarea[name=say-content-text]").val(IVRData[i]['say-text-value']);
					$('#say-loop-count').val(IVRData[i]['say-loop-count']);
					$('#say-voice').val(IVRData[i]['say-voice']);
					$('#alice-say-language').val(IVRData[i]['alice-say-language']);
					break;
				case "Gather":
					$('#gather-name').val(IVRData[i].nodeName);
					$("textarea[name=gather-say-content-text]").val(IVRData[i]['say-text-value']);
					$('#gather-play-content-text').val(IVRData[i]['play-text-value']);
					$('#say').removeClass('active');
					$('#say').removeClass('show');
					$('#say-tab').removeClass('active');
					$('#play').removeClass('active');
					$('#play').removeClass('show');
					$('#play-tab').removeClass('active');
					if(IVRData[i]['play-text-value']){
						$('#play').addClass('active');
						$('#play').addClass('show');
						$('#play-tab').addClass('active');
					}
					if(IVRData[i]['say-text-value']){
						$('#say').addClass('active');
						$('#say').addClass('show');
						$('#say-tab').addClass('active');
					}
					break;
				case "Hangup":
					$('#hangup-name').val(IVRData[i].nodeName);
					break;
				case "Queue":
					$('#queue-name').val(IVRData[i].nodeName);
					$("#queue-content").val(IVRData[i]['queue-name']);
					break;
				case "Record":
					$('#record-name').val(IVRData[i].nodeName);
					$("#record-content").val(IVRData[i]['record-name']);
					break;
				case "Conference":
					$('#conference-name').val(IVRData[i].nodeName);
					$("#conference-content").val(IVRData[i]['conference-name']);
					break;
				case "Dial":
					$('#dial-name').val(IVRData[i].nodeName);
					$("#dial-content").val(IVRData[i]['dial-numbers']);
					break;
				case "Digit":
					$('#edit-digit-name').val(IVRData[i].nodeName);
					$('#edit-digit').val(IVRData[i].digit);
					$('#gather-nodes-digit-div-container').show();
					break;
				case "Weekdays":
					$("input[id=txtWeekDaysNodeName]").val(IVRData[i].nodeName);
					var editSelectedDays = IVRData[i].SelectedDays.split(",");
					$(".weekdays").each(function () {
						if (jQuery.inArray($(this).val(), editSelectedDays) != -1) {
							$(this).prop("checked", true);

						} else {
							$(this).prop("checked", false);
						}
					});
					break;
				case "Timings":
					$("#timings-name").val(IVRData[i].nodeName);
					for (var j = 1; j < IVRData.length; j++) {
						if(IVRData[i].id == IVRData[j].parent){
							if(IVRData[j]['nodeName'] == 'SelectedTime'){
								$("#start-time").val(IVRData[j]['StartTime']);
								$("#end-time").val(IVRData[j]['EndTime']);
							}
						}
					}
					break;
			}
		}
	}
}


function onSelectGotoNode() {
	$('#ivrFlowModal').modal('hide');
	var fromNode = $(selectNode).attr("id");
	var toNode = $("#select-goto").val();
	createGOTOData(fromNode, toNode);
	drawLine();

}

function createGOTOData(fromNode, toNode) {
	if (GOTOData.indexOf(fromNode + "-" + toNode) == -1) {
		GOTOData.push(fromNode + "-" + toNode);
	}
	var saveData = { "ivr_data": IVRData, "select_node": "1", "total_item": totalItem, "goto_data": GOTOData }
	addOrupdatIvrStudioData(saveData);
}


function createInputAddContainer() {
	if ($('#nodeSelect').val() != null && $('#nodeSelect').val() != undefined) {

		//$('#save-btn').show();
		if ($('#nodeSelect').val() == "Goto") {
			var innerHTML = '<select class="form-select" id="select-goto"  onchange="onSelectGotoNode()">'
			innerHTML += '<option value="" selected disabled>Select node to GO</option>';
			for (var i = 0; i < IVRData.length; i++) {
				innerHTML += '<option value="' + IVRData[i].id + '">' + IVRData[i].name + ' - ' + IVRData[i].nodeName + '</option>';
			}
			innerHTML += '</select>';
			$('#goto-nodes-div-container').empty().append(innerHTML).show();
		} else {
			$('#goto-nodes-div-container').empty().hide();
		}
		$('#nodeSelect').hide();
		$('#select-container-' + $('#nodeSelect').val().toLowerCase()).show();

		$('#selectAction').text("Selected item : " + $('#nodeSelect').val());
	}

}



function updateGOTOData() {

	for (var i = 0; i < GOTOData.length; i++) {
		var firstMatch = false;
		var secondMatch = false;
		var firstElem = GOTOData[i].split("-")[0];
		var secondElem = GOTOData[i].split("-")[1];
		for (var j = 0; j < IVRData.length; j++) {

			if (IVRData[j].id == firstElem)
				firstMatch = true;
			if (IVRData[j].id == secondElem)
				secondMatch = true;
		}
		if (!(firstMatch && secondMatch)) {
			GOTOData.splice(i, 1);
			i--;
		}
	}
}


//Switch case
function editNodeSwitchCase(i){
	switch (IVRData[i].name) {
		case "Play":
			IVRData[i]['play-text-value'] = $('#play-content-text').val();
			IVRData[i].nodeName = $("#play-name").val();
			IVRData[i]['play-loop-count'] = $('#play-loop-count').val();
			break;
		case "Say":
			IVRData[i]['say-text-value'] = $("textarea[name=say-content-text]").val();
			IVRData[i].nodeName = $("#say-name").val();
			IVRData[i]['say-loop-count'] = $('#say-loop-count').val();
			IVRData[i]['alice-say-language'] = $('#alice-say-language').val();
			IVRData[i]['say-voice'] = $('#say-voice').val();
			break;
		case "Gather":
			IVRData[i]['say-text-value'] = $("textarea[name=gather-say-content-text]").val();
			IVRData[i]['play-text-value'] = $('#gather-play-content-text').val();
			IVRData[i].nodeName = $("#gather-name").val();
			break;
		case "Hangup":
			IVRData[i].nodeName = $("#hangup-name").val();
			break;
		case "Queue":
			IVRData[i].nodeName = $("#queue-name").val();
			IVRData[i]['queue-name'] = $("#queue-content").val();
			break
		case "Record":
			IVRData[i].nodeName = $("#record-name").val();
			IVRData[i]['record-name'] = $("#record-content").val();
			break
		case "Conference":
			IVRData[i].nodeName = $("#conference-name").val();
			IVRData[i]['conference-name'] = $("#conference-content").val();
			break
		case "Dial":
			IVRData[i].nodeName = $("#dial-name").val();
			IVRData[i]['dial-numbers'] = $("#dial-content").val();
			break;
		case "Digit":
			IVRData[i].nodeName = $("#edit-digit-name").val();
			for (var j = 0; j < IVRData.length; j++) {
				if (IVRData[i].parent == IVRData[j].id) {
					IVRData[j].validKeys = IVRData[j].validKeys.replace(IVRData[i]['digit'], $("#edit-digit").val());
					break;
				}
			}
			IVRData[i]['digit'] = $("#edit-digit").val();
			break;
		case "Weekdays":
			IVRData[i].nodeName = $("#txtWeekDaysNodeName").val();

			var selectedDays = "";
			var notSelectedDays = "";
			$(".weekdays").each(function () {
				if ($(this).prop("checked") == true) {
					selectedDays = selectedDays + $(this).val() + ",";
				}
				else {
					notSelectedDays = notSelectedDays + $(this).val() + ",";
				}
			});
			IVRData[i].SelectedDays = selectedDays;
			break;
		case "Days":
			var selectedDays = "";
			var notSelectedDays = "";
			if (IVRData[i].nodeName == "SelectedDays"){
				$(".weekdays").each(function () {
					if ($(this).prop("checked") == true) {
						selectedDays = selectedDays + $(this).val() + ",";
					}
				});
				IVRData[i].SelectedDays = selectedDays;
			}
			if (IVRData[i].nodeName == "NotSelectedDays"){
				$(".weekdays").each(function () {
					if ($(this).prop("checked") == false) {
						notSelectedDays = notSelectedDays + $(this).val() + ",";
					}
				});
				IVRData[i].NotSelectedDays = notSelectedDays;
			}
			break;
		case "Timings":
			IVRData[i].nodeName = $("#timings-name").val();
			break;
		case "SelectedTime":
			IVRData[i].StartTime = $("#start-time").val();
			IVRData[i].EndTime = $("#end-time").val();
			break;
	}
}

	
function editNode() {
	for (var i = 1; i < IVRData.length; i++) {
		if (IVRData[i].id == $(selectNode).attr("id")) {
			editNodeSwitchCase(i);
			if (IVRData[i].name == "Timings"){
				for(j=1;j<IVRData.length; j++){
					if(IVRData[i].id == IVRData[j].parent){
						if(IVRData[j].name == "SelectedTime"){
							editNodeSwitchCase(j);
						}
					}
				}
			}
			if (IVRData[i].name == "Weekdays"){
				for(j=1;j<IVRData.length; j++){
					if(IVRData[i].id == IVRData[j].parent){
						if(IVRData[j].nodeName == "SelectedDays"){
							editNodeSwitchCase(j);
						}
						if(IVRData[j].nodeName == "NotSelectedDays"){
							editNodeSwitchCase(j);
						}
					}
					
				}
			}
		}
	}
}

function addNode() {
	switch ($('#nodeSelect').val()) {
		case 'Play':
			var id = ++totalItem;
			IVRData.push({
				"id": id,
				"name": "Play",
				"nodeName": $("input[id=play-name]").val(),
				"parent": +$(selectNode).attr("id"),
				"play-text-value": $('#play-content-text').val(),
				"play-loop-count": $('#play-loop-count').val()	
			});
			break;
		case 'Say':
			var id = ++totalItem;
			IVRData.push({
				"id": id,
				"name": "Say",
				"nodeName": $("input[id=say-name]").val(),
				"parent": +$(selectNode).attr("id"),
				"say-text-value": $("textarea[name=say-content-text]").val(),
				"say-loop-count": $('#play-loop-count').val(),
				"say-voice": $('#say-voice').val(),
				"alice-say-language": $('#alice-say-language').val()
			});
			break;
		case 'Queue':
			var id = ++totalItem;
			IVRData.push({
				"id": id,
				"name": "Queue",
				"nodeName": $("#queue-name").val(),
				"parent": +$(selectNode).attr("id"),
				"queue-name": $("#queue-content").val()
			});
			break;
		case 'Record':
			var id = ++totalItem;
			IVRData.push({
				"id": id,
				"name": "Record",
				"nodeName": $("#record-name").val(),
				"parent": +$(selectNode).attr("id"),
				"record-name": $("#record-content").val()
			});
			break;
		case 'Conference':
			var id = ++totalItem;
			IVRData.push({
				"id": id,
				"name": "Conference",
				"nodeName": $("#conference-name").val(),
				"parent": +$(selectNode).attr("id"),
				"conference-name": $("#conference-content").val()
			});
			break;
		case 'Dial':
			var id = ++totalItem;
			IVRData.push({
				"id": id,
				"name": "Dial",
				"nodeName": $("#dial-name").val(),
				"parent": +$(selectNode).attr("id"),
				"dial-numbers": $("#dial-content").val()
			});
			IVRData.push({
				"id": ++totalItem,
				"name": "DialSuccess",
				"nodeName": "Success",
				"parent": id
			});
			IVRData.push({
				"id": ++totalItem,
				"name": "DialFailed",
				"nodeName": "Failed",
				"parent": id
			});
			break;
		case 'Hangup':
			var id = ++totalItem;

			IVRData.push({
				"id": id,
				"name": "Hangup",
				"nodeName": $('#hangup-name').val(),
				"parent": +$(selectNode).attr("id")
			});
			break;
		case 'Gather':
			var id = ++totalItem;
			var validKeys = "";

			$('input#digit[type=number]').each(function (index, elem) {
				if (validKeys.length != 0)
					validKeys += ",";
				validKeys += $(elem).val();
			});

			IVRData.push({
				"id": id,
				"name": "Gather",
				"nodeName": $("input[id=gather-name]").val(),
				"parent": +$(selectNode).attr("id"),
				"validKeys": validKeys,
				"say-text-value": $("textarea[name=gather-say-content-text]").val(),
				"play-text-value": $('#gather-play-content-text').val(),
				"voiceClip": "clip"//$("#select-menu-url-valid").val().split("\\").pop(),
			});
			if (+$('#select-gather-nodes').val() > 0) {
				$('.selected-gather-digits').each(function (index, elem) {
					var childId = ++totalItem
					IVRData.push({
						"id": childId,
						"name": "Digit",
						"nodeName": $(elem).find('.input-digits-value').find('input#digit-name[type=text]').val(),
						"digit": +$(elem).find('.input-digits-value').find('input#digit[type=number]').val(),
						"parent": id
					});

				});
				var childId = ++totalItem;
				IVRData.push({
					"id": childId,
					"name": "Digit",
					"nodeName": "Invalid Digit",
					"digit": "invalid",
					"parent": id
				});
			}
			break;
		case "Weekdays":
			var id = ++totalItem;
			var selectedDays = "";
			var notSelectedDays = "";

			$(".weekdays").each(function () {
				if ($(this).prop("checked") == true) {
					selectedDays = selectedDays + $(this).val() + ",";
				}
				else {
					notSelectedDays = notSelectedDays + $(this).val() + ",";
				}
			});

			IVRData.push({
				"id": id,
				"name": "Weekdays",
				"nodeName": $("#txtWeekDaysNodeName").val(),
				"SelectedDays": selectedDays,
				"NotSelectedDays": notSelectedDays,
				"parent": +$(selectNode).attr("id")

			});
			IVRData.push({
				"id": ++totalItem,
				"name": "Days",
				"nodeName": "SelectedDays",
				"SelectedDays": selectedDays,
				"parent": id
			});


			IVRData.push({
				"id": ++totalItem,
				"name": "Days",
				"nodeName": "NotSelectedDays",
				"NotSelectedDays": notSelectedDays,
				"parent": id
			});
			break;
		case "Timings":
			var id = ++totalItem;

			let startTime = $("#start-time").val();
			let endTime = $("#end-time").val();
			IVRData.push({
				"id": id,
				"name": "Timings",
				"nodeName": $("input[id=timings-name]").val(),
				"parent": +$(selectNode).attr("id")

			});



			IVRData.push({
				"id": ++totalItem,
				"name": "SelectedTime",
				"nodeName": "SelectedTime",
				"StartTime": startTime,
				"EndTime": endTime,
				"parent": id
			});

			IVRData.push({
				"id": ++totalItem,
				"name": "RemainingTime",
				"nodeName": "RemainingTime",
				"StartTime": startTime,
				"EndTime": endTime,
				"parent": id
			});

			break;
	}
}


var foundNode = false;
function createTreeMapData() {
	chart_config.nodeStructure = JSON.parse(JSON.stringify(nodeStructure));
	for (var i = 1; i < IVRData.length; i++) {
		iterate(chart_config.nodeStructure, IVRData[i]);
		foundNode = false;
	}
}

function iterate(obj, childObj) {
	for (var property in obj) {
		if (obj.hasOwnProperty(property)) {

			if (property == "HTMLid" && obj[property] == childObj.parent) {
				foundNode = true;
			}

			if (typeof obj[property] == "object") {
				if (!foundNode) {
					iterate(obj[property], childObj);
				} else {
					if (property == "children") {
						createNode(obj[property], childObj);
						foundNode = false;
					}
				}
			}
		}
	}

}
//Switch case
//create the actual data feed for TreeMap function for creating/drawing a node structure in UI
function createNode(obj, childObj) {
	var tempObj = {};
	switch (childObj.name) {
		case "Play":
			tempObj = {
				"HTMLid": childObj.id,
				"text": {
					"name": childObj.name,
					"nodeName": childObj.nodeName
				},
				"stackChildren": true,
				"children": []
			}
			break;
		case "Say":
			tempObj = {
				"HTMLid": childObj.id,
				"text": {
					"name": childObj.name,
					"nodeName": childObj.nodeName
				},
				"stackChildren": true,
				"children": []
			}
			break;
		case "Queue":
			tempObj = {
				"HTMLid": childObj.id,
				"text": {
					"name": childObj.name,
					"nodeName": childObj.nodeName
				},
				"stackChildren": true,
				"children": []
			}
			break;
		case "Record":
			tempObj = {
				"HTMLid": childObj.id,
				"text": {
					"name": childObj.name,
					"nodeName": childObj.nodeName
				},
				"stackChildren": true,
				"children": []
			}
			break;
		case "Conference":
			tempObj = {
				"HTMLid": childObj.id,
				"text": {
					"name": childObj.name,
					"nodeName": childObj.nodeName
				},
				"stackChildren": true,
				"children": []
			}
			break;
		case "Dial":
			tempObj = {
				"HTMLid": childObj.id,
				"text": {
					"name": childObj.name,
					"nodeName": childObj.nodeName
				},
				"stackChildren": true,
				"children": []
			}
			break;
		case "DialSuccess":
			tempObj = {
				"HTMLid": childObj.id,
				"text": {
					"name": childObj.name,
					"nodeName": childObj.nodeName
				},
				"stackChildren": true,
				"children": []
			}
			break;
		case "DialFailed":
			tempObj = {
				"HTMLid": childObj.id,
				"text": {
					"name": childObj.name,
					"nodeName": childObj.nodeName
				},
				"stackChildren": true,
				"children": []
			}
			break;
		case "Hangup":
			tempObj = {
				"HTMLid": childObj.id,
				"text": {
					"name": childObj.name,
					"nodeName": childObj.nodeName
				},
				"stackChildren": true,
				"children": []
			}
			break;
		case "Gather":
			tempObj = {
				"HTMLid": childObj.id,
				"text": {
					"name": childObj.name,
					"nodeName": childObj.nodeName

				},
				"stackChildren": true,
				"children": []
			}

			break;
		case "Digit":
			tempObj = {
				"HTMLid": childObj.id,
				"text": {
					"name": childObj.name,
					"nodeName": childObj.nodeName

				},
				"stackChildren": true,
				"children": []
			}

			break;
		case "Weekdays":
			tempObj = {
				"HTMLid": childObj.id,
				"text": {
					"name": childObj.nodeName
				},
				"stackChildren": true,
				"children": []
			}
			break;
		case "Days":
			tempObj = {
				"HTMLid": childObj.id,
				"text": {
					"name": childObj.nodeName
				},
				"stackChildren": true,
				"children": []
			}

			break;
		case "Timings":
			tempObj = {
				"HTMLid": childObj.id,
				"text": {
					"name": childObj.name,
					"nodeName": childObj.nodeName
				},
				"stackChildren": true,
				"children": []
			}

			break;
		case "SelectedTime":
			tempObj = {
				"HTMLid": childObj.id,
				"text": {
					"name": childObj.nodeName
				},
				"stackChildren": true,
				"children": []
			}

			break;
		case "RemainingTime":
			tempObj = {
				"HTMLid": childObj.id,
				"text": {
					"name": childObj.nodeName
				},
				"stackChildren": true,
				"children": []
			}

			break;
	}
	obj.push(tempObj);
}


//utility to truncate the characters upto length specified in check (second) parameter
function truncateValue(val, check) {
	if (!check)
		return val;
	if (val !== undefined && val.length > 24)
		return val.substr(0, 20) + "...";
	else
		return val;

}

//Delete node
function deleteNode() {

	for (var i = 1; i < IVRData.length; i++) {
		if (IVRData[i].id == +$(selectNode).attr("id") || IVRData[i].parent == +$(selectNode).attr("id")) {
			IVRData.splice(i, 1);
			i--;
		}
	}
}

function drawLine() {

	setTimeout(function () {

		jsPlumb.ready(function () {
			jsPlumb.reset();
		});

		for (var i = 0; i < GOTOData.length; i++) {

			var firstElem = GOTOData[i].split("-")[0];
			var secondElem = GOTOData[i].split("-")[1];

			jsPlumb.ready(function () {
				jsPlumb.connect({
					//connector: ["Straight"],
					connector: ["Flowchart",
						{
							cornerRadius: 10,
							stub: 16
						}
					],
					overlays: [["Arrow", { location: 1, width: 10, length: 10 }]],
					source: firstElem,
					target: secondElem,
					anchor: ["Left", "Right"],
					endpoint: "Blank"
				});
			});


		}


	}, 500);


}



var main_item = {
	"Digit": {
		"description": "name",
		"param": [{
			name: "digit",
			type: "number"
		}],
		"showdropdown": true
	}
}

function createDigitContainer() {

	if ($('#select-gather-nodes').val() != null && $('#select-gather-nodes').val() != undefined) {
		var innerHTML = '';
		for (var i = 0; i < +$('#select-gather-nodes').val(); i++) {
			innerHTML += '<div class="row g-3 align-items-center selected-gather-digits">'
			for (var j = 0; j < main_item["Digit"].param.length; j++) {
				innerHTML += '<div class="col-auto input-digits-value"><label for="digit" class="col-form-label">' + (i + 1) + ':</label></div>'
				innerHTML += '<div class="col-auto input-digits-value"><input type="text" name="digit-name" class="form-control" id="digit-name" placeholder="Enter node name" value=""/></div>';
				innerHTML += '<div class="col-auto input-digits-value"><input type="' + main_item["Digit"].param[j].type + '" min="0" name="digit" class="form-control" id="digit" placeholder="' + main_item["Digit"].param[j].name + '" value=""/></div>';
			}
			innerHTML += '</div>';
		}
		$('#select-gather-nodes-div-container').empty().append(innerHTML).show();
	}
}

function onSayVoiceSelect(){
	if ($('#say-voice').val() =='men' || $('#say-voice').val() =='women' ){
		$('#alice-language-list-div').hide();
		$('#alice-say-language').val('');
	}else{
		$('#alice-language-list-div').show();

	}
}


function reset() {
	$('.addWindow').hide();
	//resetting Say container values
	$('#play-name').val('');
	$('#say-name').val('');
	$('#select-container-play').hide();
	$('#select-container-say').hide();
	$('#play-content-text').val('');
	$("textarea[name=say-content-text]").val('');
	//resetting Gather nodes
	$("textarea[name=gather-say-content-text]").val('');
	$('#select-gather-nodes').val("");
	$('gather-play-content-text').val("");
	$('#select-gather-nodes').prop('selectedIndex', 0);
	$('#select-gather-nodes-div-container').empty();
	$('#select-container-gather').hide();
	$("input[id=gather-name]").val("");
	$("#edit-digit-name").val("");
	$("#edit-digit-name").hide();
	$("#edit-digit").val("");
	$("#edit-digit").hide();
	$("#gather-play-content-text").val();
	$('#say').addClass('active');
	$('#say').addClass('show');
	$('#say-tab').addClass('active');
	
	$('#play').addClass('active');
	$('#play').removeClass('show');
	$('#play-tab').removeClass('active');

	//resetting queue node
	$('#queue-content').val('');
	$('#queue-name').val('');
	$('#select-container-queue').hide();
	//resetting record node
	$('#record-content').val('');
	$('#record-name').val('');
	$('#select-container-record').hide();
	//resetting conference node
	$('#conference-content').val('');
	$('#conference-name').val('');
	$('#select-container-conference').hide();
	//resetting hangup node
	$('#hangup-name').val('');
	$('#select-container-hangup').hide();
	//resetting Goto node
	$('#goto-nodes-div-container').empty().hide();
	//resetting Dial Node
	$('#dial-name').val('');
	$("#dial-content").val('');
	$('#select-container-dial').hide();
	$("textarea[name=dial-content-text]").val('');
	//resetting Weekdays Node
	$("#select-container-weekdays").hide();
	//$("#divWeekDays").hide();
	$("#txtWeekDaysNodeName").val('');
	$(".weekdays").each(function () {
		$(this).prop('checked', false);
	});
	//resetting Say container values
	$('#timings-name').val('');
	$('#start-time').val('09:00');
	$('#end-name').val('18:00');
	$('#select-container-timings').hide();
	//Main Model rest
	$("#selectAction").text("Select Action to perform");
	$('#nodeSelect').prop('selectedIndex', 0);
	$('.deleteWindow').hide();
	$('#edit-btn').hide();
	$('#save-btn').hide();
	$('#delete-btn').hide();
	$('button#addBtn').prop('disabled', false);
	$('button#editBtn').prop('disabled', false);
	$('button#deleteBtn').prop('disabled', false);
	$('#alice-language-list-div').hide();
	console.log(JSON.stringify(IVRData));

}
