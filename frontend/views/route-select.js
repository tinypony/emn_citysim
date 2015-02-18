define([ 'jquery', 
         'underscore', 
         'backbone',
         'hbs!templates/route-select' ], 
    function($, _, Backbone, template) {

  var SelectionView = Backbone.View.extend({
    events: {
      'click .submit': 'onSelect' 
    },
    
    initialize: function() {
     // _.bindAll(this, ['onSubmit']);
    },
    
    onSelect: function(ev) {
      ev.preventDefault();
      Backbone.history.navigate('overview');
    },
    
    render: function() {
      this.$el.html(template());
    }
  });
  
  return SelectionView;
});