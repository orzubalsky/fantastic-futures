;(function($){
	var map = window.map = new function() 
	{	
	    this.width           = $('#interface').width();
	    this.height          = $('#interface').height();
	    this.map;
	    this.soundLayer;
        this.settings = MAP_SETTING[0].fields;
	    
        this.init = function()
        {   
            var self = this;
                        
            // output an error if the browser doesn't support canvas (the entire site is based on canvases)
            if (!OpenLayers.CANVAS_SUPPORTED) 
            {
                outputError('Your browser does not support canvas, nothing to see here!');
            }

            
            // add the 4326 to dymaxiom transformation function
            OpenLayers.Projection.addTransform( "EPSG:4326", "DYMAX", self.projectForward );     

            // Create new map
            self.map = self.createMap();

            if (self.settings.basemap == 'dymaxion')
            {           
                // base layers
                var countries   = self.countriesLayer();
                var triFill     = self.dymaxTriFill();

                // add base layers to map
                self.map.addLayers( [ triFill, countries ] );

                // add features to the dymax layer
                self.addDymaxFeaturesToLayer(triFill);

                // initial zoom
                self.map.zoomTo(2.5); 
            } 
    
            if (self.settings.basemap == 'openstreetmap')
            {
                // var mapnik = new OpenLayers.Layer.OSM();
                var stamen = new OpenLayers.Layer.Stamen("toner-lite");
                stamen.setOpacity(0.4);

                var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
                var toProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection                

                self.map.addLayers([stamen, ]);
                
                var bounds = OpenLayers.Geometry.fromWKT(self.settings.initial_bounds);
                var transformed_bounds = bounds.getBounds().transform(fromProjection, toProjection);
                self.map.zoomToExtent(transformed_bounds);
            }     
       
            // add sounds layer
            self.soundLayer = self.get_data_layers();
            self.map.addLayers(self.soundLayer);
        };
        
        this.createMap = function() 
        {
            var self = this;
            
            // MAP PROJECTION
            if (self.settings.basemap == 'dymaxion')
            {
                var options = {
                    projection: new OpenLayers.Projection("DYMAX"),
                    maxExtent: new OpenLayers.Bounds(-50,50,860,420),
                    allOverlays: true,
                    controls: [
                        new OpenLayers.Control.Navigation({
                            dragPanOptions: {
                                enableKinetic: false,
                            },
                            zoomWheelEnabled : false
                        }),
                        new OpenLayers.Control.Attribution(),
                     ],
                };
            }

            if (self.settings.basemap == 'openstreetmap')
            {
                var max_extent = new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508);
                var restrictedExtent = max_extent.clone();
                var maxResolution = 156543.0339;
            
                var options = {
                    projection: new OpenLayers.Projection("EPSG:900913"),
                    displayProjection: new OpenLayers.Projection("EPSG:4326"),
                    units: "m",
                    maxResolution: maxResolution,
                    maxExtent: max_extent,
                    restrictedExtent: max_extent,
                    controls: [
                        new OpenLayers.Control.Navigation({
                            dragPanOptions: {
                                enableKinetic: false,
                            },
                            zoomWheelEnabled : false
                        }),
                        new OpenLayers.Control.Attribution(),
                     ],
                };
            }

			return new OpenLayers.Map('map', options);
        };
        
        this.addSound = function(geojson)
        {
            var self = this;
                
            // var point       = new OpenLayers.Geometry.Point(lat, lon);
            // var feature     = new OpenLayers.Feature.Vector(point, attributes);
            var layer       = self.map.getLayersBy('name', 'sounds')[0];
            // 
            // layer.addFeatures([feature]);
            
            var format      = new OpenLayers.Format.GeoJSON();
            var collection  = '{"type":"FeatureCollection", "features":' + geojson + '}';
            var features    = format.read(collection);

            layer.addFeatures(features);
            layer.refresh();
            return layer;   
        };
        
        this.get_data_layers = function() 
        {
            var self = this;      
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
    				style : {
                        'fillColor' : self.settings.mapdisplay_fill_color,
                        'fillOpacity' : self.settings.mapdisplay_fill_opacity,
                        'pointRadius' : self.settings.mapdisplay_point_radius,
                        'stroke' : false
                    },
                    renderers: ["Canvas"]				
    			} ); 					
    			layer.events.register("loadend", layer, function() 
    			{	
                   // save coordinates                   
                   geosounds.map_points = [];
                   for(var i=0; i<layer.features.length; i++)
                   {
                       self.pushPointToInterface(layer.features[i], layer);
                   }
                   if (ffinterface.running == false) 
                   {                       
                       ffinterface.init(); 
                   }
                   if ($("#map").css("opacity")>0)
                   {
                       $("#map").fadeOut(1000);
                       $("#interface").fadeIn(1000);
       				}
       				$(".tran1").fadeOut(1000);
    			});                
    	        layers.push(layer);
    	        
    	    }
        	return layers;        	
        };   
        
        this.pushPointToInterface = function(feature, layer)
        {
            var self = this;            
            var coordinates = self.getGeometryFromFeature(feature, layer);
            var map_point = {
                x           : Math.floor(coordinates[0]), 
                y           : Math.floor(coordinates[1]), 
                id          : feature.data.id,
                title       : feature.data.title,
                location    : feature.data.location,
                created_by  : feature.data.created_by,
                story       : feature.data.story,
                filename    : feature.data.filename,
                volume      : feature.data.volume,
                z           : feature.data.z,
                is_recent   : feature.data.is_recent,
                just_added  : feature.data.just_added
            };
            geosounds.map_points.push(map_point);
        };
        
        this.getGeometryFromFeature = function(feature, layer)
        {
            return layer.renderer.getLocalXY(feature.geometry);
        };
        
        this.addDymaxFeaturesToLayer = function(layer)
        {
            var self = this;
            
            var triData = self.dymaxTriData();
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
				// triDashedFeatures.push( new OpenLayers.Feature.Vector( new OpenLayers.Geometry.Polygon( [ lineGeom ] ) ) );
			}
          
			layer.addFeatures( triFeatures );
			// triDashed.addFeatures( triDashedFeatures );            
        };
        
        this.dymaxTriData = function() 
        {
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
			
			return triData;          
        };
        
        this.dymaxTriStrokes = function() 
        {
            var layer = new OpenLayers.Layer.Vector( "Triangle strokes", {
             projection: new OpenLayers.Projection("DYMAX"),
             style : { 'fillColor' : '#c8ebff', 'fillOpacity' : 0, 'strokeColor' : '#ededed', 'strokeWidth' : .5, 'strokeOpacity' : 1, 'strokeDashstyle' : 'longdash' },
             renderers: ["Canvas"]                
            });
            
            return layer;            
        };
        
        this.dymaxTriFill = function() 
        {
			var layer = new OpenLayers.Layer.Vector( "Triangle fills", {
				projection: new OpenLayers.Projection("DYMAX"),
				style : { 'fillColor' : 'transparent', 'fillOpacity' : 1, 'strokeColor' : '#0099cc', 'strokeWidth' : 1, 'strokeOpacity' : 0 },
                renderers: ["Canvas"]				
			} );
			
			return layer;            
        };
        
        this.citiesLayer = function() 
        {
			var layer = new OpenLayers.Layer.Vector( "World cities", {
				projection : new OpenLayers.Projection("EPSG:4326"),
	            strategies: [ new OpenLayers.Strategy.Fixed() ],
	            protocol: new OpenLayers.Protocol.HTTP( {
	                url: STATIC_URL + "data/93211.kml",
	                format: new OpenLayers.Format.KML()
	            } ),
				style : { 'fillColor' : '#b2b2b2', 'fillOpacity' : 1, 'pointRadius' : 1, 'stroke' : false },
                renderers: ["Canvas"]				
			});
			
			return layer;            
        };
        
        this.countriesLayer = function() 
        {
        	var layer = new OpenLayers.Layer.Vector( "World countries", {
				projection : new OpenLayers.Projection("EPSG:4326"),
	            strategies: [ new OpenLayers.Strategy.Fixed() ],
	            protocol: new OpenLayers.Protocol.HTTP( {
	                url: STATIC_URL + "data/worldCountries.kml",
	                format: new OpenLayers.Format.KML()
	            } ),
				style : { 'fillColor' : '#ededed', 'fillOpacity' : 1, 'strokeColor' : '#fff', 'strokeWidth' : 0.7 },
                renderers: ["Canvas"]				
	        }); 
	        
	        return layer;           
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
                    return [lat, lon];
                } else {
                    lib.log(status);
                }
            });
        };
        
        this.projectForward = function(point)
		{
			var convertedPoint = convert_s_t_p( point.x, point.y );
			point.x = convertedPoint.x * 150;
			point.y = convertedPoint.y * 150;
			return point;
		};

        this.hide = function()
        {
            if ($("#map").css("opacity")>0)
            {
                $("#map").fadeOut(1000);
                $("#interface").fadeIn(1000);
            }
            
            $(".tran1").fadeOut(1000);
            
            $("#clickLayer").hide();
            $('#feedback').animate({
                right: -322
            }, 1000);            
        };      
	};
})(jQuery);	