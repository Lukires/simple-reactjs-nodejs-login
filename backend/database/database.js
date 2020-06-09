var MongoClient = require('mongodb').MongoClient;


//Singleton database connection

var DbConnection = function () {

    var db = null;

    function DbConnect() {
        console.log(1);
        try {
            let url = 'mongodb://localhost:27017';

            MongoClient.connect(url, function(err, mdb) {
                if (err) throw err;
                var dbo = mdb.db("buddytest");
                dbo.createCollection("users", function(err, res) {
                    if (err) {
                        throw err;
                    }
                });
                dbo.createCollection("sessions", function(err, res) {
                    if (err) {
                        throw err;
                    }
                });
                return dbo;
            });
        } catch (e) {
            console.log(5);
            return e;
        }
    }

   function Get() {
        try {
            if (db != null) {
                return db;
            } else {
                db = DbConnect();
                return db; 
            }
        } catch (e) {
            return e;
        }
    }

    return {
        Get: Get
    }
}


module.exports = DbConnection();