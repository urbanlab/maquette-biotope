var express = require('express');
var app = express();
var server = require('http').Server(app);
var http = require('http');
var io = require('socket.io')(server);
var functionLib = require('./function-lib.js');
var bodyParser = require('body-parser');
var cheerio = require('cheerio');


// --- app setup
app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/node_modules'))
app.use(bodyParser.urlencoded({ extended: false }))

// --- getting "bootstrap" data
let getBootstrapData = function( callback ) {

  let options = {
    hostname: 'o-mi-node',
    port: 8080,
    path: '/',
    method: 'POST',
    headers: {
        'Content-Type': 'text/xml',
    }
  };

  let ODF_request_body = `<omiEnvelope xmlns="http://www.opengroup.org/xsd/omi/1.0/" version="1.0" ttl="0">
                          <read msgformat="odf" newest="120">
                            <msg>
                              <Objects xmlns="http://www.opengroup.org/xsd/odf/1.0/">
                                <Object>
                                  <id>Rue_Garibaldi_mock-up</id>
                                  <Object>
                                    <id>Left_Zone</id>
                                    <Object>
                                      <id>Indicator_1</id>
                                    </Object>
                                  </Object>
                                  <Object>
                                    <id>Right_Zone</id>
                                    <Object>
                                      <id>Indicator_1</id>
                                    </Object>
                                  </Object>
                                </Object>
                              </Objects>
                            </msg>
                          </read>
                        </omiEnvelope>`;

  let leftZoneData = new Array();
  let rightZoneData = new Array();

  var req = http.request(options, function(res) {
    // console.log('Status: ' + res.statusCode);
    // console.log('Headers: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (body) {
      // console.log('Body: ' + body);
      leftZoneData  = functionLib.XMLboostrapDataParser(body, 'Left_Zone');
      rightZoneData = functionLib.XMLboostrapDataParser(body, 'Right_Zone');
      // console.log(leftZoneData);
      // console.log(rightZoneData);
      // console.log(leftZoneData.length);
      // console.log(rightZoneData.length);
      callback({'l': leftZoneData, 'r': rightZoneData});
    });
  });

  req.on('error', function(e) {
    console.log('[Express] Problem with request: ' + e.message);
  });
  // write data to request body

  req.write( ODF_request_body );
  req.end();

};


// --- socket.io logging
io.on('connection', function(socket){
  console.log('[socket.io] An user connected.');

  // getBootstrapData( function(bootstrapData) {
  //   io.emit('Left_Zone_Bootstrap',  bootstrapData.l);
  //   io.emit('Right_Zone_Bootstrap', bootstrapData.r);
  // });

  socket.on('disconnect', function(){
    console.log('[socket.io] An user disconnected.');
  });
});


// --- routes
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.post('/indicators/1', function(req, res){
  res.status(200).end();
  let msg = functionLib.XMLdataParser( req.body.msg );
  // console.log(msg);
  io.volatile.emit('Left_Zone', msg); // broadcast
});

app.post('/indicators/2', function(req, res){
  res.status(200).end();
  let msg = functionLib.XMLdataParser( req.body.msg );
  // console.log(msg);
  io.volatile.emit('Right_Zone', msg); // broadcast
});

app.post('/valves/1', function(req, res){
  res.status(200).end();
  // let msg = functionLib.XMLdataParser( req.body.msg );
  let msg = functionLib.XMLActuationDataParser( req.body.msg );
  io.volatile.emit('Left_Zone_Actuation', msg); // broadcast
  // io.volatile.emit('Left_Zone', msg); // broadcast
});

app.post('/valves/2', function(req, res){
  res.status(200).end();
  // let msg = functionLib.XMLdataParser( req.body.msg );
  let msg = functionLib.XMLActuationDataParser( req.body.msg );
  io.volatile.emit('Right_Zone_Actuation', msg); // broadcast
  // io.volatile.emit('Left_Zone', msg); // broadcast
});

server.listen(3000, function(){
  console.log('[Express] Listening on *:3000.');
});
