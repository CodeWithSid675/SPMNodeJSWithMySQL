var sql = require('mysql')

var con = sql.createConnection({
    host: 'localhost',
    password: 'root',
    user: 'root',
    database: 'myappdb',
    port: 3306
})

// con.connect(function(err){
//     if(err) throw err;
//     console.log("MySQL DB connected");
// })

module.exports = con