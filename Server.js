var express = require("express");
var mysql = require("mysql");
var bodyParser = require('body-parser')
var YahooFantasy = require('yahoo-fantasy');
var app = express();

var connection = mysql.createConnection({
	host : "localhost",
	user : "root",
	password : "hex3omega",
	database : "hockey"
});

var yf = new YahooFantasy(
  "dj0yJmk9WGdSeHg2MGwza2FnJmQ9WVdrOVFrRnJhVTFFTkRnbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD0zNw--",
  "0fd8b734cc4a74d98bdc963678a1d44360db308e"
);
var filter = "name like '%%'"

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static('public'));


connection.connect(function(error){
	if(error) {
		console.log("Problem with MySQL"+error);
	}
	else {
		console.log("Connected with Database");
	}
});


/*yf.player.stats ( "pnfl.p.5479",  function cb(err, data) {
	console.log("hello2");
    // handle error
    // callback function
    // do your thing
});*/

app.get('/',function(req,res){
	res.sendFile(__dirname + '/index_back.html');
});

app.get('/loadAllPlayers',function(req,res){
	connection.query("SELECT * from players WHERE " + filter + " ",function(err,rows){
		if(err) {
			console.log("Problem with MySQL"+err);
		}
		else {
			res.end(JSON.stringify(rows));
		}
	});
});

app.get('/loadDraftedPlayers',function(req,res){
	connection.query("SELECT * from draftedplayers",function(err,rows){
		if(err) {
			console.log("Problem with MySQL"+err);
		}
		else {
			res.end(JSON.stringify(rows));
		}
	});
});

app.post('/', function(request, response){
    filter = "name like '%" + request.body.filter + "%'";
});

app.post('/addDraftedPlayer', function(request, response){
	console.log(request.body.player_id)
	connection.query("INSERT INTO draftedplayers (player_id) VALUES (" + request.body.player_id + ")", function(err) {
		if (err) {
			console.log("Problem with MySQL"+err);
		}
		else {
			console.log('success'); 
		}
	});
});


app.listen(3000,function(){
	console.log("It's Started on PORT 3000");
});
