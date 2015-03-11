define([ 'jquery', 
         'underscore', 
         'backbone', 
         'mapbox', 
         'mocks',
         'scroller',
         'api-config', 
         'bootstrap',
         'chroma',
         'views/routes-overview/endstop-details',
         'views/routes-overview/map-view',
         'hbs!templates/routes-overview',
         'hbs!templates/routes-overview/route-list'], 
         function($, _, Backbone, Mapbox, Mocks, scroller,
             ApiConfig, bootstrap, chroma, EndStopDetails, MapView, template, routeListTemplate) {

  
  var RouteList = Backbone.View.extend({
    
    events: {
      'mouseover .accordion-toggle': 'onMouseover',
      'mouseout .accordion-toggle': 'onMouseout'
    },
    
    initialize: function(options){
      this.data = options.data;
    },
    
    onMouseout: function(ev) {
      $target = $(ev.currentTarget);
      var routeName = $target.attr('data-route');
      this.trigger('route:highlight', routeName, false);
    },

    
    onMouseover: function(ev) {
      $target = $(ev.currentTarget);
      var routeName = $target.attr('data-route');
      this.trigger('route:highlight', routeName, true);
    },
    
    render: function() {
      this.$el.html(routeListTemplate({
        routes: _.sortBy(this.data.routes, function(route){
          return -route.dayStats.rank;
        })
        
      }));
      var self = this;
      
      this.$('#accordion2').collapse();
      
      _.defer(function() {
        self.$('.nano').nanoScroller({flash: true});
        
        self.$('.accordion-group').on('show.bs.collapse', function(ev) {
          var $tar = $(ev.currentTarget);
          $tar.toggleClass('toggle-on');
        });
        
        self.$('.accordion-group').on('hide.bs.collapse', function(ev) {
          var $tar = $(ev.currentTarget);
          $tar.toggleClass('toggle-on');
        });
      });
      
      return this;
    }
  });
  
  var RoutesOverview = Backbone.View.extend({
    defaultDate: '2015-2-18',
    
    initialize : function(optimize) {
      _.bindAll(this, ['displayData']);
      this.date = this.defaultDate;
      this.retrieveData(true);
    },
    
    retrieveData: function( isFirst) {
      var self = this;
      
      $.get('/api/routes?date='+this.date).done(function(data){
        self.routeData = data;
        
        if(isFirst) {
          self.render();
        } else {
          self.displayData(self.routeData);
        }
      });
    },
    
    getDate: function() {
      return this.date;
    },

    
    getStat: function(route, date) {
      var routeObj;
      var routes = this.routeData.routes;
      
      if(_.isString(route)) {
        routeObj = _.find(routes, function(item){
          return item.name === route;
        });
      } else {
        routeObj = route;
      }
      
      return routeObj.dayStats;
    },
    
    displayData: function(data) {
      var self = this;
      if(this.listView){
        this.stopListening(this.listView);
        this.listView.remove();
      }
      
      var reduction = _.reduce(data.routes, function(memo, route){
        return memo + route.dayStats.co2 + route.dayStats.nox + route.dayStats.co;
      }, 0);
      
      var cost = data.routes.length * 2000000;
      
      this.$('.top-level-results .emission-reduction').text('Emission reduction: '+Math.round(reduction) + 'kg/day');
      this.$('.top-level-results .infrastructure-cost').text('Infrastrucutre cost: '+ cost + ' EUR');
      
      this.mapView.displayData(data.routes, data.rankDomain);      
      
      this.listView = new RouteList({data: data});     
      this.$('.side-list').append(this.listView.render().$el);
      
      this.listenTo(this.listView, 'route:highlight', function(routeName, isHighlighted){
        self.mapView.highlightRoute(routeName, isHighlighted);
      });
      
    },

    render : function() {
      var self = this;      
      this.$el.html(template());
      
//      this.$('#inputDate').datepicker({
//        minDate: new Date('2015-02-09'),
//        maxDate: new Date('2015-02-22'),
//        defaultDate: new Date('2015-02-17'),
//        onSelect: function() {
//          var dateObj = self.$('#inputDate').datepicker('getDate');
//          self.date = $.datepicker.formatDate('yy-m-d', dateObj);
//          self.retrieveData();
//        }
//      });
      
      this.mapView = new MapView({el: this.$('#map')});
      this.mapView.render();
      this.listenTo(this.mapView, 'show:endstop', function(stopId){
        self.endStopDetails.setData(Mocks.getEndStopData());
        self.endStopDetails.show();
      });
      

      this.endStopDetails = new EndStopDetails({el: this.$('.endstop-details')});
      this.endStopDetails.render();
      
      this.displayData(this.routeData);
    }

  });

  return RoutesOverview;
});