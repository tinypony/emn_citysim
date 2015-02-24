module.exports = {
	getDate : function(req) {
	  var defaultDate = '2015-2-23';
	  
	  if(req.method === 'GET') {
	    return req.query.date ? req.query.date : defaultDate;
	  } else if(req.method === 'POST') {
	    return req.budoy.date ? req.query.date : defaultDate;
	  }
	  
		return defaultDate;
	},

	getMaxLength : function(req) {
		return req.body.maxLength ? req.body.maxLength : 15000;
	}
}