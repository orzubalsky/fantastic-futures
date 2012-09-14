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
		    site.map.init();
		    this.debug();
		};
		
		this.debug = function()
		{
        	
		};
		
		this.menus = function()
		{
		    var self = this;
        	$("#clickLayer").click(function(){
				$(".tran1").fadeOut(1000);
				$("#clickLayer").hide();
			});
        	$("#logo").click(function() {
        	  $("#about").fadeToggle("fast", "linear");
			  $("#clickLayer").show();
        	});
        	$("#addSoundText").click(function() {
        	  $("#addSound").fadeToggle("fast", "linear");
			  $("#clickLayer").show();
              site.ffinterface.resetRotation();        	  
        	});
        	$("#addConstellationText").click(function() {
        	  $("#addConstellation").fadeToggle("fast", "linear");
			  $("#clickLayer").show();
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
            $('#constellationMenuContent a').hover(function (e)
            { 
        	    e.preventDefault();
        	    
                var id = lib.getId($(this).attr('id'));
                site.ffinterface.loadConstellation(id, true); 
            }, function(e) 
            {
                site.ffinterface.clearConnections();
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
        	$('#addSoundForm .time').click(function(e) 
        	{
        	    e.preventDefault();
        	    
        	    if ($(this).val() == 0)
        	    {
        	        // button was not selected
        	        $(this).addClass('selected').val(1);
        	    }
        	    else 
        	    {
        	        // button was selected
                    $(this).removeClass('selected').val(0);        	        
        	    }
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
                    var data = $('#addSoundForm').serialize();
                    
                    var tags = [];
                    for(var i=0; i<$('.time').size(); i++)
                    {
                        var button = $('.time').eq(i);
                        if ($(button).val() == 1)
                        {
                            tags.push($(button).attr('name'));
                        }
                    }
                    
                    Dajaxice.futures.submit_sound(self.addSound_callback, {'form':data, 'tags':tags});
                });            
            });
            $('#addConstellationForm').submit(function(e) 
        	{
        	    e.preventDefault();
        	    
            	$('#addConstellationForm input, #addConstellationForm textarea').removeClass('error');
            	$('#addConstellationForm .errors').empty();
            		            	    
                var connections = site.ffinterface.getActiveConnections();                
            	$('#addConstellationForm input[name=connection_count]').val(connections.length);
                var data = $(this).serialize();
            	                
                Dajaxice.futures.submit_constellation(self.addConstellation_callback, {
                    'form'          : data, 
                    'connections'   : connections,
                    'rotation'      : site.ffinterface.rotation
                });
        	});            
		};
		
		this.addSound_callback = function(data)
		{
		    if (data.success == true)
		    {
                // 1. fade out form
				
                $('#addSoundForm').fadeOut(800, function() 
                {
                    // 2. fade in success message
                    $('#addSoundCheck').fadeIn(500, function() 
                    {
                        // 3. wait 1000 ms
                        setTimeout(function() 
                        {
                            // 4. bring form back to its original position
                            $('#addSound').fadeOut(1000, function() 
                            {
            	                // 5. restore the form's original state
            	                $('#addSoundCheck').hide();
								$('#addSoundForm').show();
            	                $('#addSoundForm input, #addSoundForm textarea').not('.formSubmit').val('');
            	                
                                // 6. show sound on map
                                lib.log(data.geojson);
                                site.map.addSound(data.geojson);
                                
                                // 7. hide map            	                
            	                
                	        });
                        }, 1500);
                    });
                });	       
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
		
        this.addConstellation_callback = function(data)
		{
		    if (data.success == true)
		    {
                // 1. fade out form
                $('#addConstellationForm').fadeOut(800, function() 
                {
                    // 2. fade in success message
                    $('#addConstellationCheck').fadeIn(500, function() 
                    {
                        // 3. wait 1000 ms
                        setTimeout(function() 
                        {
                            // 4. bring form back to its original position
                            $('#addConstellation').fadeOut(1000, function() 
                            {
            	                // 5. restore the form's original state
            	                $('#addConstellationCheck').hide();
            	                $('#addConstellationForm input, #addConstellationForm textarea').not('.formSubmit').val('');
                	        });
                        }, 1500);
                    });
                });	        
		    }
		    else 
		    {		        
                for (field in data.errors)
                {   
                    var error = data.errors[field][0];
                    $('#addConstellationForm .errors').append('<p>' + error + '</p>');
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
		
		this.outputError = function(message)
		{
            $('#error #errorMessage').html('<p>' + message + '</p>');
            $('#error').fadeIn(1000);	    
		};
	};
})(jQuery);

$(document).ready(function(){
	site.init();
});		