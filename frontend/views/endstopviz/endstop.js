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

    drawHtml : function() {
      var self = this;
      var routes = _.keys(this.endstopData.buses);
      var buses = _.keys(this.endstopData.buses[routes[0]]);
      var oneBus = this.endstopData.buses[routes[0]][buses[0]];
      var width = self.$('.timeline').width();
      var minsInDay = 1440;
      this.$('.timeline').height(100);

      var getIntervalWidth = function(totalWidth, interval) {
        return (interval * totalWidth) / minsInDay;
      }

      var drawInterval = function(interval) {
        var intervalWidth = getIntervalWidth(width, moment(interval.until, 'HHmm').diff(moment(interval.from, 'HHmm'), 'minutes'));
        var offset = getIntervalWidth(width, moment(interval.from, 'HHmm').diff(moment('0000', 'HHmm'), 'minutes'));

        var bar = $('<div class="interval html-interval" style="width:' + intervalWidth + '; left:' + offset + ';">');
        bar.attr('data-start', interval.from);
        bar.attr('data-end', interval.until);
        self.$('.timeline').append(bar);
      }

      var drawStart = function(start) {
        var hoffset = getIntervalWidth(width, moment(start.until, 'HHmm').diff(moment('0000', 'HHmm'), 'minutes')) - 3;
        var voffset = -2;
        var circle = $('<div class="start html-interval" style="left:' + hoffset + '; top: ' + voffset + ';">');
        circle.attr('data-leave', start.until);
        self.$('.timeline').append(circle);
      }

      _.each(oneBus, function(interval) {

        if (!interval.from) {
          drawStart(interval);
        } else {
          drawInterval(interval);
        }

      });
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
      var svg = timeline.append('svg').attr('width', width).attr('height', height);
      var x = d3.scale.linear().domain([ 0, minsInDay ]).range([ 0, width - timelineoffset ]);


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
    }
  });

  return EndStopDetails;
});