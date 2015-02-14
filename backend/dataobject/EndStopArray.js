var _ = require('underscore');
var moment = require('moment');
var MINIMUM_CHARGING_TIME = 8;
var EndStop = require('./EndStop').EndStop;
/**
 * Creates and maintains a map of all end stops for the provided routes
 * 
 * @param buses -
 *            all bus services on the specified day
 */
var EndStopArray = function(buses) {
  var self = this;
  this.endStops = {};
  this.routeEnds = {};

  _.each(buses, function(bus) {
    var firstStop = _.first(bus.stops);
    var lastStop = _.last(bus.stops);

    self.putEnds(bus, firstStop, lastStop);
  });
}

/**
 * Returns stripped route number e.g. 102T will return 102. This is based on
 * assumption that routes ending with a letter are just modifications of the
 * base routes and buses can switch between them at the end stops.
 * 
 * @param {Object}
 *            bus - a single bus service
 * @returns
 */
function getRoute(bus) {
  var fullRoute = bus.route;
// return fullRoute.replace(/T|B|K|V/g, '');
  return fullRoute;
}

function getDeparture(bus, isMoment) {
  var departure = _.first(bus.stops).time;
  if (isMoment) {
    return moment(departure, 'HHmm');
  } else {
    return departure;
  }
}

EndStopArray.prototype.getDirection = function(bus) {
  if (bus.direction) {
    return bus.direction;
  }
}

EndStopArray.prototype.getReverseDirection = function(bus) {
  var direction = this.getDirection(bus);

  if (direction === '0') {
    return '1';
  } else if (direction === '1') {
    return '0';
  } else {
    throw new Error('Invalid direction!');
  }
}

EndStopArray.prototype.putEnds = function(bus, first, last) {
  var self = this;

  if (!this.routeEnds[getRoute(bus)]) {
    this.routeEnds[getRoute(bus)] = {
      '0' : [],
      '1' : []
    };
  }

  this.routeEnds[getRoute(bus)][this.getDirection(bus)][0] = _.first(bus.stops).id;
  this.routeEnds[getRoute(bus)][this.getDirection(bus)][1] = _.last(bus.stops).id;

  this.put(first).put(last);
}

EndStopArray.prototype.routeStart = function(route, direction) {
  return this.routeEnds[route][direction][0];
}

EndStopArray.prototype.routeEnd = function(route, direction) {
  return this.routeEnds[route][direction][1];
}

/**
 * Puts new bus stop into end stop array
 */
EndStopArray.prototype.put = function(stop) {
  // Physical stop
  var endStop = new EndStop();
  
/*{
    id : stop.id,
    name : stop.name,
    total : 0,
    leavingRoutes : [],
    comingRoutes : [],
    timeseries : {}
  };*/

  if (!this.endStops[stop.id]) {
    this.endStops[stop.id] = endStop;
  }

  return this;
}

EndStopArray.prototype.getFirstEndStop = function(bus, reverseDirection) {
  if(reverseDirection) {
    return this.endStops[this.routeStart(getRoute(bus), this.getReverseDirection(bus))];
  } else {
    return this.endStops[this.routeStart(getRoute(bus), this.getDirection(bus))];
  }
}

EndStopArray.prototype.getLastEndStop = function(bus, reverseDirection) {
  if(reverseDirection) {
    return this.endStops[this.routeEnd(getRoute(bus), this.getReverseDirection(bus))];
  } else {
    return this.endStops[this.routeEnd(getRoute(bus), this.getDirection(bus))];
  }
}

EndStopArray.prototype.getReverseRouteEnds = function(bus) {
  var ends = this.routeEnds[getRoute(bus)][this.getReverseDirection(bus)];

  if (!ends) {
    /*
     * fallback and assume the same stops (can occur when reverse route is longer 
     * that given threshold and has not been processed)
     */
    return this.routeEnds[getRoute(bus)][this.getDirection(bus)]; 
  }

  return ends;
}

/**
 * Tells if a bus of certain route is already waiting at its end stop
 * 
 * @param {Object}
 *            bus - object representing a single bus trip
 * @returns {String} - string representation of the time a bus of the same route
 *          arrived at that end stop or undefined if no buses arrived yet
 */
EndStopArray.prototype.waitingSince = function(bus) {
  var firstStop = this.getFirstEndStop(bus);
  return firstStop.waitingSince(getRoute(bus), bus.runtimeId);
}

EndStopArray.prototype.leave = function(bus) {
  var firstStop = this.getFirstEndStop(bus);
  firstStop.leave(getRoute(bus), bus.runtimeId, getDeparture(bus));
}

/**
 * Mark bus as processed and let it wait at the first stop of the return trip
 * 
 * @param {Object}
 *            bus - object representing a single bus trip
 */
EndStopArray.prototype.wait = function(bus) {
  var endStop = this.getFirstEndStop(bus, true);
  var route = getRoute(bus);
  endStop.wait(route, bus.runtimeId, _.last(bus.stops).time);
}

/**
 * Stores power consumption to the bus stop. First stop of the route is used for
 * that purpose
 */
EndStopArray.prototype.chargeBus = function(bus, power, timeStr) {
  var firstStop = this.getFirstEndStop(bus, true);
  if (!firstStop.timeseries[timeStr]) {
    firstStop.timeseries[timeStr] = {
      power : 0,
      buses : 0
    };
  }

  firstStop.timeseries[timeStr].power += power;
  firstStop.timeseries[timeStr].buses += 1;
  firstStop.total += power * (1 / 60); // resolution is one minute, so the
  // energy will be (P * 1/60) kWh
}

EndStopArray.prototype.getProcessed = function() {
  // Flatten families
  var retval = {};

  _.each(this.endStops, function(stop, stopId) {
    if (stop.total > 1) {
      stop.total = Math.round(stop.total);
      var ts = {};

      _.each(stop.timeseries, function(val, key) {
        ts[key] = {
          time : key,
          power : val.power,
          buses : val.buses
        };
      });

      stop.timeseries = ts;

      retval[stop.id] = stop;
    }
  });

  // // sort in descending order by total consumption
  retval = _.sortBy(retval, function(stop) {
    return -stop.total;
  });

  // drop stops that have consumption below threshold
  // retval = _.filter(retval, function(stop) {
  // return stop.total > 1;
  // });

  return retval;
}

exports.EndStopArray = EndStopArray;