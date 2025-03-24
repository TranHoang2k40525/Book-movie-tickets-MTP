var sql = require('mssql/msnodesqlv8');
// cas thong tin ket noi
var config  = {
    server: 'localhost',
    user: 'sa',
    password:'123456789',
    database:'MTB 67CS1',
    driver: "msnodesqlv8",
}
const conn = new sql.ConnectionPool(config).connect().then(pool =>{
    return pool;
});
module.exports = {
    conn: conn,
    sql: sql
}