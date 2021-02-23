// server.js
// Modified by JP on 2021-02-22 from example at 
// https://dev.to/lennythedev/rest-api-with-mongodb-atlas-cloud-node-and-express-in-10-minutes-2ii1

const express = require("express");
const server = express();
server.use(express.json());
const port = 4000;

// << db setup >>
const db = require("./dbold");
const dbName = "inventory";
const collectionName = "items";

db.initialize(dbName, collectionName, function (dbCollection) { // successCallback
   // get all items
   dbCollection.find().toArray(function (err, result) {
      if (err) throw err;
      console.log(result);

      // << return response to client >>
   });

   // << db CRUD routes >>
   server.post("/items", (request, response) => {
      const item = request.body;
      dbCollection.insertOne(item, (error, result) => { // callback of insertOne
         if (error) throw error;
        //  return updated list
         dbCollection.find().toArray((_error, _result) => { // callback of find
            if (_error) throw _error;
            response.json(_result);
         });
      });
   });
   // curl -X POST -H "Content-Type: application/json" --data '{"name": "Pear", "qty": "222"}' http://localhost:4000/items

   server.get("/items/:name", (request, response) => {
      const itemName = request.params.name;

      dbCollection.findOne({ name: itemName }, (error, result) => {
         if (error) throw error;
         // return item
         response.json(result);
      });
   });
   // curl http://localhost:4000/items/Milk

   server.get("/items", (request, response) => {
      // return updated list
      dbCollection.find().toArray((error, result) => {
         if (error) throw error;
         response.json(result);
      });
   });
   // curl http://localhost:4000/items

   server.put("/items/:name", (request, response) => {
      const field = request.params.name;
      const qty = request.body;
      console.log("Editing item: ", field, " to be ", qty);

      dbCollection.updateOne({ name: field }, { $set: qty }, (error, result) => {
         if (error) throw error;
         // send back entire updated list, to make sure frontend data is up-to-date
         dbCollection.find().toArray(function (_error, _result) {
            if (_error) throw _error;
            response.json(_result);
         });
      });
   });
   // curl -X PUT -H "Content-Type: application/json" --data '{"qty": "5"}' http://localhost:4000/items/bread

   server.delete("/items/:name", (request, response) => {
      const itemName = request.params.name;
      console.log("Delete item with name: ", itemName);

      dbCollection.deleteOne({ name: itemName }, function (error, result) {
         if (error) throw error;
         // send back entire updated list after successful request
         dbCollection.find().toArray(function (_error, _result) {
            if (_error) throw _error;
            response.json(_result);
         });
      });
   });
   // curl -X DELETE http://localhost:4000/items/Pear

}, function (err) { // failureCallback
   throw (err);
});

server.listen(port, () => {
   console.log(`Server listening at ${port}`);
});
