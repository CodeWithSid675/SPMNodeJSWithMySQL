var express = require('express')
var app = express();
const bodyParser = require('body-parser');
var sql = require('mysql');
var port = process.env.port || 1337;
var con = require('./connection/connect')
var cors = require('cors');
var sendMail = require('./connection/sendmail')
var router = express.Router();
var stringify = require('json-stringify-safe');
const nodemailer = require("nodemailer");

con.connect(function (err) {
  if (err) throw err;
  console.log("MySQL DB connected");
})

//third party for cors problem
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//get all speeches
app.get('/speeches', (req, res) => {
  let id = req.params.mailId;
  let sqlQuery = 'SELECT * FROM myappdb.speech';
  // console.log("get query " + sqlQuery);
  let query = con.query(sqlQuery, (err, result) => {
    if (err) throw err;
    // console.log("res => " + stringify(result));
    let accResponse = [];
    for (let i = 0; i < result.length; i++) {
      let accResult = {
        "id": result[i].id,
        "author": result[i].author,
        "date": result[i].date,
        "speechContent": result[i].speech_content,
        "subjectKeyword": result[i].subject_keyword,
        "userId": result[i].user_id
      }
      accResponse.push(accResult);
    }
    res.status(200).send(accResponse);
  });
});

// get all speech by mail id
app.get('/speeches/:mailId', (req, res) => {
  let id = req.params.mailId;
  let sqlQuery = 'SELECT * FROM myappdb.speech where mail_id = '+stringify(id);
  // console.log("get query " + sqlQuery);
  let query = con.query(sqlQuery, (err, result) => {
    if (err) throw err;
    // console.log("res => " + stringify(result));
    let accResponse = [];
    for (let i = 0; i < result.length; i++) {
      let accResult = {
        "id": result[i].id,
        "author": result[i].author,
        "date": result[i].date,
        "speechContent": result[i].speech_content,
        "subjectKeyword": result[i].subject_keyword,
        "userId": result[i].user_id
      }
      accResponse.push(accResult);
    }
    res.status(200).send(accResponse);
  });
});

//insert data in db api
app.post('/speeches', (req, res) => {
  // console.log("req => "+req);
  let data = { date: req.body.date, subject_keyword: req.body.subjectKeyword, speech_content: req.body.speechContent, author: req.body.author, id: req.body.id, user_id: req.body.userId,mail_id: req.body.mailId }
  let sql = "INSERT INTO myappdb.speech SET ?";
  let query = con.query(sql, data, (err, results) => {
    if (err) throw err;
    res.status(200).send(JSON.stringify({ "status": 200, "error": null, "response": results }));
  });
});

//delete data in db api
app.delete('/speeches/:id', (req, res) => {
  // console.log("req del = > " + stringify(req));
  let sql = "DELETE FROM myappdb.speech WHERE id=" + stringify(req.params.id) + "";
  let query = con.query(sql, (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify({ "status": 200, "error": null, "response": results }));
  });
});


//update speech
app.put('/speeches', (req, res) => {
  let sql = "UPDATE myappdb.speech SET date='" + req.body.date + "', subject_keyword='" + req.body.subjectKeyword + "', speech_content='" + req.body.speechContent + "', user_id='" + req.body.userId + "', author='" + req.body.author + "' WHERE id=" + stringify(req.body.id);
  let query = con.query(sql, (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify({ "status": 200, "error": null, "response": results }));
  });
});

//sending mail api
app.post("/sendmail", (req, res) => {
  console.log("request came");
  let user = req.body;
  console.log("user data = > ", stringify(user))
  sendMail(user, (err, info) => {
    if (err) {
      console.log(err);
      res.status(400);
      res.send({ error: "Failed to send email" });
    } else {
      console.log("Email has been sent");
      res.status(200).send(info);
    }
  });
});

//login api
app.post("/login", (req, res) => {
  var email = req.body.email;
  var password = req.body.password;
  con.query('SELECT * FROM users WHERE email = ?', [email], function (error, results, fields) {
    if (error) {
      // console.log("error ocurred",error);
      res.send({
        "code": 400,
        "message": "error ocurred"
      }).json()
    } else {
      // console.log('The solution is: ', results);
      if (results.length > 0) {
        if (results[0].password == password) {
          res.send({
            "code": 200,
            "message": "login sucessfull"
          }).json();
        }
        else {
          res.send({
            "code": 204,
            "message": "Email and password does not match"
          }).json();
        }
      }
      else {
        res.send({
          "code": 204,
          "message": "Email does not exits"
        }).json();
      }
    }
  });
});

//register api
app.post("/signup", (req, res) => {
  // console.log("req", stringify(req.body));
  let count = false ;
  let email = req.body.email;
  con.query('SELECT * FROM users WHERE email = ?', [email], function (error, results, fields) {
    if(error){
      res.send({
        "code": 400,
        "message": "error ocurred"
      });
    }else if(results.length>0){
      console.log(stringify(results));
      res.send({
        "code": 204,
        "message": "User already exits"
      });
    }else{
      var today = new Date();
      var users = {
        "user_name": req.body.userName,
        "email": req.body.email,
        "password": req.body.password,
        "created": today,
        "modified": today
      }
      con.query('INSERT INTO users SET ?', users, function (error, results, fields) {
        if (error) {
          // console.log("error ocurred", error);
          res.send({
            "code": 400,
            "message": "error ocurred"
          })
        } else {
          // console.log('The solution is: ', results);
          res.send({
            "code": 200,
            "message": "user registered sucessfully"
          });
        }
      });
    }
  });
})


// var speechController = require('./controllers/SpeechController')();

// app.use('/speech',speechController);

app.listen(port, function () {
  var datetime = new Date();
  var message = 'Server is running on Port :- ' + port + ' started at :- ' + datetime;
  console.log(message);
});

