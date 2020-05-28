

    async function login(apikey,username,password, callback) {
        this._apikey = apikey;
        this._username = username;
        this._password = password

		var Client = require('node-rest-client').Client;
		var bariumclient = new Client();
		var args = {
    		data: {
    			apikey: this._apikey,
    			username: this._username,
    			password: this._password,
    			format: "json"
    		},
    		headers: {
    		 	"Content-Type": "application/x-www-form-urlencoded"
    		}
		};
		bariumclient.post("https://live.barium.se/api/v1.0/authenticate", args, function (data, response) {
			callback(data.toString());
		});

		bariumclient.on('error', function (err) {
		    console.log('request error', err);
		});
	}

    async function feed(token, application_id, feeddata, callback) {
		var log4js = require('log4js');
		var logger = log4js.getLogger();

		logger.level = 'debug';

		var Client = require('node-rest-client').Client;
		var bariumclient = new Client();
		var args = {
    		data: feeddata,
    		headers: {
    		 	"Content-Type": "application/x-www-form-urlencoded",
    		 	"Ticket": token
    		}
		};
		bariumclient.post("https://live.barium.se/api/v1.0/apps/" + application_id +  "?message=START", args, function (result, response) {
			if(result.success){
				logger.debug("barium-feeder success:" + result.InstanceId);
				callback(false, result.InstanceId);
			}
			else
			{
				logger.debug('barium-feeder error: ' + result.errorCode + ' - ' + result.errorMessage + '::' + response.toString());
				callback(false, 'Not Successful! ' + result.toString());

			}
		});

		bariumclient.on('error', function (err) {
		    callback(true, 'request error' + err.toString());
		});
	}
	module.exports.login = login;
	module.exports.feed = feed;
