var fs = require('fs');
var CsvReadableStream = require('csv-reader');
var parallelLimit = require('run-parallel-limit')
const config = require('config');
var bariumfeeder = require('./barium-feeder.js');


var inputStream = fs.createReadStream('data.csv', 'utf8');

var tasks = [];
const user_id = config.get('Barium.user_id');
const password = config.get('Barium.password');
const api_key = config.get('Barium.api_key');
const application_id = config.get('Barium.application_id');
const template_id = config.get('Barium.template_id');
const map = config.get('AbouMap');
const debug = config.get('Barium.debug');
var headers = [];
var headerRead = false;


bariumfeeder.login(api_key, user_id,password,
    function (token) {
        console.log("Login OK!")
        var count = 0;
        inputStream
            .pipe(CsvReadableStream({delimiter: ';', parseNumbers: false, parseBooleans: true, multiline: true, trim: true, skipHeader: false}))
            .on('data', function (row) {
              if(!headerRead)
              {
                headerRead = true;
                headers = row;
              }
              else {
                  var data = {
                    template:template_id
                  };
                  for (var i = 0; i < row.length; i++) {
                    var key = map[headers[i]];
                    if(typeof key !== 'undefined') {
                      data[key] = row[i];
                    }
                  }
                tasks.push(function (callback) {
                  if(debug) {
                    console.log('debug:');
                    console.log(data);
                    callback(false,'null\n');
                  }
                  else {
                    bariumfeeder.feed(token, application_id, data, callback)
                  }
                 });
               }
            })
            .on('end', function () {
                console.log('Data file has been read.');
                parallelLimit(tasks, 1, function (err, results) {
                  if(err) {
                    console.log('ERROR: ' + i + ';' + err + '\n');
                  }
                  else {
                    for (var i = 0; i < results.length; i++) {
                      if(!debug)
                        console.log('Initiated Barium process:  ' + results[i]);
                    }
                  }
                  });
                });
    });

function getByKey(localmap, key) {
    var found = null;

    for (var i = 0; i < localmap.length; i++) {
        var element = localmap[i];

        if (element.Key == key) {
           found = element;
       }
    }

    return found;
}
