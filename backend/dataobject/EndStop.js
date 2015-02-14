var _ = require('underscore');
var moment = require('moment');

function EndStop() {
	this.buses = {};
	this.waiting = {};
}

EndStop.prototype.wait = function(route, busId, start) {
	if (!this.waiting[route]) {
		this.waiting[route] = {};
	} else if (!_.isUndefined(this.waiting[route][busId])) {
		this.waiting[route][busId] = start;
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
	if (!this.waiting[route] || !this.waiting[route][busId]) {
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

exports.EndStop = EndStop;