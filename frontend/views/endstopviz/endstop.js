define([ 'jquery', 'underscore', 'backbone', 'd3', 'moment', 'hbs!templates/endstopviz/endstopdetails' ], function($, _, Backbone, d3, moment, template) {
  var EndStopDetails = Backbone.View.extend({
    initialize : function(options) {
      this.endstopData = options.data;
    },

    getBusesTotal : function() {
      var retval = 0;
      _.each(this.endstopData.buses, function(val, route) {
        _.each(val, function(timeline, busId) {
          retval++;
        });
      });

      return retval;
    },

    render : function() {
      this.$el.html(template({
        stop : this.endstopData
      }));

      var self = this;
      _.defer(function() {
        self.drawHtml();
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
        var circle = $('<div class="start html-interval" style="left:' + hoffset + '; top: '+voffset+';">');
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
      var width = this.$el.width() - margin.left - margin.right;
      var height = this.getBusesTotal() * 50 - margin.top - margin.bottom;

      var eachScale = 180;
      var timeline = d3.select(this.$('.timeline')[0]);
      var svg = timeline.append('svg').attr('width', '100%').attr('height', height);

    }
  });

  return EndStopDetails;
});