define([ 'jquery', 'underscore' ], function($, _) {
  'use strict';

  function ChargeSim(opts) {
    opts || (opts = {});
    var options = _.defaults(opts, {
      batteryCapacity : 40,
      consumptionPerKm : 1,
      
      chargingTime : 15,
      chargingTimeStd : 3,
      chargingPower : 400,
      totalDistance : 270,
      distanceBetweenCharges : 1
    });

    this.setParameters(options);
  };

  ChargeSim.prototype.setParameters = function(options) {
    this.capacityMax = options.batteryCapacity;
    this.capacity = options.batteryCapacity;
    this.consumption = options.consumptionPerKm;
    this.consumptionStd = options.consumptionStd;
    this.chargingTime = options.chargingTime;
    this.chargingTimeStd = options.chargingTimeStd;
    this.chargingPower = options.chargingPower;
    this.totalDistance = options.totalDistance;
    this.distanceBetweenCharges = options.distanceBetweenCharges;
  };

  ChargeSim.prototype.charge = function(power, time) {
    var energyTransmitted = power * 1000 * time;
    energyTransmitted = energyTransmitted / 3600000;

    if (this.capacity + energyTransmitted > this.capacityMax) {
      this.capacity = this.capacityMax;
    } else {
      this.capacity = this.capacity + energyTransmitted;
    }

    return this.capacity;
  };

  ChargeSim.prototype.getCapacityPercentage = function() {
    return 100 * this.capacity / this.capacityMax;
  };
  
  var rnd = function(mean, stdev) {
    var rnd_snd = function() {
      return (Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1);
    };
    
    return rnd_snd()*stdev + mean;
  };

  /**
   * 
   * @param distance
   * @returns capacity left
   */
  ChargeSim.prototype.driveStep = function(distance) {
    var cons = rnd(this.consumption, this.consumptionStd);
    if (this.capacity - distance * cons <= 0) {
      this.capacity = 0;
      throw new Error("Battery died, cannot proceed");
    } else {
      this.capacity = this.capacity - distance * cons;
      return this.capacity;
    }
  };

  ChargeSim.prototype.getRandomizedChargingTime = function() {        
    return rnd(this.chargingTime, this.chargingTimeStd);
  };

  ChargeSim.prototype.drive = function() {
    var distanceTraveled = 0;
    var step = 0;
    var steps = 4;
    var enoughCharge = true;
    var resultMap = [];

    while (distanceTraveled < this.totalDistance && enoughCharge) {
      try {
        distanceTraveled += this.distanceBetweenCharges / steps;
        this.driveStep(this.distanceBetweenCharges / steps);
      } catch (error) {
        enoughCharge = false;
      }

      if (step === 3) {
        this.charge(this.chargingPower, this.getRandomizedChargingTime());
      }
      
      resultMap.push({
        traveled : distanceTraveled.toFixed(1),
        capacity : this.getCapacityPercentage()
      });

      step = (step + 1) % steps;
    }
    if(enoughCharge) {
      resultMap.isSuccess = true;
    } else {
      resultMap.isSuccess = false;
    }
    return resultMap;
  };

  return ChargeSim;
});