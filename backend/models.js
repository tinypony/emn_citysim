var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;

var BusStopModel = new Schema({
  id : {type: String, unique: true, required: true},
  time : {type: String, required: true},
  name : {type: String, required: false},
  posX : {type: String, required: false},
  posY : {type: String, required: false}
});

mongoose.model('BusStop', BusStopModel);

var BusService = new Schema({
  serviceId: {type: String, required: true},
  companyId: String,
  serviceNbr: {type: String, required: true},
  route: {type: String, required: true},
  stops: [BusStopModel],
  routeLength: {type: Number},
  validity: {
    vector: {type: String, required: true},
    firstDate: {type: String, required: true}
  }
});
 
mongoose.model( 'BusService', BusService );
mongoose.connect( 'mongodb://localhost/hsl' );