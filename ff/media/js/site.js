;(function($){
	var site = window.site = new function() {
	    this.WIDTH;
	    this.HEIGHT;
	    this.csrvToken;
		this.init = function() 
		{
            // Dajaxice.futures.sayhello(function(data) { lib.log(data); });         
		    
            this.csrvToken = $('input[name="csrfmiddlewaretoken"]').val();		    
		    this.menus();
		    this.WIDTH  = $('#interface').width();
		    this.HEIGHT = $('#interface').height();
		    site.map.init();
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
	};
})(jQuery);

$(document).ready(function(){
	site.init();
});		