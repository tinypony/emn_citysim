var _ = require('underscore');
var moment = require('moment');
var MINIMUM_CHARGING_TIME = 5;
/**
 * Creates and maintains a map of all end stops for the provided routes
 * 
 * @param buses -
 *          all bus services on the specified day
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
 *          bus - a single bus service
 * @returns
 */
function getRoute(bus) {
  var fullRoute = bus.route;
  return fullRoute.replace(/T|B|K|V/g, '');
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
  var serv = bus.serviceNbr;
  return serv.charAt(serv.length-1);
}

EndStopArray.prototype.getReverseDirection = function(bus) {
  var direction = this.getDirection(bus);
  
  if(direction === '1') {
    return '2';
  } else  if(direction === '2'){
    return '1';
  } else {
    throw new Error('Invalid direction!');
  }
}


EndStopArray.prototype.putEnds = function(bus, first, last) {
  var self = this;
  
  if(!this.routeEnds[bus.route]) {
    this.routeEnds[bus.route] = {
      '1': [],
      '2': []
    };
  }
  
  this.routeEnds[bus.route][this.getDirection(bus)] = [_.first(bus.stops).id, _.last(bus.stops).id];
  
  this.put(first).put(last);
}

/**
 * Puts new bus stop into end stop array 
 */
EndStopArray.prototype.put = function(stop) {
  // Physical stop
  var endStop = {
    id: stop.id,
    name: stop.name,
    total: 0,
    leavingRoutes: [],
    comingRoutes: [],
    timeseries: {}
  };

  if (!this.endStops[stop.id]) {
    this.endStops[stop.id] = endStop;
  } 

  return this;
}

EndStopArray.prototype.getFirstEndStop = function(bus) {
  var firstStop = _.first(bus.stops);
  return this.endStops[firstStop.id];
}

EndStopArray.prototype.getLastEndStop = function(bus, physical) {
  var lastStop = _.last(bus.stops);
  return this.endStops[lastStop.id];
}

EndStopArray.prototype.getReverseRouteEnds = function(bus) {
  var ends = this.routeEnds[bus.route][this.getReverseDirection(bus)];
  
  if(!ends.length) {
   return  this.routeEnds[bus.route][this.getDirection(bus)]; // fallback and assume the same stops (can occur when reverse route is longer than given threshold)
  }
  
  return ends;
}

/**
 * Tells if a bus of certain route is already waiting at its end stop
 * 
 * @param {Object}
 *          bus - object representing a single bus trip
 * @returns {String} - string representation of the time a bus of the same route
 *          arrived at that end stop or undefined if no buses arrived yet
 */
EndStopArray.prototype.waitingSince = function(bus) {
  var firstStop = this.getFirstEndStop(bus);
  var lastStopId = this.getReverseRouteEnds(bus)[1];
  
  var stop = this.endStops[lastStopId];
  
  if(!stop) {
    console.log(this.getReverseRouteEnds(bus));
    console.log(bus.route);
    console.log(firstStop);
    console.log(this.routeEnds[bus.route]);
  }
  
  var route = getRoute(bus);
  var departure = getDeparture(bus, true);
  var retval;

  var busQueue = stop[route];
  
  if (busQueue && busQueue.length) {
    var firstDepartureInQueue = _.min(busQueue, function(time) {
      return parseInt(time, 10);
    });
  
    // Check if buses at the end stop are not from the future :)
    if (departure.diff(moment(firstDepartureInQueue, 'HHmm'),
        'minutes') >= MINIMUM_CHARGING_TIME) {
      stop[route] = _.without(busQueue, firstDepartureInQueue);
      retval = firstDepartureInQueue;
    }
  }

  return retval;
}

EndStopArray.prototype.leave = function(bus) {
  var firstStop = this.getFirstEndStop(bus, true);
  if(!_.contains(firstStop.leavingRoutes, bus.route)) {
    firstStop.leavingRoutes.push(bus.route);
  }
}

/**
 * Mark bus as processed and let it wait at the last stop
 * 
 * @param {Object}
 *          bus - object representing a single bus trip
 */
EndStopArray.prototype.wait = function(bus) {
  var endStop = this.getLastEndStop(bus, true);
  var route = getRoute(bus);

  
  if(!_.contains(endStop.comingRoutes, bus.route)) {
    endStop.comingRoutes.push(bus.route);
  }
  
  if (!endStop[route]) {
    endStop[route] = [];
  }

  endStop[route].push(_.last(bus.stops).time);
}

/**
 * Stores power consumption to the bus stop.
 * First stop of the route is used for that purpose
 */
EndStopArray.prototype.chargeBus = function(bus, power, timeStr) {
  var firstStop = this.getFirstEndStop(bus, true);
  if (!firstStop.timeseries[timeStr]) {
    firstStop.timeseries[timeStr] = {
        power: 0,
        buses: 0
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
    if(stop.total > 1) {
      stop.total = Math.round(stop.total);
      var ts = {};
      
      _.each(stop.timeseries, function(val, key) {
        ts[key] = {
          time: key,
          power: val.power,
          buses: val.buses
        };
      });
      
      stop.timeseries = ts;
      
      retval[stop.id] = stop;
    }
  });
  
//
//  // round consumption
//  retval = _.map(retval, function(stop) {
//    stop.total = Math.round(stop.total);
//    stop.timeseries = _.map(stop.timeseries, function(val, key) {
//      return {
//        time: key,
//        power: val
//      };
//    });
//    return stop;
//  });
//
//  // sort in descending order by total consumption
    retval = _.sortBy(retval, function(stop) {
      return -stop.total;
    });

   //drop stops that have consumption below threshold
//   retval = _.filter(retval, function(stop) {
//     return stop.total > 1;
//   });

  return retval;
}

exports.EndStopArray = EndStopArray;