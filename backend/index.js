var express = require('express');

var app = express();

app.get('', function(req, res) {
    res.send('Hello World');
});
app.listen(3000, function(){
    console.log('Ứng dung đang chạy tại địa chỉ http://localhost:3000');
})