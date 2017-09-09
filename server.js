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

//send the .ccs and .js files to the client
app.use(express.static("public"));

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
  
  var offset = parseInt(req.query.offset);   

  //if the user didn't specify a number of results or a negative number, show 10
  if (!offset || offset < 0) offset = 10;
  else if (offset > 100) offset = 100; //never give more than 100 results
    
  var result = []; //initialize an array to store the results of the search
  var search; //this will store the search query for the google api
  var total = Math.ceil(offset / 10); //total number of google call necessary to satisfy the user
  
  //send query to google, asking for 10 results at the time
  askGoogle(1);
  
  function askGoogle(iteration){
    
    console.log("iteration: " + iteration + " total: " + total)
    
    var start = 10*(iteration - 1) + 1; //set from where to start the query
    
    if (iteration > total){
      
      // if enough calls have been done, send the results to the user
      res.send(result)
      
    } else {
      
      if (iteration == total){
        
        //during the last iteration may be asking for less than 10 results
        var count = offset % 10;
        if (count == 0) count = 10;
        search = googleAPI + userReq + "&num=" + count + "&start=" + start;
        
      } else {
        
        //for each iteration except the last, ask for 10 results
        search = googleAPI + userReq + "&num=10&start=" + start;
        
      }
      
      //forward the request to google
      request(search, function(err, response, body){
        if (err) throw err;
        result.push(JSON.parse(body));
        askGoogle(iteration + 1);
      })
      
    }
          
  }

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
