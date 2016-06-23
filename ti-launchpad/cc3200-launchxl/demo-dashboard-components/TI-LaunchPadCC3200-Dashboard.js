window.targetThing = "";
window.LEDstore = false;
$.support.cors = true;

setTimeout(function(){	
	
	var presetThing = freeboard.getDatasourceSettings("CC3200-LaunchXL").thing_id;
	if (presetThing !=='') {
		window.setThing(presetThing);
		$("#thingfield").val(presetThing);
	}
	
	$('button#thingsubmit').click(function(e){
		window.setThing($("#thingfield").val());
		freeboard.setDatasourceSettings("CC3200-LaunchXL", {"thing_id":window.targetThing});
	    $("#thingfield").prop('disabled', true);
	    $('button#thingsubmit').prop("disabled",true);
	});	
	
	$('button#led').click(function(e){
		var lednum = $(this).attr('name');
		if (window.LEDstore) {
			window.setLED(false);
		} 
		else {
			window.setLED(true);
		}
		
	});	
		
},3000);

window.setThing = function(thingname) {
	window.targetThing = thingname;
}
window.setLED = function(state) {
	if (window.targetThing == "") {
		freeboard.showDialog($("<div align='center'>Error: Please set thing name!</div>"),"Error!","OK",null,function(){}); 	
		return;	
	}
	var payloadToSend = {};
	if (state) {
	    payloadToSend["set_led"] = "on"; 
	} else 
	    payloadToSend["set_led"] = "off";
	    
   	dweetio.dweet_for(window.targetThing+'-send', payloadToSend, function(err, dweet){console.log(dweet);});
	freeboard.showLoadingIndicator(true);
	setTimeout(function(){	
		freeboard.showLoadingIndicator(false);
	},4000);	
}
