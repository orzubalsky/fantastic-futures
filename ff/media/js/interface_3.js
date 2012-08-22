;(function($){
	var ffinterface = window.site.ffinterface = new function() 
	{	
		var stars = {};
		stars.star = function(){
			this.x;
			this.y;
			this.z;
			
			this.projectedX;
			this.projectedY;
			this.projectedSize;
			this.projectedColour;
		};
		
	    stars.main = {
			maxStars : 150,
			hfov : 100 * Math.PI / 180,
			vfov : 80 * Math.PI / 180,
			maxDistance : 800,
			starSpeed : 0,
			
			stars : [],				
			hViewDistance : 0,
			vViewDistance : 0,
			screenWidth : 0,
			screenHeight : 0,
			context : null,
							
			init : function(){
				if( !document.getElementById( "interface" ).getContext ) return;
				this.context = document.getElementById( "interface" ).getContext( "2d" );
				this.screenWidth = document.getElementById( "interface" ).offsetWidth;
				this.screenHeight = document.getElementById( "interface" ).offsetHeight;
				
				// Set up the view distance based on the field-of-view (with pythagoras)
				this.hViewDistance = ( this.screenWidth / 2 ) / Math.tan( this.hfov / 2 );
				this.vViewDistance = ( this.screenHeight / 2 ) / Math.tan( this.vfov / 2 );
				
				// Init the stars
				for( var i = 0; i < this.maxStars; i++ ){
					var star = new stars.star();
					star.x = ( Math.random() * this.screenWidth ) - ( this.screenWidth / 2 );
					star.y = ( this.screenHeight / 2 ) - ( Math.random() * this.screenHeight );
					star.z = ( Math.random() * this.maxDistance );
					star.speed = this.starSpeed;
					this.stars.push( star );
				}
				
				this.run();
			},
			
			run : function(){
				var that = this;
				
				// Run the main loop
				(function tick(){
					that.update();
					that.draw();
					setTimeout( function(){ that.run(); }, 70 );						
				})();
			},
			
			update : function(){
				for( var i = 0; i < this.stars.length; i++ ){
					var star = this.stars[ i ];

					star.z -= this.starSpeed;
					if( star.z <= 0 ) star.z = this.maxDistance;
					
					// Project to 2D space
					star.projectedX = ( star.x * this.hViewDistance ) / star.z;
					star.projectedY = ( star.y * this.vViewDistance ) / star.z;

					// Transform from screen cordinates to X/Y
					star.projectedX += this.screenWidth / 2;
					star.projectedY = ( this.screenHeight / 2 ) - star.projectedY;
					
					// Change the size & colour based on depth
					star.projectedSize = ( 1 - (star.z / this.maxDistance) ) * 4;
					var shade = Math.floor( ( 1 - (star.z / this.maxDistance) ) * 255 );
					star.projectedColour = "rgba(" + shade + "," + shade + "," + shade + ", 0.8)";						
				}
			},
			
			draw : function(){
				var ctx = this.context;
				ctx.fillStyle = "#000";
				ctx.fillRect( 0, 0, this.screenWidth, this.screenHeight );
				for( var i = 0; i < this.stars.length; i++ ){
					var star = this.stars[ i ];
					ctx.fillStyle = star.projectedColour;
					ctx.beginPath();
					ctx.arc( 
						star.projectedX,
						star.projectedY, 
						star.projectedSize, 
						0, Math.PI * 2, true
					);
					ctx.closePath();
					ctx.fill();
				}
			}
		};
		
		window.addEventListener("load", function(){ stars.main.init(); }, false);
	};
})(jQuery);

$(document).ready(function(){
	site.ffinterface.init();
});		