var express = require('express');
var app = express();
const {conn,sql} = require('./connect');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.get('', function(req, res) {
    res.send('Hello World');
});

app.get('', function(req, res) {
   res.send("hhh")
});
app.get('/Account',async function(req, res) {
    var pool = await conn;
    var sqlString = "SELECT * FROM Account";
    return await pool.request().query(sqlString, function(err, data){
        console.log(err,data);
    });
});

app.listen(3000, function(){
    console.log('Ứng dung đang chạy tại địa chỉ http://localhost:3000');
})