// server.js
// where your node app starts

// init project
var request = require("request");
var express = require('express');
var responseTime = require("response-time");
var storeQuery = require("./storage.js").storeQuery;
var retriveList = require("./storage.js").retriveList;
var app = express();

// set up the request url
var APIKey = require("./credential.js").APIKey;
var searchEngine = require("./credential.js").searchEngineId;
var url = require("url");
var googleAPI = "https://www.googleapis.com/customsearch/v1?key=" + APIKey 
  + "&cx=" + searchEngine 
  + "&searchType=image" 
  + "&fields=items(link,snippet,image(thumbnailLink,contextLink))"
  + "&q=";
var search = googleAPI + "lolcats" ;

//register the time of the request
var date
app.use(function(res, req, next){
  date = new Date().toDateString() + new Date().toTimeString();
  next();
});

// basic response
app.get("/", function(req, res){
  res.sendFile(__dirname + "/views/index.html");
});

// respond to search
app.get("/search", function(req, res){
  var userReq = url.parse(req.originalUrl).query.split("&offset")[0];
  
  //first, store the query in the database
  storeQuery({
    query : decodeURI(userReq),
    date : date
  })
  
  //then, forward the request to google
  var offset = req.query.offset;
  res.send("hi");
  /*
  //send query to google
  request(search, function(err, response, body){
    if (err) throw err;
    res.send(JSON.parse(body))
  })
  */
});

// give the query list
app.get("/queries", function(req, res){
  
  retriveList(displayList);
  
  function displayList(documents){
    res.send(documents);
  }
});

// listen for requests
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
