var simulate = require('../../backend/views/simulate');

describe('Simulate', function() {
  it('Returns correct time difference in minutes over hour', function() {
    expect(simulate.getTimeDifference('0105', '0055')).toBe(10);
  });

  it('Returns correct time difference in minutes over 1100 and 1300', function() {
    expect(simulate.getTimeDifference('1300', '1100')).toBe(120);
  });

  it('Maps modified routes to the base routes', function() {
    expect(simulate.getRoute({route: '102T'})).toBe('102');
    expect(simulate.getRoute({route: '102A'})).toBe('102A');
    expect(simulate.getRoute({route: '102'})).toBe('102');
  });
  
  it('calculates consumed energy', function(){
    expect(simulate.getEnergyDrawn(100, 60)).toBe(100);
    expect(simulate.getEnergyDrawn(100, 1)).toBe(100/60);
  });

  it('Calculates charging power correctly', function() {
    expect(simulate.powerNeeded({
      length : 1,
      consumption : 1,
      chargingTime : 60,
      efficiency : 1
    })).toBe(1);

    expect(simulate.powerNeeded({
      length : 10,
      consumption : 1,
      chargingTime : 5,
      efficiency : 1
    })).toBe(120);
    
    expect(simulate.powerNeeded({
      length : 10,
      consumption : 1,
      chargingTime : 5,
      efficiency : 0.5
    })).toBe(240);

  });
});
