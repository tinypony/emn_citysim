define([ 'jquery', 'underscore', 'backbone', 'd3', 'moment', 'hbs!templates/endstopviz/endstopdetails' ], function($, _, Backbone, d3, moment, template) {
  var EndStopDetails = Backbone.View.extend({
    initialize : function(options) {
      this.endstopData = options.data;
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
        // self.drawHtml();
        self.drawSvg();
      })

      return this;
    },

    drawSvg : function() {
      var margin = {
        top : 20,
        right : 20,
        bottom : 30,
        left : 50
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
      var routeoffset = 5;
      var minsInDay = 1440;
      var lineHeight = 4;
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

        routeLabel.append('rect')
          .attr('width', 3)
          .attr('height', busTimelineHeight * selectedRoute.vehicles.length);

        routeLabel.append('text')
        .attr('x', -30)
        .attr('y', 15).text(selectedRoute.route);
      }

      var visualizeRoute = function(selectedRoute, routeIdx, arr) {
        appendRouteLabel(selectedRoute, routeIdx, arr);
        
        _.each(selectedRoute.vehicles, function(vehicle, idx) {

          var graphic = svg.append('g').attr('transform', function(d) {
            return 'translate(' + timelineoffset + ',' + timelineOffset(idx, routeIdx) + ')';
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