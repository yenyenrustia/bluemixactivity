/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

/// This application uses express as its web server
/// for more info, see: http://expressjs.com
var express = require('express');

/// cfenv provides access to your Cloud Foundry environment
/// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// body-parser allows parsing of JSON 
const bodyParser= require('body-parser');

// Use Express' Routing and set the location of the static content (i.e. path)
var router = express.Router();
var path = __dirname + '/public/';

// Initialize variables for working with Watson.

var result2 = [];
var ta_result = [];
var params;

// Watson API and credential information. 
var TradeoffAnalyticsV1 = require('watson-developer-cloud/tradeoff-analytics/v1');
var config = require('./config');

var tradeoff_analytics = new TradeoffAnalyticsV1({
  username: config.TAusername,
  password: config.TApassword
});

/// create a new express server
var app = express();

// Set up the express server in terms of where static content is 
// and parsing of URLs.
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));

// Load the router module
app.use("/",router);

// Send the equivalent of a 404 message to the user.
app.use("*",function(req,res){
  res.send('Whoops! That page does not exist!');
});

// middleware that is specific to this router
router.use(function (req,res,next) {
  // console.log('Time: ', Date.now());
  next();
});

// define the home page route
router.get('/', function(req, res) {
  res.render('index.ejs');
})

// define the about route
router.get("/about",function(req,res){
	res.sendFile(path + "about.html");
});

// define the askWatson route
router.post('/askWatson', function(req, res) {

	// If an error occurs, error_message will contain the error message.
	// preferredbrands contains the brands (e.g. Sony, Apple) the user selected.
	// If the selected weight is important, that req.body.weight = 'Weight1' and
	// weight is important to them.
	
  	error_message = "";
  	preferredbrands = req.body.preferredbrands;
  	maxprice = req.body.maxprice;
  	if (req.body.weight == 'Weight1') {
  		weight_is_objective = true; 
  	} else {
  		weight_is_objective = false;
  	}
  	
  	// Test the input data to see it is suitable for Watson.
  	// They need to select at least 2 brands for Watson to process it.
  	
  	if (typeof preferredbrands !== 'object') {
  		console.log("They must select one or more brands");
  		console.log("They selected: " + preferredbrands);
  		error_message = error_message + "You must select 2 or more brands.";
  	}
  	
  	// The price they enter for maxPrice must be a number.
  	
  	if (isNaN(maxprice)) {
  		console.log("Max price is not a number");
  		error_message = error_message + "You must enter a number for max price.";
  	} else
  		  	maxprice = Number(req.body.maxprice);
  		  	
  	// Maxprice cannot be negative either.
  	
  	if (maxprice <= 0) {
  		console.log("Max price is less than or equal to 0");
  		error_message = error_message + "You must enter a number for max price greater than 0.";
  	}
   	
   	// Reset ta_result to []
   	ta_result = [];
   	
   	// If error_message still equals "", then no error occurred in the input.
   	
	if (error_message == "") {
	
		// Set the variable params. Most of it is constant information. What is variable
		// are the values for weight_is_objective and req.body.preferredbrands
		params = {
		  "subject": "phones",
		  "columns": [
			{
			  "key": "price",
			  "type": "numeric",
			  "goal": "min",
			  "is_objective": true,
			  "full_name": "Price",
			  "range": {
				"low": 0,
				"high": maxprice,
			  },
			  "format": "number:2"
			},
			{
			  "key": "weight",
			  "type": "numeric",
			  "goal": "max",
			  "is_objective": weight_is_objective,
			  "full_name": "Weight",
			  "format": "number:0"
			},
			{
			  "key": "brand",
			  "type": "categorical",
			  "goal": "min",
			  "is_objective": true,
			  "full_name": "Brand",
			  "range": [
				"Apple",
				"HTC",
				"Samsung",
				"Sony"
			  ],
			  "preference": req.body.preferredbrands
			},
			{
			  "key": "rDate",
			  "type": "datetime",
			  "goal": "max",
			  "full_name": "Release Date",
			  "format": "date: 'MMM dd, yyyy'"
			}
		  ],
		  "options": [
			{
			  "key": "1",
			  "name": "Samsung Galaxy S4",
			  "values": {
				"price": 249,
				"weight": 130,
				"brand": "Samsung",
				"rDate": "2013-04-29T00:00:00Z"
			  }
			},
			{
			  "key": "2",
			  "name": "Apple iPhone 5",
			  "values": {
				"price": 349,
				"weight": 112,
				"brand": "Apple",
				"rDate": "2012-09-21T00:00:00Z"
			  }
			},
			{
			  "key": "3",
			  "name": "HTC One",
			  "values": {
				"price": 299,
				"weight": 112,
				"brand": "HTC",
				"rDate": "2013-03-01T00:00:00Z"
			  }
			},
			{
			  "key": "4",
			  "name": "Samsung Galaxy S5",
			  "values": {
				"price": 349,
				"weight": 135,
				"brand": "Samsung",
				"rDate": "2014-04-29T00:00:00Z"
			  }
			},
			{
			  "key": "5",
			  "name": "Apple iPhone 6",
			  "values": {
				"price": 399,
				"weight": 118,
				"brand": "Apple",
				"rDate": "2013-09-21T00:00:00Z"
			  }
			},
			{
			  "key": "6",
			  "name": "Apple iPhone 7",
			  "values": {
				"price": 499,
				"weight": 118,
				"brand": "Apple",
				"rDate": "2014-09-21T00:00:00Z"
			  }
			},
			{
			  "key": "7",
			  "name": "Sony Xperia",
			  "values": {
				"price": 199,
				"weight": 120,
				"brand": "Sony",
				"rDate": "2014-08-21T00:00:00Z"
			  }
			}
		  ]
		};
		
		// Number of options is the number of options in the var params.
		number_of_options = 7;
		
	// Call tradeoff analytics, passing it the value in the variable params.
	// If we don't get an error, then process the response that came back and is stored
	// in ta_res. The response we want from ta_res is stored in status and phone.

	tradeoff_analytics.dilemmas(params, function(err, ta_res) {
		if (err) {
			ta_result.push("Sorry. We experienced an error communicating with Watson.");
		}
		else {
			for(var i = 0; i < number_of_options; i++) {
				var phone = JSON.stringify(ta_res.problem.options[i].name, null, 2);
				phone = phone.replace(/"/g,'');
				var status = JSON.stringify(ta_res.resolution.solutions[i].status, null, 2);
	
				// If status is "FRONT", then Watson thinks the phone meets the user's 
				// criteria. If the status is "EXCLUDED", it matches the criteria, but Watson thinks
				// another phone is better. If it is neither FRONT or EXCLUDED, then
				// Watson thinks it is not a match, so we get the reason why and assign 
				// it to variable reason.
				 			
				switch (status.trim()) {
					case '"FRONT"':
						ta_result.push(phone + " is a match!");
						break;
					case '"EXCLUDED"':
						ta_result.push(phone + " is not a match. Another option is better.");
						break;
					default:
						var reason = JSON.stringify(ta_res.resolution.solutions[i].status_cause.message, null, 2);
						reason = reason.replace(/:/g,' ');
						reason = reason.replace(/\"/g,' ');
						reason = reason.replace(/\[/g,' ');
						reason = reason.replace(/\]/g,' ');
						reason = reason.replace(/\\/g,' ');
						ta_result.push(phone + " is not a match. Reason: " + reason);
				};
			};
		}; 	
		res.render('results.ejs', {quotes: ta_result});	
	});

	} else {
		ta_result.push("Sorry. There is problem with your input.");
		ta_result.push(error_message);
		res.render('results.ejs', {quotes: ta_result});	
	}
})


/// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

/// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  /// print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
