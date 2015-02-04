define([ 'jquery', 
         'jquery-ui', 
         'underscore', 
         'amcharts.serial', 
         'backbone', 
         'hbs!templates/remotesim/stoplist' ], 
    function($, JUI, _, amRef, Backbone, StopListTemplate) {

  var StopList = Backbone.View.extend({
    
    render: function() {
      this.$el.html(StopListTemplate());
    }
  });
  
  return StopList;
});