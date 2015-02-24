define([ 'jquery', 'jquery-ui', 'underscore', 'moment', 'backbone', 'd3', 'hbs!templates/routes-viz' ], function($, JUI, _, moment, Backbone, d3, template) {

  var RouteVisualizationView = Backbone.View.extend({

    initialize : function() {
      var self = this;
      this.getData().done(function(data) {
        self.data = data;
        self.render();
      });
    },

    getData : function() {
      return $.get('/api/routes');
    },

    renderDate : function(date) {
      var routeCount = this.data.length;

      this.$('#chart > svg').empty();
      var width = this.$('#chart').width();
      var barHeight = 19;
      height = (barHeight) * routeCount;

      var x = d3.scale.linear().domain([ 0, 300 ]).range([ 0, width - 50 ]);

      var chart = d3.select('#chart > svg').attr('width', width - 50).attr('height', height);

      var bar = chart.selectAll('g').data(this.data).enter().append('g').attr('transform', function(d, i) {
        return 'translate(0, ' + i * (barHeight) + ')';
      });

      bar.append('rect').attr('height', barHeight).attr('width', function(item) {
        var dateStats = _.find(item.dates, function(entry) {
          return entry.date === date;
        });
        if (_.isUndefined(dateStats)) {
          return 0;
        } else {
          return x(dateStats.departures);
        }
      });

      bar.append('text').attr('x', function(item, i) {
        return 0;
      }).attr('y', 0).attr('dy', 13).text(function(d) {
        return d.route;
      });
    },

    render : function() {
      var self = this;
      this.$el.html(template({
        routes : this.data
      }));

      this.$('.date-slider').slider({
        max : 13,
        min : 0,
        step : 1,
        value : 0,
        change : function(event, ui) {
          var value = parseInt(ui.value, 10);
          value = 9 + value;
          var mom = moment('2015-2-' + value, 'YYYY-M-D');
          self.$('.weekday').text(mom.format('dddd'));
          self.renderDate(mom.format('YYYY-M-D'));
        }
      });

      _.defer(function() {
        self.renderDate('2015-2-9');
      });
    }
  });

  return RouteVisualizationView;
});