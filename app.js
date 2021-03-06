/*
* Copyright 2015 CareerBuilder, LLC
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and limitations under the License.
*/
//
var express    = require('express'); 		// call express
var https      = require('https');
var fs         = require('fs');
var path       = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
global.config  = require('./config.json');
var app        = express(); 			// define our app using express

app.set('view engine','html');
app.engine('html', require('ejs').renderFile);
app.use(express.static(path.join(__dirname, 'client')));
app.set('views', __dirname + '/client/views');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

if(!global.config.CookieSecret){
  var sec = require('crypto').randomBytes(32).toString('hex');
  global.config.CookieSecret = sec;
  fs.writeFileSync('./config.json', JSON.stringify(global.config, null, '\t'));
}
app.use(cookieParser(global.config.CookieSecret));

var port = 3000;

// ROUTES FOR OUR API
// =============================================================================
//

app.get('/', function(req, res){
  res.render('index');
});

app.use('/api/', require('./routes/api.js'));

//keep this last, as it will return 404
app.use(function(req, res, next){
  res.status(404);
  // respond with html page
  if (req.accepts('html')) {
    return res.render('404', { url: req.url });
  }
  // respond with json
  if (req.accepts('json')) {
    return res.send({Error: 'Not a valid endpoint'});
  }
  // default to plain-text. send()
  return res.type('txt').send('Not found');
});

if('SSL' in global.config){
  var config = {
    key: fs.readFileSync(global.config.SSL.keyfile),
   cert: fs.readFileSync(global.config.SSL.certfile)
  };
  https.createServer(config, app).listen(port);
}
else{
  app.listen(port);
}
console.log('Magic happens on port ' + port);
