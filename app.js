var twilio = require('twilio'),
    client = twilio('AC7bf377a64795b6a35ad94cac1b1f904c', '8231cbacaa085bec696b0d180da146b3'),
    cronJob = require('cron').CronJob;
 
var express = require('express'),
    bodyParser = require('body-parser'),
    app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
 
var Firebase = require('firebase'),
    usersRef = new Firebase('{https://moodbuddy-c5dae-default-rtdb.firebaseio.com/}/Users/');
 
var numbers = [];
 
usersRef.on('child_added', function(snapshot) {
  numbers.push( snapshot.val() );
  console.log( 'Added number ' + snapshot.val() );
});
 
var textJob = new cronJob( '0 18 * * *', function(){
  for( var i = 0; i < numbers.length; i++ ) {
    client.sendMessage( { to:numbers[i], from:'+16475594970', body:'Hello! Hope you’re having a good day.'}, function( err, data ) {
      console.log( data.body );
    });
  }
},  null, true);
 
app.post('/message', function (req, res) {
  var resp = new twilio.TwimlResponse();
  if( req.body.Body.trim().toLowerCase() === 'subscribe' ) {
    var fromNum = req.body.From;
    if(numbers.indexOf(fromNum) !== -1) {
      resp.message('You already subscribed!');
    } else {
      resp.message('Thank you, you are now subscribed. Reply "STOP" to stop receiving updates.');
      usersRef.push(fromNum);
    }
  } else {
    resp.message('Welcome to Daily Updates. Text "Subscribe" receive updates.');
  }
  res.writeHead(200, {
    'Content-Type':'text/xml'
  });
  res.end(resp.toString());
});
 
var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});