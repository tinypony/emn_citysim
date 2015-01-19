var express = require('express'), 
  http = require('http'), 
  path = require('path');

var models = require('./backend/models');
var simulate = require('./backend/views/simulate');
var app = express();
var bodyParse = require('body-parser');
var methodOverride = require('method-override');
var errorhandler = require('errorhandler');

// all environments
app.set('port', process.env.PORT || 3000);

app.set('view engine', 'jade');
app.use(bodyParse.json());
app.use(methodOverride());

app.use('/', express.static(__dirname + '/frontend'));

app.use('/api/simulate', simulate.list);

// development only
if ('development' == app.get('env')) {
  app.use(errorhandler());
}


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
