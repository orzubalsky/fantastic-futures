(function(){
    window.GeoSound = Backbone.Model.extend({
        url: function(){
            return this.get('resource_uri') || this.collection.url;
        },
    });

    window.GeoSounds = Backbone.Collection.extend({
        model   : GeoSound, 
        url     : '/api/v1/geosound/',
        parse   : function(data)
        {
            return data.objects;
        }                                             
    });
    
    window.GeoSoundView = Backbone.View.extend({
      tagName: 'a',

      render: function()
      {
          $(this.el).html('<a href="">123</a>')
          return this;
      }                                        
    });
})();