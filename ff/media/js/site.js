;(function($){
	var site = window.site = new function() {
	    this.WIDTH;
	    this.HEIGHT;
	    
		this.init = function() 
		{
		    this.menus();
		    this.WIDTH  = $('#interface').width();
		    this.HEIGHT = $('#interface').height();
		    site.map.init();
		};
		
		this.menus = function()
		{
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
		};
	};
})(jQuery);

$(document).ready(function(){
	site.init();
});		