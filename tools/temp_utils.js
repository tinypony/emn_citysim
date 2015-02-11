var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
var _ = require('underscore');
var moment = require('moment');

var db = MongoClient.connect('mongodb://127.0.0.1:27017/hsl', function(err, db) {
  if(err) {
      throw err;
  }
  
  console.log("connected to the mongoDB !");
  var buses = db.collection('buses');
  var cursor = buses.find({});
  var count = 0;
  
  
  cursor.each(function(err, bus){
    var validDates = [];
    var date = moment(bus.validity.firstDate);
    var bitString = bus.validity.vector;
    
    for(var i=0; i<bitString.length; i++ ) {
      if(bitString.charAt(i) === '1') {
        var newDate = date.add(i, 'days');
        validDates.push(new Date(newDate.format('YYYY-MM-DD')));
      }
    }
    
    buses.update(bus, {$set: { dates: validDates }}, {w:1}, function(err, arg) {
      count += arg;
      console.log(count);
    });
    
  });
});

/*
 if(_.isString(bus.validity.firstDate)) {
      collection.save(bus, {
        firstDateString: bus.validity.firstDate,
        firstDate: new Date(bus.validity.firstDate)
      }, function(err, arg){
        console.log(arg);
      });
      
    } else {
      console.log('not a string');
    }
*/