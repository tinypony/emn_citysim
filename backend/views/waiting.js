var utils = require('../utils/utils');
var _ = require('underscore');
var MongoClient = require('mongodb').MongoClient;
var moment = require('moment');
var EndStopArray = require('../dataobject/EndStopArray');

/**
 * REST end point for getting waiting times at the end stops
 */
exports.waiting = function(req, res) {
  MongoClient.connect("mongodb://localhost:27017/ruter", function(err, db) {
    if (!err) {

      db.collection('trips').find({
        dates : utils.getDate(req),
        routeLength : {
          $lt : parseInt(utils.getMaxLength(req), 10)
        }
      }).toArray(function(err, buses) {

        var timeseries = {};
        var busesTotal = buses.length;
        var ends = new EndStopArray(buses);
        var busLookUp = {};
        var moreTime = true;
        var time = moment('00:00', 'HH:mm');

        // Place all buses into a map, use departure as a key
        _.each(buses, function(bus) {
          var departure = _.first(bus.stops).time;

          if (!busLookUp[departure]) {
            busLookUp[departure] = [];
          }

          busLookUp[departure].push(bus);
        });

        var sendResponseAndCloseDB = function() {
          res.type('application/json');

          res.send({
            endStops : _.omit(ends.endStops, function(val, key, object) {
              return !_.keys(val.buses).length;
            })
          });

          db.close();
        };

        // Step through the day
        while (moreTime) {
          var minuteStr = time.format('HHmm');

          // buses leaving at this moment
          var busesNow = busLookUp[minuteStr];

          _.each(busesNow, function(busNow) {
            busNow.runtimeId = ends.getRuntimeId(busNow, 5);
            ends.leave(busNow);
            ends.wait(busNow);
          });

          time.add(1, 'minutes');
          if (time.format('HHmm') === '0000') {
            moreTime = false;
          }
        }

        sendResponseAndCloseDB();
      });
    }
  });
};