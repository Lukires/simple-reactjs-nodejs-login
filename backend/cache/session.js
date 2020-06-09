const NodeCache = require("node-cache");


//Singleton cache connection

var session = function () {
    var session = null;

    function Get() {
        if (session != null) {
            return session;
        } else {
            //Sessions will by default be cached for 30 minutes
            session = new NodeCache({ stdTTL: 1800});;
            return session;
        }
    }

    return {
        Get: Get
    }
}


module.exports = session();