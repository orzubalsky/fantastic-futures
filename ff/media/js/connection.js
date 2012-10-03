(function(){
    window.Connection = Backbone.RelationalModel.extend({
        url: function(){
            return this.get('resource_uri') || this.collection.url;
        },

        relations: [{
            type: Backbone.HasMany,
            key: 'geosounds',
            relatedModel: 'GeoSound',
            collectionType: 'GeoSoundCollection',
            reverseRelation: {
              key: 'connectedBy',
              includeInJSON: 'id'
            }
        }]
    });

    window.Connections = Backbone.Collection.extend({
        model   : Connection,        
        url     : '/api/v1/connection/',
        parse   : function(data)
        {
            return data.objects;
        }                                             
    });
    
    window.ConnectionView = Backbone.View.extend({
      tagName: 'a',

      render: function()
      {
          $(this.el).html('<a href="">123</a>')
          return this;
      }                                        
    });
})();