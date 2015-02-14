var EndStop = require('../../backend/dataobject/EndStop');

describe('EndStop', function() {
	
	var endStop;
	
	beforeEach(function(){
		endStop = new EndStop();
	});
	
	it('stores waiting bus', function() {
		endStop.wait('102', 'id1', '0500');
		endStop.wait('102', 'id2', '0510');
		expect(endStop.waitingSince('102', 'id1')).toBe('0500');
		expect(endStop.waitingSince('102', 'id2')).toBe('0510');
	});
	
	it('detects when the same bus goes waiting again', function() {
		endStop.wait('102', '1', '0500');
		expect(function(){
			endStop.wait('102', '1', '0500');
		}).toThrow(new Error('The same bus is already waiting'));
	});
	
	it('detects when the same bus leaves before it started waiting', function() {
		endStop.wait('102', '1', '0500');
		expect(function(){
			endStop.leave('102', '1', '0455');
		}).toThrow(new Error('Time order is incorrect'));
	});
	
	it('stores waiting time when bus leaves', function() {
		endStop.wait('102', '1', '0500');
		endStop.leave('102', '1', '0510');
		expect(endStop.waiting['102']['1']).not.toBeDefined();
		expect(endStop.buses['102']['1'][0].from).toBe('0500');
		expect(endStop.buses['102']['1'][0].until).toBe('0510');
	});
});