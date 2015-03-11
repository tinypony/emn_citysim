define(['jquery', 'underscore', 'backbone', 'views/endstopviz/endstop'], 
    function($, _, Backbone, EndStopView) {
  
  var EndStopListBrowserView = Backbone.View.extend({
    
    initialize: function() {
      _.bindAll(this, ['render']);
      this.data = {};
      this.getData();
    },
    
    getData: function() {
      var self = this;
      var callback = _.after(2, this.render);
      var date = '2015-2-19';
      
      $.get('/api/waitingtimes', {date: date, maxLength: 19000}).done(function(data) {
        self.data.endStops = data.endStops;
        callback();
      });
      
      $.get('/api/routes', {date: date, maxLength: 19000}).done(function(data) {
        self.data.routes = data.routes;
        callback();
      });
      
    },
    
    render: function() {
      var self = this;
      var $div = $('<div class="endstop-list">');
      
      _.each(this.data.endStops, function(val, idx) {
        var routes = _.pluck(val.buses, 'route');
        
        var routesAr = _.filter(self.data.routes, function(route) {
          var res = _.contains(routes, route.name);
          return res;
        });
        
        console.log(routesAr);
        var newView = new EndStopView({data: val, routes: routesAr});
        $div.append(newView.render().$el);
      });
      
      this.$el.html($div);
    }
  });
  
  return EndStopListBrowserView;
});