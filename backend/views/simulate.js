var _ = require('underscore');
var mongoose = require('mongoose');
var Bus = mongoose.model('BusService');
var MongoClient = require('mongodb').MongoClient;
var moment = require('moment');

var getDate = function(req) {
  return "2014-12-17";
}

var getTotalEnergy = function(buses) {
  return kilometersTotal(buses) * getEnergyConsumptionPerKm();
}

var kilometersTotal = function(buses) {
  return _.reduce(buses, function(total, bus) {
    return total + bus.routeLength / 1000;
  }, 0);
}

function getEnergyConsumptionPerKm(req) {
  return 1.1;
}

function getEfficiency(req) {
  return 1;
}

function getElectrificationPercentage(req) {
  return 0.5;
}

function extractEndStops(buses) {
  var retval = {};
  _.each(buses, function(bus) {
    var firstStop = _.first(bus.stops);
    var lastStop = _.last(bus.stops);

    if (!retval[firstStop.id]) {
      retval[firstStop.id] = {};
    }

    if (!retval[lastStop.id]) {
      retval[lastStop.id] = {};
    }
  });

  return retval;
}

function waitingSince(endStops, bus) {
  var firstStop = _.first(bus.stops);
  var stopMap = endStops[firstStop];

  if (stopMap[bus.route] && stopMap[bus.route].length) {
    return stopMap[bus.route].unshift();
  } else {
    return undefined;
  }
}

function travelRoute(endStops, bus) {
  var lastStop = _.last(bus.stops);
  var stopMap = endStops[lastStop];

  if (!stopMap[bus.route]) {
    stopMap[bus.route] = [];
  }
  stopMap[bus.route].push(lastStop.time);
}

function getTimeDifference(now, then) {
  var nowMoment = moment(now, 'HHmm');
  var thenMoment = moment(then, 'HHmm');

  return nowMoment.diff(thenMoment, 'minutes');
}
/**
 * Returns power used by the charger to provide energy for the next bus trip
 * 
 * @param {Object}
 *          params - contains all necessary parameters needed to calculate power
 * @param {Number}
 *          [params.consumption] - tells the average energy consumption per km
 * @param {Number}
 *          params.length - specifies the length of the route in kilometers
 * @param {Number}
 *          params.chargingTime - specifies charging time available for the bus
 *          in minutes
 * @param {Number}
 *          [params.efficiency] - specifies charger's efficiency
 * 
 * @returns {Number}
 */
function powerNeeded(params) {
  params = _.defaults(params, {
    consumption : 1,
    efficiency : 1
  });

  var intakePower = (params.consumption * params.length) / (params.chargingTime / 60);
  var powerDraw = intakePower / params.efficiency;
  return powerDraw;
}

/**
 * Calculates ad saves charging power needed for the next bus trip
 * 
 * @param {Object}
 *          params
 * @param {Object}
 *          params.endStops - a map of all end stops for keeping track of
 *          waiting buses
 * @param {Object}
 *          params.bus - bus that needs to be charged before the next trip
 * @param {Object}
 *          params.timeseries - object containing the power of all chargers
 *          combined during the day
 * @param {String}
 *          params.waitingStarted - the time when the bus arrived at the end
 *          stop and started charging
 * @param {String}
 *          params.now - current moment
 * @param {Object}
 *          req - rest request object
 */
function handleWaitingBus(params, req) {
  var difference = getTimeDifference(params.now, params.then);
  var power = powerNeeded({
    consumption : getConsumption(req),
    length : params.bus.routeLength,
    chargingTime : difference,
    efficiency : getEfficiency(req)
  });

  var thenMoment = moment(params.then, 'HHmm');

  for (var i = 0; i < difference; i++) {
    thenMoment.add(i, 'minutes');
    var timeStr = thenMoment.format('HHmm');
    params.timeseries[timeStr] = params.timeseries[timeStr] + power;
  }
}

exports.list = function(req, res) {
  MongoClient.connect("mongodb://localhost:27017/hsl", function(err, db) {
    if (!err) {
      var busesToday = db.collection('buses').find({
        dates : getDate(req)
      });

      busesToday.toArray(function(err, buses) {
        var timeseries = {};
        var endStops = extractEndStops(buses);
        var totalEnergy = 0;
        var moreTime = true;
        var time = moment('00:00', 'HH:mm');

        while (moreTime) {

          var minuteStr = time.format('HHmm');

          if (!timeseries[minuteStr]) {
            timeseries[minuteStr] = 0;
          }

          // Find all buses leaving now
          db.collection('buses').find({
            dates : getDate(req),
            'stops.0.time' : minuteStr
          }).toArray(function(err, busesNow){
            // Iterate over the buses and check if they have been charging
            _.each(busesNow, function(busNow) {
              var waitingStart = waitingSince(endStops, busNow);

              if (waitingStart) {
                handleWaitingBus({
                  endStops : endStops,
                  bus : busNow,
                  timeseries : timeseries,
                  waitingStarted : waitingStart,
                  now : minuteStr
                }, req);
              }

              travelRoute(endStops, bus);
            });
          });

         

          time.add(1, 'minutes');
          if (time.format('HHmm') === '0000') {
            moreTime = false;
          }
        }

        res.type('application/json');
        res.send({
          totalEnergy: getTotalEnergy(buses) + " kWh",
          timeseries: timeseries 
        });

        db.close();
      });
    }
  });
};