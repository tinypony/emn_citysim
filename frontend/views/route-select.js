define([ 'jquery', 
         'underscore', 
         'backbone', 
         'router', 
         'hbs!templates/route-select' ], 
    function($, _, Backbone, Router, template) {

  var SelectionView = Backbone.View.extend({
    events: {
      'click .submit': 'onSubmit' 
    },
    
    initialize: function() {
      _.bindAll(this, ['onSubmit']);
    },
    
    onSubmit: function() {
      this.$el.empty();
      
    },
    
    render: function() {
      this.$el.html(template());
    }
  });
  
  return SelectionView;
});