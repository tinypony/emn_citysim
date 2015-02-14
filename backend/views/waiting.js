var utils = require('../utils/utils');
var _ = require('underscore');

/**
 * REST end point for getting waiting times at the end stops
 */
exports.waiting = function(req, res) {
  MongoClient.connect("mongodb://localhost:27017/ruter", function(err, db) {
    if (!err) {
      
      db.collection('trips').find({
        dates : utils.getDate(req),
        routeLength : { $lt : parseInt(utils.getMaxLength(req), 10) }
      }).toArray(function(err, buses) {

        var timeseries = {};
        var busesTotal = buses.length;
        var ends = new EndStopArray(buses);
        var busLookUp = {};
        var moreTime = true;
        var time = moment('00:00', 'HH:mm');
        var prechargeEnergy = 0;
        var chargeEnergy = 0;
        
        //Place all buses into a map, use departure as a key
        _.each(buses, function(bus) {
          var departure = _.first(bus.stops).time;
          
          if( !busLookUp[departure] ) {
            busLookUp[departure] = [];
          }
          
          busLookUp[departure].push(bus);
        });
        
        var sendResponseAndCloseDB = function() {
          res.type('application/json');
//          
          var controlsum = 0;
          _.each(timeseries, function(val, key){
            controlsum += (val * 1/60);
          });
          
          res.send({
            chargeEnergy : Math.round(chargeEnergy) + " kWh",
            prechargeEnergy : Math.round(prechargeEnergy) + " kWh",
            max: _.max(_.values(timeseries), function(power){
              return power;
            }),
            timeseries : timeseries,
            endStops: ends.getProcessed()
          });

          db.close();
        };

        //Step through the day
        while (moreTime) {
          var minuteStr = time.format('HHmm');

          if (!timeseries[minuteStr]) {
            timeseries[minuteStr] = 0;
          }

          // buses leaving at this moment
          var busesNow = busLookUp[minuteStr];

          _.each(busesNow, function(busNow) {
            var waitingStart = ends.waitingSince(busNow);

            if (waitingStart) {
              chargeEnergy += handleWaitingBus({
                endStops : ends,
                bus : busNow,
                timeseries : timeseries,
                then : waitingStart,
                now : minuteStr
              }, req);
            } else {
              prechargeEnergy += getEnergyConsumptionPerKm(req) * busNow.routeLength/1000;
            }
            
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