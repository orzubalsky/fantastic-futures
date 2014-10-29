;(function($){
var site = window.site = new function() {
    this.csrvToken;
    
	this.init = function() 
	{
	    var self = this;
	    
        var arrInputs = document.getElementsByTagName("input");
        for (var i = 0; i < arrInputs.length; i++) 
        {
            var curInput = arrInputs[i];
            if (!curInput.type || curInput.type == "" || curInput.type == "text")
            self.handlePlaceholder(curInput);
        }	
        
        var arrTextareas = document.getElementsByTagName("textarea");
        for (var i = 0; i < arrTextareas.length; i++) 
        {
            var curTextarea = arrTextareas[i];
            self.handlePlaceholder(curTextarea);
        }
                    	    
        this.menus();
        this.constellationMenuScroll();
        this.searchForm();
        ajaxUpload.init();
        map.init();
        this.debug();
    };

    this.debug = function()
    {
        
    };

    this.searchForm = function()
    {
        var self = this;

        $('#search input[name=q]').on('input paste', function() 
        {
            var value = $(this).val();
            if (value.length > 1)
            {
                Dajaxice.futures.autocomplete(self.autocomplete_callback, {'q':value});              
            }
            else 
            {
                ffinterface.search_results = { 'Geosounds': [], 'Constellations': [] }; 
            }
        });
	};
	
	this.autocomplete_callback = function(data)
	{
        var self = this;
        if (data.success == true)
        {
            ffinterface.search_results = data.results;
        }
	};
	
	this.constellationMenuScroll = function()
	{
/*
    	$('#scrollUp').hover(function(){
           		$('#constellationMenuContent').scrollTo('-=10px',500, { axis: 'y'});
           });
       $('#scrollDown').hover( function(){
       		$('#constellationMenuContent').scrollTo('+=10px',500, { axis: 'y'});
       });*/
	
       $('#scrollUp').on('mouseenter', function() {
			this.iid = setInterval(function() {
			   // do something 
			   $('#constellationMenuContent').scrollTo('-=4px', { axis: 'y'});
			}, 25);
		}).on('mouseleave', function(){
			this.iid && clearInterval(this.iid);
		});

      	$('#scrollDown').on('mouseenter', function() {
			this.iid = setInterval(function() {
			   // do something 
			   $('#constellationMenuContent').scrollTo('+=4px', { axis: 'y'});
			}, 25);
		}).on('mouseleave', function(){
			this.iid && clearInterval(this.iid);
		});
	};
	
	this.menus = function()
	{
	    var self = this;

    	$("#clickLayer").click(function(e)
    	{
    	    e.preventDefault();
			
            map.hide();
		});
		
    	$("#logo").click(function(e)
    	{
            e.preventDefault();
            
            $("#about").fadeToggle("fast", "linear");
            $("#clickLayer").fadeToggle("fast", "linear");
    	});
    	
    	$("#addSoundText").click(function(e)
    	{
            e.preventDefault();        	    

            $("#addSound").fadeToggle("fast", "linear");
            $("#clickLayer").fadeToggle("fast", "linear");
            
            pov.resetRotation();        	  
    	});
    	
    	$("#addConstellationText").click(function(e)
    	{
            e.preventDefault();        	    
            
            $("#addConstellation").fadeToggle("fast", "linear");
            $("#clickLayer").fadeToggle("fast", "linear");
    	});
    	
    	$("#errorText").click(function(e)
    	{
            e.preventDefault();        	    
            
            $("#error").fadeToggle("fast", "linear");
    	});
    	
    	$("#constellationMenu h2").on('mouseenter', function()
    	{
            constellations.preview();
            
            $("#constellationMenuContent").fadeToggle("fast", "linear");
            $("#constellationMenu #scrollUp").fadeToggle("fast", "linear");
            $("#constellationMenu #scrollDown").fadeToggle("fast", "linear");
    	});
    	
    	$("#constellationMenu h2").on('mouseleave', function()
    	{
            constellations.clear();
    	});
    	
    	$("#constellationMenu").on('mouseleave', function()
    	{
            $("#constellationMenuContent").fadeToggle("fast", "linear");
            $("#constellationMenu #scrollUp").fadeToggle("fast", "linear");
            $("#constellationMenu #scrollDown").fadeToggle("fast", "linear");
    	});
    	
		$("#aboutLinks #toggleAr").click(function(e)
		{
            e.preventDefault();			    

            $("#about .description.english").fadeToggle("fast", "linear", function()
            {
                $("#about .description.arabic").fadeToggle("fast", "linear");
            });
			
			$("#aboutLinks #toggleAr").fadeToggle("fast", "linear", function()
			{
                $("#aboutLinks #toggleEn").fadeToggle("fast", "linear");
			});
		});
		
		$("#aboutLinks #toggleEn").click(function(e)
		{
            e.preventDefault();			    
            
            $("#about .description.arabic").fadeToggle("fast", "linear", function()
            {
                $("#about .description.english").fadeToggle("fast", "linear");
			});
			
			$("#aboutLinks #toggleEn").fadeToggle("fast", "linear", function()
			{
                $("#aboutLinks #toggleAr").fadeToggle("fast", "linear");
			});
		});

        $('#constellationMenuContent a').on('mouseenter', function(e)
        { 
            e.preventDefault();
    	    
            var id = lib.getId($(this).attr('id'));
            constellations.previewOne(id, true, 25, function() { return true; }); 
        });
        
        $('#constellationMenuContent a').on('click', function (e)
        { 
    	    e.preventDefault();
    	    
            var id = lib.getId($(this).attr('id'));
            constellations.loadOne(id); 
        });
        
        $('#constellationMenuContent a').on('mouseleave', function (e)            
        {
            e.preventDefault();
            constellations.clear();
        });
        
    	$('#contactUs a').click(function(e)
    	{
            e.preventDefault();
    	    
    	    $('#feedback').animate({
                right: 0
            }, 1000);
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

                Dajaxice.futures.submit_sound(self.addSound_callback, {'form':data, 'tags':tags, 'collection_slug':COLLECTION});
            });            
        });
        
        $('#addConstellationForm').submit(function(e) 
    	{
    	    e.preventDefault();
    	    
        	$('#addConstellationForm input, #addConstellationForm textarea').removeClass('error');
        	$('#addConstellationForm .errors').empty();
        		            	    
        	$('#addConstellationForm input[name=connection_count]').val(connections.collection.length);
        	$('#addConstellationForm input[name=zoom]').val(pov.zoom);
        	
            var data = $(this).serialize();
            
            Dajaxice.futures.submit_constellation(self.addConstellation_callback, {
                'form'          : data, 
                'connections'   : connections.decycled(),
                'rotation'      : pov.rotation
            });
    	});
    	    
        $('#customZoomIn').on('click', function(e) 
    	{
    	    e.preventDefault();
    	    
    	    pov.changeZoom(0.2);
    	});
    	
        $('#customZoomOut').on('click', function(e) 
    	{
    	    e.preventDefault();
    	    
    	    pov.changeZoom(-0.2);
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
        	                $('#addSoundForm #uploadText').text('CHOOSE FILE');
        	                $('#addSoundForm button.time').removeClass('selected').val('0');
        	                
                            // 6. show sound on map
                            map.addSound(data.geojson);
                            
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
            // 0. rerender constellation menu
            $('#constellationMenuContainer').html(data.constellations);
        
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
							$('#addConstellationForm').show();
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
	
    this.handlePlaceholder = function(oTextbox)
    {
        if (typeof oTextbox.placeholder == "undefined")
        {
            var curPlaceholder = oTextbox.getAttribute("placeholder");
            
            if (curPlaceholder && curPlaceholder.length > 0)
            {
                oTextbox.value = curPlaceholder;
                oTextbox.setAttribute("old_color", oTextbox.style.color);
                oTextbox.style.color = "#005fff";
                oTextbox.onfocus = function()
                {
                    this.style.color = this.getAttribute("old_color");
                    if (this.value === curPlaceholder)
                        this.value = "";
                };
                oTextbox.onblur = function()
                {
                    if (this.value === "")
                    {
                        this.style.color = "#005fff";
                        this.value = curPlaceholder;
                    }
                };
            }
        }
    }	

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