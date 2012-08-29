;(function($){
	var map = window.site.map = new function() 
	{	
	    var width           = $('#interface').width();
	    var height          = $('#interface').height();
	    var map, layer;
        var projectForward = function( point )
		{
			var convertedPoint = convert_s_t_p( point.x, point.y );
			point.x = convertedPoint.x * 150;
			point.y = convertedPoint.y * 150;
			return point;
		};
		

        this.init = function()
        {   
            if (!OpenLayers.CANVAS_SUPPORTED) 
            {
                var unsupported = OpenLayers.Util.getElement('unsupported');
                unsupported.innerHTML = 'Your browser does not support canvas, nothing to see here !';
            }
            
            OpenLayers.Projection.addTransform( "EPSG:4326", "DYMAX", projectForward );

			// KML layer
			var kml = new OpenLayers.Layer.Vector( "World countries", {
				projection : new OpenLayers.Projection("EPSG:4326"),
	            strategies: [ new OpenLayers.Strategy.Fixed() ],
	            protocol: new OpenLayers.Protocol.HTTP( {
	                url: MEDIA_URL + "data/worldCountries.kml",
	                format: new OpenLayers.Format.KML()
	            } ),
				style : { 'fillColor' : '#ededed', 'fillOpacity' : 1, 'strokeColor' : '#fff', 'strokeWidth' : 0.7 },
                renderers: ["Canvas"]				
	        } );

			var points = new OpenLayers.Layer.Vector( "World cities", {
				projection : new OpenLayers.Projection("EPSG:4326"),
	            strategies: [ new OpenLayers.Strategy.Fixed() ],
	            protocol: new OpenLayers.Protocol.HTTP( {
	                url: MEDIA_URL + "data/93211.kml",
	                format: new OpenLayers.Format.KML()
	            } ),
				style : { 'fillColor' : '#b2b2b2', 'fillOpacity' : 1, 'pointRadius' : 1, 'stroke' : false },
                renderers: ["Canvas"]				
			} );
			var triFill = new OpenLayers.Layer.Vector( "Triangle fills", {
				projection: new OpenLayers.Projection("DYMAX"),
				style : { 'fillColor' : 'transparent', 'fillOpacity' : 1, 'strokeColor' : '#0099cc', 'strokeWidth' : 1, 'strokeOpacity' : 0 },
                renderers: ["Canvas"]				
			} );

            // var triDashed = new OpenLayers.Layer.Vector( "Triangle strokes", {
            //  projection: new OpenLayers.Projection("DYMAX"),
            //  style : { 'fillColor' : '#c8ebff', 'fillOpacity' : 0, 'strokeColor' : '#ededed', 'strokeWidth' : .5, 'strokeOpacity' : 1, 'strokeDashstyle' : 'longdash' },
            //                 renderers: ["Canvas"]                
            // } );

			// Create new map
			var map = new OpenLayers.Map("map", {
				projection: new OpenLayers.Projection("DYMAX"),
		        maxExtent: new OpenLayers.Bounds( 0,0,860,400),
				allOverlays: true,
				controls: [
				    new OpenLayers.Control.Navigation({
				        dragPanOptions: {
				            enableKinetic:true
				            
				        }
				    }),
				    new OpenLayers.Control.Attribution(),
				    new OpenLayers.Control.Zoom({
				        zoomInId: "customZoomIn",
				        zoomOutId: "customZoomOut"
				    })
				],
			});
			           
			map.addLayers( [ triFill, kml ] );
			map.zoomTo(2.5);

			// *** TRIANGLE STUFF ***
			/* define the 19 triangles */
			var triData = 
			[
				[ [ 75, 0 ], [ 225, 0 ], [ 150, 130 ] ],
				[ [ 225, 0 ], [ 300, 130 ], [ 150, 130 ] ],
				[ [ 300, 130 ], [ 450, 130 ], [ 375, 0 ] ],
				[ [ 450, 130 ], [ 600, 130 ], [ 525, 0 ] ],
				[ [ 600, 130 ], [ 675, 0 ], [ 525, 0 ] ],

				[ [ 75, 260 ], [ 225, 260 ], [ 150, 130 ] ],
				[ [ 225, 260 ], [ 300, 130 ], [ 150, 130 ] ],
				[ [ 225, 260 ], [ 375, 260 ], [ 300, 130 ] ],
				[ [ 375, 260 ], [ 450, 130 ], [ 300, 130 ] ],
				[ [ 375, 260 ], [ 525, 260 ], [ 450, 130 ] ],
				[ [ 525, 260 ], [ 600, 130 ], [ 450, 130 ] ],
				[ [ 525, 260 ], [ 675, 260 ], [ 600, 130 ] ],
				[ [ 675, 260 ], [ 750, 130 ], [ 600, 130 ] ],
				[ [ 675, 260 ], [ 825, 260 ], [ 750, 130 ] ],

				[ [ 150, 390 ], [ 300, 390 ], [ 225, 260 ] ],
				[ [ 300, 390 ], [ 375, 260 ], [ 225, 260 ] ],
				[ [ 300, 390 ], [ 450, 390 ], [ 375, 260 ] ],

				[ [ 600, 390 ], [ 675, 260 ], [ 525, 260 ] ],

				[ [ 750, 390 ], [ 825, 260 ], [ 675, 260 ] ]
			];

			var triFeatures = [];
			var triDashedFeatures = [];
			for ( var i = 0; i < triData.length; i++ )
			{
				var lineGeom = new OpenLayers.Geometry.LinearRing( [
					new OpenLayers.Geometry.Point( triData[i][0][0], triData[i][0][1] ),
					new OpenLayers.Geometry.Point( triData[i][1][0], triData[i][1][1] ),
					new OpenLayers.Geometry.Point( triData[i][2][0], triData[i][2][1] ),
					new OpenLayers.Geometry.Point( triData[i][0][0], triData[i][0][1] )
				] );

				triFeatures.push( new OpenLayers.Feature.Vector( new OpenLayers.Geometry.Polygon( [ lineGeom ] ) ) );
				triDashedFeatures.push( new OpenLayers.Feature.Vector( new OpenLayers.Geometry.Polygon( [ lineGeom ] ) ) );
			}

			triFill.addFeatures( triFeatures );
			// triDashed.addFeatures( triDashedFeatures );            
			
            var sound_layer = get_data_layers();
            map.addLayers(sound_layer);              
        };
        
        function get_data_layers() 
        {            
        	var layers = [];
            
            for (var key in DATA_LAYERS) {
                var layer_info = DATA_LAYERS[key];

    			var layer = new OpenLayers.Layer.Vector( layer_info['title'], {
    				projection : new OpenLayers.Projection("EPSG:4326"),
    	            strategies: [ new OpenLayers.Strategy.Fixed() ],
    	            protocol: new OpenLayers.Protocol.HTTP( {
                        url     : layer_info['url'],
                        format  : new OpenLayers.Format.GeoJSON(),
    	            } ),
    				style : { 'fillColor' : '#000000', 'fillOpacity' : 1, 'pointRadius' : 2, 'stroke' : false },
                    renderers: ["Canvas"]				
    			} ); 					
    			layer.events.register("loadend", layer, function() 
    			{
                   // save coordinates
                   points = [];
                   for(var i=0; i<layer.features.length; i++)
                   {
                       var feature = layer.features[i];
                       var coordinates = layer.renderer.getLocalXY(feature.geometry);
                       
                       points.push({
                           x: coordinates[0], 
                           y: coordinates[1]
                       })
                   } 
                   site.ffinterface.setPoints(points);
                   site.ffinterface.init();
                   $('#map').hide();                   
    			});
    	        layers.push(layer);
    	        
    	    }
        	return layers;        	
        };   
        
        this.codeLatLng = function(lat, lon) 
        {
            var geocoder = new google.maps.Geocoder();            
            lat = parseFloat(lat);
            lon = parseFloat(lon);
            var latlng = new google.maps.LatLng(lat, lon);
            geocoder.geocode({'latLng': latlng}, function(results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                    lib.log(results);
                }
              } else {
                  lib.log(status);
              }
            });
        };
        
        this.codeAddress = function(address) 
        {
            var geocoder = new google.maps.Geocoder();                        
            geocoder.geocode( { 'address': address}, function(results, status) 
            {
                if (status == google.maps.GeocoderStatus.OK) {
                    var lat = results[0].geometry.location.lat();
                    var lon = results[0].geometry.location.lng();
                    placeMarker(lat, lon);
                    // return {lat: lat, lon: lon};
                } else {
                    lib.log(status);
                }
            });
        };
        
        function placeMarker(lat, lon)
        {
            lib.log(sound_layer);
        };
	};
})(jQuery);	