var express = require('express')
var app = express();
const bodyParser = require('body-parser');
var sql = require('mysql');
var port = process.env.port || 1337;
var con = require('./connection/connect')
var cors = require('cors');
var router = express.Router();
var stringify = require('json-stringify-safe');

con.connect(function(err){
    if(err) throw err;
    console.log("MySQL DB connected");
})

//third party for cors problem
app.use(cors());

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// get all speech api
app.get('/speeches',(req,res) => {
    let sqlQuery = 'SELECT * FROM myappdb.speech';
    let query = con.query(sqlQuery,(err,result)=>{
        if(err) throw err;
        console.log("res => "+stringify(res));
        let accResponse = [];
        for(let i=0;i<result.length;i++){
          let accResult = {
            "id":result[i].id,
            "author":result[i].author,
            "date":result[i].date,
            "speechContent":result[i].speech_content,
            "subjectKeyword":result[i].subject_keyword,
            "userId":result[i].user_id
          }
          accResponse.push(accResult)
        }
        res.status(200).send(accResponse);
    });
});

//insert data in db api
app.post('/speeches',(req,res)=>{
  let request = stringify(req);
  console.log("req => "+request);
    let data = {date:req.body.date,subject_keyword:req.body.subjectKeyword,speech_content:req.body.speechContent,author:req.body.author,id:req.body.id,user_id:req.body.userId}
    let sql = "INSERT INTO myappdb.speech SET ?";
    let query = con.query(sql, data,(err, results) => {
    if(err) throw err;
    res.status(200).send(JSON.stringify({"status": 200, "error": null, "response": results}));
  });
});

//delete data in db api
app.delete('/speeches/:id',(req, res) => {
    console.log("req del = > "+stringify(req));
    let sql = "DELETE FROM myappdb.speech WHERE id="+stringify(req.params.id)+"";
    let query = con.query(sql, (err, results) => {
      if(err) throw err;
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
    });
  });


//update speech
app.put('/speeches',(req, res) => {
  let sql = "UPDATE myappdb.speech SET date='"+req.body.date+"', subject_keyword='"+req.body.subjectKeyword+"', speech_content='"+req.body.speechContent +"', user_id='"+req.body.userId +"', author='"+req.body.author +"' WHERE id="+stringify(req.body.id) ;
  let query = con.query(sql, (err, results) => {
    if(err) throw err;
    res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
  });
});


// var speechController = require('./controllers/SpeechController')();

// app.use('/speech',speechController);

app.listen(port , function(){
    var datetime = new Date();
    var message = 'Server is running on Port :- ' + port + ' started at :- ' + datetime;
    console.log(message);
})

