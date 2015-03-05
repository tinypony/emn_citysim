define([ 'jquery', 
         'underscore', 
         'backbone',
         'router',
         'hbs!templates/route-select' ], 
    function($, _, Backbone, router, template) {

  var SelectionView = Backbone.View.extend({
    events: {
      'click .submit': 'onSelect' 
    },
    
    initialize: function() {
     // _.bindAll(this, ['onSubmit']);
    },
    
    onSelect: function(ev) {
      ev.preventDefault();
      console.log(router);
      Backbone.history.navigate('overview', true);
    },
    
    render: function() {
      this.$el.html(template());
    }
  });
  
  return SelectionView;
});