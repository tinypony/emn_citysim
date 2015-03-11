define([ 'jquery', 
         'underscore', 
         'amcharts.radar', 
         'backbone',
         'd3',
         'moment', 
         'hbs!templates/endstopviz/endstopdetails' ], 
    function($, _, amRef, Backbone,  d3, moment, template) {
  var EndStopDetails = Backbone.View.extend({
   
    initialize : function(options) {
      this.endstopData = options.data;
      this.routes = options.routes;
    },

    getBusesTotal : function(routeName) {
      var retval = 0;
      _.each(this.endstopData.buses, function(val, idx) {
        if (_.isUndefined(routeName) || routeName === val.route) {
          _.each(val.vehicles, function(timeline, busId) {
            retval++;
          });
        }
      });

      return retval;
    },

    render : function() {
      this.$el.html(template({
        stop : this.endstopData
      }));

      var self = this;
      _.defer(function() {
        self.drawSvg();
      })

      return this;
    },
    

    drawWebChart : function(routeName) {
      var routeStats = _.find(this.routes, function(route) {
        return route.name === routeName;
      });
      
      var routeTimes = _.find(this.endstopData.buses, function(stop){
        return stop.route == routeName;
      });
      
      var id = _.uniqueId('webchart_');
      this.$('.web-chart').empty().append($('<div id="' + id + '"></div>'));

      var minWaits = _.map(routeTimes.vehicles, function(vehicle){
        var waitingTimes = _.map(vehicle.waitingTimes, function(time){
          var fromMoment = moment(time.from, 'HHmm');
          var untilMoment = moment(time.until, 'HHmm');
          var waitingTime = untilMoment.diff(fromMoment, 'minutes');
          if(waitingTime < 0) {
            return 24 * 60 + waitingTime; //over midnight flip
            
          }else {
            return waitingTime;
          }
        });
        
        return _.min(waitingTimes);
      });
      
      var minWait = _.min(minWaits);

      var dataProvider = [ {
        variable : 'Length',
        value : routeStats.dayStats.length
      }, {
        variable : 'Departures',
        value : routeStats.dayStats.frequencyRatio
      }, {
        variable : 'Charger power (1kWh/km consumption)',
        value : ((routeStats.dayStats.length) * 1) / (minWait * 60)
      }, {
        variable : 'Charger power (2kWh/km consumption)',
        value : ((routeStats.dayStats.length) * 2) / (minWait * 60)
      },{
        variable : 'Charger power (3kWh/km consumption)',
        value : ((routeStats.dayStats.length) * 3) / (minWait * 60)
      }];      
    },

    drawSvg : function() {
      var margin = {
        top : 20,
        right : 20,
        bottom : 30,
        left : 50
      };
      
      var routeStatsOffset = function(routeIdx) {
        if (routeIdx === 0) {
          return 0;
        } else {
          return routeStatsOffset(routeIdx-1) + routeHeight(routeIdx - 1);
        }
      };
      
      var routeHeight = function(routeIdx) {
        return self.endstopData.buses[routeIdx].vehicles.length * busTimelineHeight + routeoffset;
      };
      
      //Calculates height of all timelines including specified route
      var routeStatsHeight = function(routeidx) {
        if(routeidx === 0) {
          return self.endstopData.buses[0].vehicles.length * busTimelineHeight + routeoffset;
        } else {
          return routeStatsHeight(routeidx-1) + self.endstopData.buses[routeidx].vehicles.length * busTimelineHeight + routeoffset;
        }
      };

      //Calculates exact vertical offset of a bus timeline
      var timelineOffset = function(busidx, routeidx) {
        if (routeidx === 0) {
          return busidx * busTimelineHeight;
        } else {
          return routeStatsHeight(routeidx - 1) + busidx * busTimelineHeight;
        }
      };
      
      var self = this;
      var timelineoffset = 40;
      var routeoffset = 35; // space between timeseries that belong to different routes
      var minsInDay = 1440;
      var lineHeight = 3;
      var width = this.$('.timeline').width();
      var busTimelineHeight = 15;
      var height =  routeStatsHeight(this.endstopData.buses.length-1);

      var timeline = d3.select(this.$('.timeline')[0]);
      var svg = timeline.append('svg').attr('width', width).attr('height', height + 40);
      var x = d3.scale.linear().domain([ 0, minsInDay ]).range([ 0, width - timelineoffset ]);
      
      var formatTime = d3.time.format("%H:%M"),
      formatMinutes = function(d) { return formatTime(new Date(2012, 0, 1, 0, d)); };
      var xAxis = d3.svg.axis().scale(x).orient('bottom').ticks(12).tickFormat(formatMinutes);
      

      var appendRouteLabel = function(selectedRoute, routeIdx, arr) {
        
        var routeLabel = svg.append('g').attr('transform', function() {
          if (routeIdx === 0) {
            return 'translate(30, 0)';
          } else {
            return 'translate(30, ' + routeStatsHeight(routeIdx-1)+ ')';
          }
        });

        //Vertical bar
        routeLabel.append('rect')
          .attr('width', 3)
          .attr('height', busTimelineHeight * selectedRoute.vehicles.length);

        //Route name label
        routeLabel.append('text')
        .attr('x', -30)
        .attr('y', 15).text(selectedRoute.route);
      }

      var visualizeRoute = function(selectedRoute, routeIdx, arr) {
        appendRouteLabel(selectedRoute, routeIdx, arr);
        var routeTimelinesContainer = svg.append('g')
                                      .attr('class', 'route-timelines')
                                      .attr('transform', 'translate('+ timelineoffset +','+ routeStatsOffset(routeIdx) +')');
        
        routeTimelinesContainer.on('click', function() {
        //  self.drawWebChart(selectedRoute.route);
          console.log(_.find(self.routes, function(route) {
            return route.name === selectedRoute.route;
          }));
        });
                                      
        
        var routeBackground = routeTimelinesContainer.append('rect')
                              .attr('class', 'route-background')
                              .attr('height', routeHeight(routeIdx) - routeoffset)
                              .attr('width', width - timelineoffset);
        
        _.each(selectedRoute.vehicles, function(vehicle, idx) {

          //bus timeline
          var graphic = routeTimelinesContainer.append('g').attr('transform', function(d) {
            return 'translate(0,' + timelineOffset(idx, 0) + ')';
          });

          var busTimeline = graphic.selectAll('g').data(vehicle.waitingTimes).enter().append('g');

          busTimeline.append('rect').attr('x', function(d) {
            return x(moment(d.from, 'HHmm').diff(moment('0000', 'HHmm'), 'minutes'));
          }).attr('width', function(d) {
            return x(moment(d.until, 'HHmm').diff(moment(d.from, 'HHmm'), 'minutes'));
          }).attr('height', lineHeight);
        });
      };

      _.each(this.endstopData.buses, visualizeRoute);
      svg.append('g').attr('transform', 'translate('+ timelineoffset +',' + (height)+ ')').attr('class', 'x-axis').call(xAxis);
    }
  });

  return EndStopDetails;
});