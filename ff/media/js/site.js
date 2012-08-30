;(function($){
	var site = window.site = new function() {
	    this.WIDTH;
	    this.HEIGHT;
	    this.csrvToken;
		this.init = function() 
		{
		    this.menus();
		    this.WIDTH  = $('#interface').width();
		    this.HEIGHT = $('#interface').height();
		    site.ajaxUpload.init();
		    //site.map.init();
		};
		
		this.menus = function()
		{
		    var self = this;
        	
        	$("#logo").click(function() {
        	  $("#about").fadeToggle("fast", "linear");
        	});
        	$("#addSoundText").click(function() {
        	  $("#addSound").fadeToggle("fast", "linear");
              site.ffinterface.resetRotation();        	  
        	});
        	$("#addConstellationText").click(function() {
        	  $("#addConstellation").fadeToggle("fast", "linear");
        	});
        	$("#errorText").click(function() {
        	  $("#error").fadeToggle("fast", "linear");
        	});
        	$("#constellationMenu h2").click(function() {
        	  $("#constellationMenuContent").fadeToggle("fast", "linear");
        	  $("#constellationMenu #scrollUp").fadeToggle("fast", "linear");
        	  $("#constellationMenu #scrollDown").fadeToggle("fast", "linear");
        	});		
        	$("#toggleLanguage").click(function() {
        	  $("#about .description.arabic").fadeToggle("fast", "linear");
        	  $("#about .description.english").fadeToggle("fast", "linear");
        	  $("#aboutLinks #toggleAr").fadeToggle("fast", "linear");
        	  $("#aboutLinks #toggleEn").fadeToggle("fast", "linear");
        	});    
        	$('#locateSoundForm').submit(function(e) 
        	{
        	    e.preventDefault();
        	    site.map.codeAddress($('#address').val());
        	});
        	$('#contactUs a').click(function(e)
        	{
        	    e.preventDefault();
        	    $('#feedback').animate(
        	        {
        	            right: 0
        	        }, 1000
        	    );
        	});
        	$('#feedbackForm').submit(function(e)
        	{
        	    e.preventDefault();
        	    
                var data = $(this).serialize();
                Dajaxice.futures.submit_feedback(self.feedback_callback, {'form':data});
        	});
            $('#addSoundForm').submit(function(e)
            {                
                e.preventDefault();
                
                $('input[name=lat]').val('');
                $('input[name=lon]').val('');      
    		    $('#addSoundForm input, #addSoundForm textarea').removeClass('error');
    		    $('#addSoundForm .errors').empty();                          
                
                var address = $('input[name=location]').val();
                var geocoder = new google.maps.Geocoder();                        
                geocoder.geocode( { 'address': address}, function(results, status) 
                {
                    if (status == google.maps.GeocoderStatus.OK) 
                    {
                       $('input[name=lat]').val( results[0].geometry.location.lat() );
                       $('input[name=lon]').val( results[0].geometry.location.lng() );                     
                    } 
                    else 
                    {
                        lib.log(status);
                    }
                    var data = $('#addSoundForm').serialize();
                    Dajaxice.futures.submit_sound(self.addSound_callback, {'form':data});                    
                });            
            });
		};
		
		this.addSound_callback = function(data)
		{
		    lib.log(data);
		    if (data.success == true)
		    {
		        
		    }
		    else 
		    {		        
                for (field in data.errors)
                {   
                    var error = data.errors[field][0];
                    $('#addSoundForm .errors').append('<p>' + error + '</p>');
                    $('#id_' + field).addClass('error');
                }		        
		    }		    
		};
		
		this.feedback_callback = function(data)
		{
		    // reset error fields
		    $('#feedbackForm input, #feedbackForm textarea').removeClass('error');
		    
            if (data.success == true)
            {
                // 1. fade out form
                $('#feedbackForm').fadeOut(300, function() 
                {
                    // 2. fade in success message
                    $('#feedbackCheck').fadeIn(300, function() 
                    {
                        // 3. wait 1000 ms
                        setTimeout(function() 
                        {
                            // 4. animate form back to its original position
                            $('#feedback').animate(
                    	        {
                    	            right: -322
                    	        }, 1000, function() 
                    	            {
                    	                // 5. restore the form's original state
                    	                $('#feedbackCheck').hide();
                    	                $('#feedbackForm input, #feedbackForm textarea').not('.formSubmit').val('');
                    	                $('#feedbackForm').show();
                    	            }
                    	    );
                        }, 1000);
                    });
                });
            }
            else
            {
                for (field in data.errors)
                {
                    $('#id_' + field).addClass('error');
                }
            }
		};
		
		this.appendFormError = function(form, message)
		{
            $('.errors', form).append('<p>' + message + '</p>');		    
		};
	};
})(jQuery);

$(document).ready(function(){
	site.init();
});		