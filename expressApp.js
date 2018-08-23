const express = require('express');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const csvjson = require('csvjson');
const bodyParser = require('body-parser');
const cors = require('cors');
const  app = express();


const port = process.env.PORT || 3000
const config = require('./config.js').get(process.env.NODE_ENV);
console.log(config);
const MONGO_URI = config.database;

let db ;

MongoClient.connect(MONGO_URI,{ useNewUrlParser: true })
  .then((database) => {
    db = database.db(config.db);
    console.log('connected mLab database');
  })
  .catch((err) => {
    console.log(err);
  })

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use( cors());

app.get('/test/read',(req, res) => {
  db.collection('users')
  .find({"E Mail" : {$in : [/gmail.com/]}})
  .project({"First Name" : 1, "E Mail": 1, _id:0,"_id": 1})
  .toArray( (err, item) => {
    if(err) {
      res.send(err);
    }
    res.send(item);
  });
});

app.post('/test/create', (req, res) => {
  let body  = req.body;
  console.log(body);
  db.collection('users').insert(body, (err, response) => {
  if(err) {
      res.sendStatus(500);
  }
  res.send(response.ops);
  });
});

app.put('/test/update/:id',(req, res) => {
  let body  = req.body;
  let id = req.params.id;
  db.collection('users').update({_id : id },{$set : body} ,(err, response) => {
  if(err) {
      res.status(404).send(err);
  }
  res.send(response);
  });
});

app.delete('/test/delete/:id', (req, res, next) => {
    let key = req.headers['jwt_key'];
    console.log(`key: ${key}`);
    if(key=='secret') {
      next()
    }
    else {
      res.sendStatus(401);
    }
  }, (req, res) => {
  let id = req.params.id;
  db.collection('users')
  .findOneAndDelete({_id : ObjectId(id)},(err, response) => {
    if(err) {
      res.sendStatus(404);
    }
    if(response.lastErrorObject.n == 1){
      console.log(response);
      res.sendStatus(202);
    }
    else {
      res.sendStatus(404);
    }
  });
});

app.get('/', (req, res, next) => {
      res.send('Welcome to Swagger Server');
});

app.listen(port,() => {
  console.log(`Listening to port ${port}`);
});
