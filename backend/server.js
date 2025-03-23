const express = require('express');
const SQLServer = require('SqlServer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());
const db =  SQLServer.createConnection({
  host: 'localhost',
  user:'',
  password:'',
  port:'',
  database:'',
});
db.connect();
// xu ly get (select)
app.get('/api/accounts', (req, res)  => {
    var sql = 'SELECT * FROM accounts';
    db.query(sql,(err, result)=>{
        if(err) throw err;
        console.log(result);
        res.send(result); // gui ket qua cho react native
    })
});
// xu ly post (insert)
app.post('/api/accounts', (req, res)  => {
  console.log(req.body);
  // tham so truyen 
    var data = {name:req.body.name, email:req.body.email, password:req.body.password};
    var sql = 'INSERT INTO accounts SET ?';
    db.query(sql,data, req.body,(err, result)=>{
        if(err) throw err;
        console.log(result);
        res.send(result); // gui ket qua cho react native
        res.send ({
          status: "dữ liệu đã được gửi thành công",
          message: "Account created successfully",
          no:null,
          name:req.body.name,
          email:req.body.email,
          password:req.body.password
        })
    })
});
app.listen(3000,'192.168.1.103',()=>{
  console.log('Server đang chạy ở cổng 3000');
});