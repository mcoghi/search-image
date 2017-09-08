"use strict"

var mongo = require("mongodb").MongoClient;

var User = require("./credential.js").mongoUser;
var Password = require("./credential.js").mongoPassword;
var dbUrl = "mongodb://" + User + ":" + Password + "@ds127864.mlab.com:27864/fccprojects"


//store a new query in the database
function storeQuery(query){
  mongo.connect(dbUrl, function(err, db){
    if (err) throw err;
    var collection = db.collection("searchimage");
    collection.insert(query, function(err, data){
      if (err) throw err;
      db.close();
    })
  })
}

//retrive the list of queries.
function retriveList(callBack){
  mongo.connect(dbUrl, function(err, db){
    if (err) throw err;
    var collection = db.collection("searchimage");
    collection.find({}).toArray(function(err, documents){
      if (err) throw err;
      callBack(documents);
    })
  })
}



//
module.exports = {
  storeQuery : storeQuery,
  retriveList : retriveList
}