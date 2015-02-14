var EndStopArray = require('../../backend/dataobject/EndStopArray');

describe('EndStopArray', function() {
  var testBusA, testBusB;

  beforeEach(function() {
    testBusA = {
      route : '102',
      runtimeId: 'bus1',
      serviceNbr : '102 1',
      direction : '0',
      stops : [ {
        id : 'id1',
        name : 'stopA',
        time : '1055'
      }, {
        id : 'id2',
        name : 'stopB',
        time : '1155'
      } ]
    };

    testBusB = {
      route : '102',
      runtimeId: 'bus1',
      serviceNbr : '102 2',
      direction : '1',
      stops : [ {
        id : 'id3',
        name : 'stopB',
        time : '1205'
      }, {
        id : 'id5',
        name : 'stopA',
        time : '1300'
      } ]
    };
  });

  it('Correctly finds recently arrived bus when stops at both ends are different', function() {
    var ends = new EndStopArray([ testBusA, testBusB ]);

    expect(ends.waitingSince(testBusA)).toBeFalsy();
    expect(ends.waitingSince(testBusB)).toBeFalsy();
    
    ends.wait(testBusA);
    expect(ends.waitingSince(testBusB)).toBe('1155');
    
    ends.wait(testBusB);
    expect(ends.waitingSince(testBusA)).toBe('1300');
  });

  it('Correctly finds recently arrived bus when stops at one end are different', function() {
    var testBusA = {
      route : '102',
      runtimeId: 'bus1',
      serviceNbr : '102 1',
      direction : '0',
      stops : [ {
        id : 'id1',
        name : 'stopA',
        time : '1055'
      }, {
        id : 'id2',
        name : 'stopB',
        time : '1155'
      } ]
    };

    var testBusB = {
      route : '102',
      runtimeId: 'bus1',
      serviceNbr : '102 2',
      direction : '1',
      stops : [ {
        id : 'id2',
        name : 'stopB',
        time : '1205'
      }, {
        id : 'id3',
        name : 'stopA',
        time : '1300'
      } ]
    };

    var ends = new EndStopArray([ testBusA, testBusB ]);

    expect(ends.waitingSince(testBusA)).toBeFalsy();
    expect(ends.waitingSince(testBusB)).toBeFalsy();

    ends.wait(testBusA);
    expect(ends.waitingSince(testBusB)).toBe('1155');
    
    ends.wait(testBusB);
    expect(ends.waitingSince(testBusA)).toBe('1300');
  });

  it('Correctly finds recently arrived bus when stops at both ends are the same', function() {
    var testBusA = {
      route : '102',
      runtimeId: 'bus1',
      serviceNbr : '102 1',
      direction : '0',
      stops : [ {
        id : 'id1',
        name : 'stopA',
        time : '1055'
      }, {
        id : 'id2',
        name : 'stopB',
        time : '1155'
      } ]
    };

    var testBusB = {
      route : '102',
      runtimeId: 'bus1',
      serviceNbr : '102 2',
      direction : '1',
      stops : [ {
        id : 'id2',
        name : 'stopB',
        time : '1205'
      }, {
        id : 'id1',
        name : 'stopA',
        time : '1300'
      } ]
    };

    var ends = new EndStopArray([ testBusA, testBusB ]);

    expect(ends.waitingSince(testBusA)).toBeFalsy();
    expect(ends.waitingSince(testBusB)).toBeFalsy();

    ends.wait(testBusA);
    expect(ends.waitingSince(testBusB)).toBe('1155');
    
    ends.wait(testBusB);
    expect(ends.waitingSince(testBusA)).toBe('1300');
  });

  xit('correctly tracks power consumption at the end stop', function() {

    var ends = new EndStopArray([ testBusA, testBusB ]);

    ends.chargeBus(testBusA, 100, '0030');
    expect(ends.endStops.id1.timeseries['0030'].power).toBe(100);
    expect(ends.endStops.id1.timeseries['0030'].buses).toBe(1);
    expect(ends.endStops.id1.total).toBe(100 / 60);

    ends.chargeBus(testBusB, 100, '0030');
    expect(ends.endStops.id3.timeseries['0030'].power).toBe(100);
    expect(ends.endStops.id3.timeseries['0030'].buses).toBe(1);
    expect(ends.endStops.id3.total).toBe(100 / 60);

    var processed = ends.getProcessed();
    expect(processed[0].timeseries['0030'].power).toBe(100);
    expect(processed[0].total).toBe(Math.round(100 / 60));
  });

  it('correctly places route ends', function() {
    var array = new EndStopArray([ testBusA, testBusB ]);
    expect(array.routeStart('102', '0')).toBe('id1');
    expect(array.routeEnd('102', '0')).toBe('id2');
    expect(array.routeStart('102', '1')).toBe('id3');
    expect(array.routeEnd('102', '1')).toBe('id5');
  });
});