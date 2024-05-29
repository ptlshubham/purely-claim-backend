const express = require("express");
const router = express.Router();
const db = require("../db/db");
var crypto = require('crypto');
const jwt = require('jsonwebtoken');
let secret = 'prnv';
router.post('/GetUsersLogin',(req, res, next)=> {
    console.log("gdfdg");
    console.log(req.body);
    const body = req.body;
    var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
    var repass = salt + '' + req.body.password;
    var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
    console.log(encPassword)
    db.executeSql("select * from users where email='"+req.body.email+"';", function (data, err) {
        console.log(data);
        if(err){
            console.log(err);
        }
        if (data == null || data == undefined || data.length === 0) {
            return res.json(1);
        } else {
            db.executeSql("select * from users where email='" + req.body.email + "' and password='" + encPassword + "';", function (data1, err) {
                if (data1.length > 0) {
                    module.exports.user = {
                        username: data1[0].email,
                        password: data1[0].password
                    }
                    let token = jwt.sign({ username: data1[0].email, password: data1[0].password },
                        secret, {
                        expiresIn: '1h' // expires in 24 hours
                    }
                    );
                    console.log("token=", token);
                    res.cookie('auth', token);
                    if (data1[0].role == 'Admin') {
                        let resdata = [];
                        db.executeSql("select * from admin where uid=" + data1[0].userid, function (data2, err) {
                            if (err) {
                                console.log(err);
                            } else {
                                resdata.push(data2[0]);
                                resdata[0].token = token;
                                resdata[0].role = data1[0].role;
                                resdata[0].last_login = data1[0].out_time;
                                resdata[0].last_inTime = data1[0].in_time; 
                                db.executeSql("UPDATE  `users` SET status=true,in_time=CURRENT_TIMESTAMP WHERE userid=" + data1[0].userid, function (msg, err) {
                                    if (err) {
                                        console.log("Error in store.js", err);
                                    } else { }
                                });
                                return res.json(resdata);
                            }
                        })
                    } else if (data1[0].role == 'Customer') {
                        console.log('helllllllll')
                        let resdata1 = [];
                        db.executeSql("select * from customer where uid=" + data1[0].userid, function (data3, err) {
                            if (err) {
                                console.log("data");
                                console.log(err);
                            } else {
                                console.log(data3)
                                resdata1.push(data3[0]);
                                resdata1[0].token = token;
                                resdata1[0].role = data1[0].role;
                                resdata1[0].last_login = data1[0].out_time;
                                resdata1[0].last_inTime = data1[0].in_time;
                                db.executeSql("UPDATE  `users` SET status=true,in_time=CURRENT_TIMESTAMP WHERE userid=" + data1[0].userid, function (msg, err) {
                                    if (err) {
                                        console.log("Error in store.js", err);
                                    } else { }
                                });
                                return res.json(resdata1);
                            }
                        })
                    }
                    else if (data1[0].role == 'Sub-Admin') {
                        let resdata5 = [];
                        db.executeSql("select * from admin where uid=" + data1[0].userid, function (data7, err) {
                            if (err) {
                                console.log(err);
                            } else {
                                resdata5.push(data7[0]);
                                resdata5[0].token = token;
                                resdata5[0].role = data1[0].role;
                                resdata5[0].last_login = data1[0].out_time;
                                resdata5[0].last_inTime = data1[0].in_time;
                                db.executeSql("UPDATE  `users` SET status=true,in_time=CURRENT_TIMESTAMP WHERE userid=" + data1[0].userid, function (msg, err) {
                                    if (err) {
                                        console.log("Error in store.js", err);
                                    } else { }
                                });
                                return res.json(resdata5);
                            }
                        })

                    }
                } else {
                    return res.json(2);
                }
            });
        }

    });

});

router.post('/UnlockScreenLock',(req, res, next)=> {
    console.log(req.body);
    var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
    var repass = salt + '' + req.body.password;
    var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
    console.log(encPassword)
    db.executeSql("select * from users where userid='"+req.body.id+"';", function (data, err) {
        console.log(data);
        if(err){
            console.log(err);
        }
        if (data == null || data == undefined || data.length === 0) {
            return res.json(1);
        } else {
            db.executeSql("select * from users where email='" + data[0].email + "' and password='" + encPassword + "';", function (data1, err) {
                if (data1.length > 0) {
                    module.exports.user = {
                        username: data1[0].email,
                        password: data1[0].password
                    }
                    let token = jwt.sign({ username: data1[0].email, password: data1[0].password },
                        secret, {
                        expiresIn: '1h' // expires in 24 hours
                    }
                    );
                    console.log("token=", token);
                    res.cookie('auth', token);
                    if (data1[0].role == 'Admin') {
                        let resdata = [];
                        db.executeSql("select * from admin where uid=" + data1[0].userid, function (data2, err) {
                            if (err) {
                                console.log(err);
                            } else {
                                resdata.push(data2[0]);
                                resdata[0].token = token;
                                resdata[0].role = data1[0].role;
                                resdata[0].last_login = data1[0].out_time;
                                resdata[0].last_inTime = data1[0].in_time; 
                                db.executeSql("UPDATE `users` SET status=true,in_time=CURRENT_TIMESTAMP WHERE userid=" + data1[0].userid, function (msg, err) {
                                    if (err) {
                                        console.log("Error in store.js", err);
                                    } else { }
                                });
                                return res.json(resdata);
                            }
                        })
                    } else if (data1[0].role == 'Customer') {
                        console.log('helllllllll')
                        let resdata1 = [];
                        db.executeSql("select * from customer where uid=" + data1[0].userid, function (data3, err) {
                            if (err) {
                                console.log("data");
                                console.log(err);
                            } else {
                                console.log(data3)
                                resdata1.push(data3[0]);
                                resdata1[0].token = token;
                                resdata1[0].role = data1[0].role;
                                resdata1[0].last_login = data1[0].out_time;
                                resdata1[0].last_inTime = data1[0].in_time;
                                db.executeSql("UPDATE `users` SET status=true,in_time=CURRENT_TIMESTAMP WHERE userid=" + data1[0].userid, function (msg, err) {
                                    if (err) {
                                        console.log("Error in store.js", err);
                                    } else { }
                                });
                                return res.json(resdata1);
                            }
                        })
                    }
                    else if (data1[0].role == 'Sub-Admin') {
                        let resdata5 = [];
                        db.executeSql("select * from admin where uid=" + data1[0].userid, function (data7, err) {
                            if (err) {
                                console.log(err);
                            } else {
                                resdata5.push(data7[0]);
                                resdata5[0].token = token;
                                resdata5[0].role = data1[0].role;
                                resdata5[0].last_login = data1[0].out_time;
                                resdata5[0].last_inTime = data1[0].in_time;
                                db.executeSql("UPDATE `users` SET status=true,in_time=CURRENT_TIMESTAMP WHERE userid=" + data1[0].userid, function (msg, err) {
                                    if (err) {
                                        console.log("Error in store.js", err);
                                    } else { }
                                });
                                return res.json(resdata5);
                            }
                        })

                    }
                } else {
                    return res.json(2);
                }
            });
        }

    });

});
module.exports=router