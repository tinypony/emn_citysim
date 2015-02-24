define(['jquery', 'underscore', 'backbone', 'views/endstopviz/endstop'], 
    function($, _, Backbone, EndStopView) {
  
  var EndStopListBrowserView = Backbone.View.extend({
    
    initialize: function() {
      _.bindAll(this, ['render']);
      this.getData();
    },
    
    getData: function() {
      $.get('/api/waitingtimes').done(this.render);
    },
    
    render: function(data) {
      var self = this;
      var $div = $('<div class="endstop-list">');
      
      _.each(data.endStops, function(val, idx) {
        var newView = new EndStopView({data: val});
        $div.append(newView.render().$el);
      });
      
      this.$el.html($div);
    }
  });
  
  return EndStopListBrowserView;
});