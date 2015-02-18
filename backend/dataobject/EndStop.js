var _ = require('underscore');
var moment = require('moment');

function EndStop(details) {
  this.id = details.id;
  this.name = details.name;
	this.buses = {};
	this.waiting = {};
}

EndStop.prototype.waitingSince = function(route, busId) {
  if(!this.waiting[route] || !this.waiting[route][busId]) {
    return false;
  } else {
    return this.waiting[route][busId];
  }  
}

EndStop.prototype.wait = function(route, busId, start) {
	if (!this.waiting[route]) {
		this.waiting[route] = {};
	} else if (!_.isUndefined(this.waiting[route][busId])) {
//    console.log(route + ':' + busId + ':' + start);
//    console.log(this.waiting[route]);
		throw new Error('The same bus is already waiting');
	}

	this.waiting[route][busId] = start;
}

EndStop.prototype.leave = function(route, busId, end) {
	if (_.isUndefined(this.buses[route])) {
		this.buses[route] = {};
	} 
	
	if (_.isUndefined(this.buses[route][busId])) {
		this.buses[route][busId] = [];
	}
	
	//If the bus is leaving for the first time (just from a depot)
	if (!this.waitingSince(route, busId)) {
		var firstEntry = {
			until : end
		}; 
		
		this.buses[route][busId].push(firstEntry);
	} else {
		var start = this.waiting[route][busId];
		
		if(moment(end, 'HHmm').diff(moment(start, 'HHmm'), 'minutes') < 0) {
			throw new Error('Time order is incorrect');
		}
		
		this.waiting[route] = _.omit(this.waiting[route], busId);
		
		this.buses[route][busId].push({
			from: start,
			until: end
		});
	}
}

module.exports = EndStop;