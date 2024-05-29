var mysql = require('mysql2');

var con = mysql.createConnection({
    host: "85.31.232.128",
    user: "riti",
    password: "Riti@123",
    database: "riti_app"
});
exports.executeSql = function(sql, callback) {
    con.query(sql, function(err, result) {
        if (err) {
            // throw err;
            console.log(err);
            callback(null, err);
        } else {
           
            callback(result);
        }

    });

}