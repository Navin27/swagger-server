const express = require('express');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const csvjson = require('csvjson');
const bodyParser = require('body-parser');
const cors = require('cors');

const  app = express();

const url = 'mongodb://navin27:navin2781@ds115592.mlab.com:15592/library';
let db ;
var urlMethod = function(req, res, next) {
  console.log('Time :',Date.now());
  next()
};

MongoClient.connect(url,{ useNewUrlParser: true })
  .then((database) => {
    db = database.db('library');
    console.log('connected mLab database');
  })
  .catch((err) => {
    console.log(err);
  })

app.use('/test/read',urlMethod);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
//app.use( cors());

app.get('/test/read',(req, res) => {
  db.collection('users')
  .find({"E Mail" : {$in : [/gmail.com/]}})
  .project({"First Name" : 1, "E Mail": 1, _id:0,"_id": 1})
  .toArray( (err, item) => {
    res.send(item);
  });
});

app.post('/test/create', (req, res) => {
  let body  = req.body;
  console.log(body);
  db.collection('users').insert(body, (err, response) => {
  if(err) {
      res.status(404).send(err);
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
    fs.readFile('sample.json', 'utf8', (err, data) => {
        if(err) {
          res.sendStatus(404);
        }
        else {
          res.send({data});
        }
    });
});
app.get('/route/:id', (req,res,next) => {
    if(req.params.id == 2) {
      res.send('param 2');
      next('route')
    }
    else {
      next();
    }
}, (req, res, next ) => {
    res.json("routing");
});

app.get("/sequence", [(req, res, next) => {
    fs.writeFile("data.json","data", next);
  }, (req, res) => {
    res.send("OK");
  }
]);

app.listen(3000,() => {
  console.log(`Listening to port 3000`);
});
