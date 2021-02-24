// app.js by John Phillips on 2021-02-22

const express = require("express");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

// set up the express server to work with Heroku
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const DATABASE_NAME = "inventory";
var database, collection;

// Listen on port for api requests and connect to our db.
app.listen(port, () => {
  MongoClient.connect(
    process.env.MONGODB_URI,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (error, client) => {
      if (error) throw error;
      database = client.db(DATABASE_NAME);
      collection = database.collection("items");
      console.log("Connected to `" + DATABASE_NAME + "`!");
    }
  );

  // CREATE ------------------------------------------------------------------
  // ***** Insert a new document into the db *********************************
  app.post("/items", (request, response) => {
    collection.insertOne(request.body, (error, result) => {
      if (error) return response.status(500).send(error);
      response.send(result.ops[0]._id); // send back the new item ID
    });
  });
  // curl -X POST -H 'content-type:application/json' -d '{"name":"Peach","qty":"33"}' http://localhost:5000/items
  // -------------------------------------------------------------------------

  // RETRIEVE ----------------------------------------------------------------
  // ***** Get all of the documents from the db ******************************
  app.get("/items", (request, response) => {
    collection.find({}).toArray((error, result) => {
      if (error) return response.status(500).send(error);
      response.send(result);
    });
  });
  // curl -X GET http://localhost:5000/items

  // ***** Get one document from the db given an item name *******************
  app.get("/items/:name", (request, response) => {
    collection.findOne({ name: request.params.name }, (error, result) => {
      if (error) return response.status(500).send(error);
      response.send(result);
    });
  });
  // curl -X GET http://localhost:5000/items/bread
  // -------------------------------------------------------------------------

  // UPDATE ------------------------------------------------------------------
  // ***** Update the qty for a given item name  *****************************
  //       might change to id in the future with ObjectId
  app.put("/items/:name", (request, response) => {
    collection.updateOne(
      { name: request.params.name },
      { $set: request.body },
      (error, result) => {
        if (error) return response.status(500).send(error);
        response.send(result);
      }
    );
  });
  // curl -X PUT -H "Content-Type: application/json" --data '{"qty": "5"}' http://localhost:5000/items/bread
  // -------------------------------------------------------------------------

  // DELETE ------------------------------------------------------------------
  // ***** Delete a document from the db given a Mongo ID *****
  app.delete("/items/:id", (request, response) => {
    collection.deleteOne(
      { _id: new ObjectId(request.params.id) },
      (error, result) => {
        if (error) {
          return response.status(500).send(error);
        }
        response.send(result);
      }
    );
  });
  // curl -X DELETE http://localhost:5000/items/60352ba86bd30269a08da3b0
  // -------------------------------------------------------------------------
});
// End of app.js -------------------------------------------------------------
// based in part on:
// https://www.thepolyglotdeveloper.com/2018/09/developing-restful-api-nodejs-mongodb-atlas/
// https://dev.to/lennythedev/rest-api-with-mongodb-atlas-cloud-node-and-express-in-10-minutes-2ii1
// https://blog.bitsrc.io/react-production-deployment-part-3-heroku-316319744885
//
// Notes:
// 1. postman.com testing, set Body to x-www-form-urlencoded for POST and PUT tests
// 2. Store the Mongodb connection string with user/password on Heroku Settings /
//    Reveal Config Vars and then key of MONGODB_URI and value of connection string
// 3. Heroku: click More / View logs to see errors as you test api from postman
// 4. Heroku: click Activity / View build log to see any issues
// ---------------------------------------------------------------------------
