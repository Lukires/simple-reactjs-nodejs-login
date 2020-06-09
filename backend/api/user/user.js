
var express = require('express');
var MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
var session = require('../../cache/session');
const { v4: uuid } = require('uuid');
var moment = require('moment');
var user = express.Router();

var sessioncache = session.Get();

var db = null;

try {
    let url = 'mongodb://localhost:27017';

    MongoClient.connect(url, function (err, mdb) {
        if (err) throw err;
        var dbo = mdb.db("buddytest");
        dbo.createCollection("users", function (err, res) {
            if (err) {
                throw err;
            }
        });
        dbo.createCollection("sessions", function (err, res) {
            if (err) {
                throw err;
            }
        });
        db = dbo;
    });
} catch (e) {
    return e;
}


const saltRounds = 10;

user.post('/register/:email/:password', function (req, res) {
    if (!validateEmail(req.params.email)) {
        res.status(300).send("Invalid email");
        return;
    }

    db.collection("users").findOne({ email: req.params.email },
        function (err, user) {
            if (user) {
                res.status(300).send("Email already in use");
                return;
            } else {
                bcrypt.genSalt(saltRounds, function (err, salt) {
                    bcrypt.hash(req.params.password, salt, function (err, hash) {
                        var user = { email: req.params.email, password: hash };
                        db.collection("users").insertOne(user, async function (dberr, dbres) {
                            if (dberr) {
                                res.status(300).send("Couldn't create user");
                                return;
                            }
                            await newSession(dbres.insertedId, function (newsession) {
                                console.log(newsession.session);
                                res.cookie('session', newsession.session, {
                                    maxAge: 1800000,
                                    //Should add secure: true 
                                });
                                res.status(200).send(newsession.session);
                            });
                            return;
                        });
                    });
                });
            }
        });
});

user.get('/login/:email/:password', function (req, res) {
    if (!validateEmail(req.params.email)) {
        res.status(300).send("Invalid email");
        return;
    }

    db.collection("users").findOne({ email: req.params.email },
        function (err, user) {
            if (!user) {
                console.log(1);
                res.status(300).send("Email not in use");
                return;
            } else {
                console.log(2);
                bcrypt.compare(req.params.password, user.password, async function (encrypterr, encryptresult) {
                    if (encryptresult) {
                        await newSession(user._id, function (newsession) {
                            res.cookie('session', newsession.session, {
                                maxAge: 1800000,
                                //Should add secure: true 
                            });
                            console.log(3);
                            res.status(200).send(newsession.session);
                        });
                    } else {
                        console.log(4);
                        res.status(300).send("Incorrect password");
                    }
                });
            }
        });


});

user.post('/logout', function (req, res) {
    if (req.headers.cookie == undefined) {
        res.status(300).send("Not logged in");
        return;
    }

    session = getCookie("session", req.headers.cookie);
    res.cookie('session', '0', {
        maxAge: 0,
    })

    db.collection("sessions").updateOne({ session: session }, { $set: { expired: true } }, function (err, nres) {
        if (err) {
            res.status(300).send("Logged out (unsuccessfully?)")
        } else {
            res.status(200).send("Logged out");
        }
    })

})

user.get('/validsession', async function (req, res) {
    if (req.headers.cookie == undefined) {
        console.log(1)
        res.status(200).send(false);
        return;
    }
    console.log(getCookie("session", req.headers.cookie));

    await validSession(getCookie("session", req.headers.cookie), function (valid) {
        console.log(valid);
        res.status(200).send(valid);
    });

    return;
});

user.get('/', function (req, res) {
    if (req.headers.cookie == undefined) {
        console.log(1)
        res.status(300).send("Invalid session");
        return;
    }
    var session = getCookie("session", req.headers.cookie);
    db.collection("sessions").findOne({ session: session }, function (dberr, dbres) {
        if (dberr) {
            res.status(300).send("Invalid session");
        } else {
            console.log(dbres);
            db.collection("users").findOne({ _id: dbres.user }, function (dberr, dbres) {
                if (dberr) {
                    res.status(300).send("Couldn't fetch user");
                } else {
                    console.log("oi");
                    console.log(dbres);
                    res.status(200).send(dbres);
                }
            })
        }
    });
});

function validSession(session, callback) {
    if (sessioncache.get(session) == undefined) {
        console.log(3);
        db.collection("sessions").findOne({ session: session },
            function (err, user) {
                console.log(4);
                if (user) {
                    if (user.expired) {
                        callback(false);
                        return false;
                    }

                    //We check if our session has expired
                    datetime = user.datetime;
                    now = moment();
                    if (now.isAfter(datetime)) {
                        callback(false);
                        return false;
                    }

                    //We add the session to our cache before returning true
                    //We make sure our cache doesn't outlast our database cache
                    difference = moment().diff(datetime, 'seconds');

                    //We only set ou
                    difference = difference > 1800 ? 1800 : difference;
                    sessioncache.set(session, user.user, difference);
                    callback(true);
                    return true;
                } else {
                    callback(false)
                    return false;
                }
            });
    } else {
        console.log(6);
        callback(true);
        return true;
    }
}


function validateEmail(email) {
    const re = '/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/';
    return true;
    //return re.match(String(email).toLowerCase());
}

function getCookie(name, cookies) {
    const value = `; ${cookies}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function newSession(user_id, callback) {

    var datetime = moment();
    //Big M for month
    datetime.add(1, 'M');
    var session = { session: uuid(), user: user_id, expires: datetime.toDate(), expired: false };

    await db.collection("sessions").insertOne(session, function (err, res) {
        if (err) {
            return false;
        } else {
            //We cache sessions
            sessioncache.set(session.session, session.user);
            callback(session);
            return session;
        }
    });
}

module.exports = user;