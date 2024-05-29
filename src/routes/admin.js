const express = require("express");
const router = express.Router();
const db = require("../db/db");
const multer = require("multer");
const path = require("path");
const config = require("../../config");
var midway = require("./midway");
const jwt = require("jsonwebtoken");
var crypto = require("crypto");
const nodemailer = require("nodemailer");
var handlebars = require("handlebars");
const fs = require("fs");
const schedule = require("node-schedule");
const { log } = require("console");
let dates = new Date(new Date().setDate(new Date().getDate() - 60));

console.log(dates.toISOString().slice(0, 10));
const job = schedule.scheduleJob("0 0 * * *", function () {
  console.log("hello schedule");
  db.executeSql("UPDATE `customer` SET `status`=false WHERE updateddate='" + dates.toISOString().slice(0, 10) + "';", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  }
  );
});

router.post("/SaveServicesList", midway.checkToken, (req, res, next) => {
  console.log(req.body, "servecies");
  db.executeSql("INSERT INTO `serviceslist`(`salonid`,`name`, `price`,`totalcost`, `time`, `point`, `isactive`, `createdate`,`epoint`)VALUES(" + req.body.salonid + ",'" + req.body.name + "'," + req.body.price + "," + req.body.totalcost + "," + req.body.time + "," + req.body.point + ",true,CURRENT_TIMESTAMP," + req.body.epoint + ");", function (data, err) {
    if (err) {
      res.json("error");
    } else {
      return res.json(data);
    }
  }
  );
});
router.post("/SaveSalaryList", midway.checkToken, (req, res, next) => {
  console.log(req.body, "wdsefgrts");
  db.executeSql(
    "INSERT INTO `salary`(`salary`, `desc`, `paiddate`, `empid`)VALUES(" + req.body.salary + " , '" + req.body.desc + "' , '" + req.body.paiddate + "' ," + req.body.empid + ");", function (data, err) {
      if (err) {
        res.json("error");
        console.log("err");
      } else {
        return res.json(data);
      }
    }
  );
});

router.get("/GetAllServices/:id", midway.checkToken, (req, res, next) => {
  db.executeSql("select * from serviceslist where salonid=" + req.params.id + "", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  });
});

router.post("/UpdateServicesList", midway.checkToken, (req, res, next) => {
  db.executeSql("UPDATE  `serviceslist` SET name='" + req.body.name + "',price=" + req.body.price + ",totalcost =" + req.body.totalcost + ",time=" + req.body.time + ",point=" + req.body.point + ",epoint=" + req.body.epoint + ",updateddate=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
    } else {
      return res.json(data);
    }
  }
  );
});

router.post("/UpdateSalaryList", midway.checkToken, (req, res, next) => {
  db.executeSql(
    "UPDATE `salary` SET `salary`= " +
    req.body.salary +
    " ,`desc`='" +
    req.body.desc +
    "',`paiddate`='" +
    req.body.paiddate +
    "' WHERE id= " +
    req.body.id +
    ";",
    function (data, err) {
      if (err) {
        console.log("Error in store.js", err);
      } else {
        return res.json(req.body.empid);
      }
    }
  );
});

router.post("/RemoveSalaryList", midway.checkToken, (req, res, next) => {
  console.log(req.body);
  db.executeSql(
    "Delete from salary where id=" + req.body.id,
    function (data, err) {
      if (err) {
        console.log("Error in store.js", err);
      } else {
        return res.json(data);
      }
    }
  );
});

router.post("/SaveEmployeeList", midway.checkToken, (req, res, next) => {
  db.executeSql("INSERT INTO `employee`(`salonid`,`fname`,`lname`,`contact`,`whatsapp`,`address`,`landmark`,`state`,`city`,`pincode`,`gender`,`isactive`,`createddate`) VALUES (" + req.body.salonid + ",'" + req.body.fname + "','" + req.body.lname + "','" + req.body.contact + "','" + req.body.whatsapp + "','" + req.body.address + "','" + req.body.landmark + "','" + req.body.state + "','" + req.body.city + "'," + req.body.pincode + ",'" + req.body.gender + "',true,CURRENT_TIMESTAMP);", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < req.body.service.length; i++) {
        db.executeSql("INSERT INTO `empservices`(`servicesid`,`servicesname`,`empid`) VALUES(" + req.body.service[i].id + ",'" + req.body.service[i].name + "'," + data.insertId + ");", function (data1, err) {
          if (err) {
            console.log(err);
          } else {
          }
        });
      }
      return res.json("success");
    }
  }
  );
});

router.get("/GetAllEmployee/:id", midway.checkToken, (req, res, next) => {
  db.executeSql("SELECT e.id, e.salonid, e.fname, e.lname, e.contact, e.whatsapp, e.address, e.landmark, e.state, e.city, e.pincode, e.gender, e.isactive, e.createddate, e.updateddate, e.isworking, GROUP_CONCAT(s.servicesname) as services FROM employee e INNER JOIN empservices s ON e.id = s.empid WHERE e.isactive = true AND e.salonid=" + req.params.id + " GROUP BY e.id, e.fname, e.lname, e.contact, e.whatsapp, e.address, e.landmark, e.state, e.city, e.pincode, e.gender, e.isactive, e.createddate, e.updateddate, e.isworking;",
    function (data, err) {
      if (err) {
        console.log(err);
      } else {
        return res.json(data);
      }
    }
  );
});

router.get("/GetOnlyIdealEmployeeList/:id", midway.checkToken, (req, res, next) => {
  db.executeSql("SELECT e.id, e.salonid, e.fname, e.lname, e.contact, e.whatsapp, e.address, e.landmark, e.state, e.city, e.pincode, e.gender, e.isactive, e.createddate, e.updateddate, e.isworking, GROUP_CONCAT(s.servicesname) as services FROM employee e INNER JOIN empservices s ON e.id = s.empid WHERE e.isactive = true AND e.isworking=false AND e.salonid=" + req.params.id + " GROUP BY e.id, e.fname, e.lname, e.contact, e.whatsapp, e.address, e.landmark, e.state, e.city, e.pincode, e.gender, e.isactive, e.createddate, e.updateddate, e.isworking;",
    function (data, err) {
      if (err) {
        console.log(err);
      } else {
        return res.json(data);
      }
    }
  );
});

router.get("/GetEmployeeService", midway.checkToken, (req, res, next) => {
  db.executeSql("select * from empservices", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  });
});

router.post("/RemoveEmployeeList", midway.checkToken, (req, res, next) => {
  console.log(req.body);
  db.executeSql("update `employee` set isactive='0' where id=" + req.body.id, function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
    } else {
      return res.json(data);
    }
  }
  );
});

router.post("/GetAllSalaryList", midway.checkToken, (req, res, next) => {
  console.log(req.body);
  db.executeSql("select s.id,s.salary,s.desc,s.paiddate,s.empid,e.id as eId,e.fname,e.lname,e.contact,e.whatsapp,e.address,e.landmark,e.state,e.city,e.pincode,e.gender from salary s join employee e on s.empid=e.id where s.empid=" + req.body.id, function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  }
  );
});
router.get("/GetAllOrderList", midway.checkToken, (req, res, next) => {
  db.executeSql(
    "select o.id,o.userid,o.totalprice,o.isactive,o.orderdate,c.fname,c.lname,c.email,c.contact,c.whatsapp,c.gender,c.address,c.landmark,c.state,c.city,c.pincode,c.uid,c.vip,c.ismembership,c.notes,c.vouchernotes,c.amountpending from orderlist o join customer c on o.userid=c.uid",
    function (data, err) {
      if (err) {
        console.log(err);
      } else {
        return res.json(data);
      }
    }
  );
});
router.get(
  "/GetAllProductOrderList/:id",
  midway.checkToken,
  (req, res, next) => {
    db.executeSql(
      "select o.id,o.oid,o.uid,o.pid,o.oquant,p.id as Pid,p.name,p.image,p.category,p.price,p.quantity,p.vendorname,p.vendorcontact,p.descripition,p.isactive from orderdetails o join products p on o.pid=p.id where oid=" +
      req.params.id +
      "",
      function (data, err) {
        if (err) {
          console.log(err);
        } else {
          return res.json(data);
        }
      }
    );
  }
);

router.get("/RemoveCustomerOrder/:id", midway.checkToken, (req, res, next) => {
  db.executeSql(
    "DELETE FROM `orderlist` WHERE id=" + req.params.id + "",
    function (data, err) {
      if (err) {
        console.log(err);
      } else {
        db.executeSql(
          "DELETE FROM `orderdetails` WHERE oid=" + req.params.id + "",
          function (data, err) {
            if (err) {
              console.log(err);
            } else {
            }
          }
        );
      }
      return res.json("success");
    }
  );
});
router.post("/UpdateEmployeeList", midway.checkToken, (req, res, next) => {
  db.executeSql("UPDATE `employee` SET fname='" + req.body.fname + "',lname='" + req.body.lname + "',contact='" + req.body.contact + "',whatsapp='" + req.body.whatsapp + "',address='" + req.body.address + "',landmark='" + req.body.landmark + "',state='" + req.body.state + "',city='" + req.body.city + "',gender='" + req.body.gender + "',updateddate=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
    } else {
      return res.json(data);
    }
  }
  );
});

router.post("/UpdateWorkingStatus", midway.checkToken, (req, res, next) => {
  db.executeSql("UPDATE `employee` SET isworking=" + req.body.isworking + " WHERE id=" + req.body.id + ";", function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
    } else {
      return res.json(data);
    }
  }
  );
});
router.post("/UpdateCompleteServices", midway.checkToken, (req, res, next) => {
  db.executeSql("UPDATE `custservices` SET ifcomplete=true WHERE id=" + req.body.CSId + ";", function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
    } else {
      return res.json(data);
    }
  }
  );
});
router.post("/UpdateAppointmentServicesStatus", midway.checkToken, (req, res, next) => {
  console.log(req.body);
  db.executeSql("UPDATE `appointment` SET `isstatus`='" + req.body.isstatus + "' WHERE id=" + req.body.bookingId + ";", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      res.json("success");
    }
  });
});
router.post("/SaveCustomerList", (req, res, next) => {
  console.log(req.body, "data");
  db.executeSql("select * from customer WHERE contact='" + req.body.contact + "' OR whatsapp='" + req.body.whatsapp + "'", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      if (data.length > 0) {
        return res.json("error");
      }
      else {
        db.executeSql("INSERT INTO `customer`(`fname`, `lname`, `email`, `contact`, `whatsapp`, `gender`, `address`, `landmark`, `state`, `city`, `pincode`, `uid`, `vip`, `notes`) VALUES ('" + req.body.fname + "','" + req.body.lname + "','" + req.body.email + "','" + req.body.contact + "','" + req.body.whatsapp + "','" + req.body.gender + "','" + req.body.address + "','" + req.body.landmark + "','" + req.body.state + "','" + req.body.city + "','" + req.body.pincode + "','" + req.body.uid + "'," + req.body.vip + ",'" + req.body.notes + "');", function (data, err) {
          if (err) {
            console.log(err);
          } else {
            return res.json("success");
          }
        });
      }
    }
  });

});

router.get("/GetAllCustomer", midway.checkToken, (req, res, next) => {
  db.executeSql("select * from customer", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  });
});

router.get("/GetAllOffer/:id", midway.checkToken, (req, res, next) => {
  db.executeSql("select * from offer where salonid=" + req.params.id + "", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  });
});
router.post("/SaveOfferList", midway.checkToken, (req, res, next) => {
  if (req.body.id != null && req.body.id != undefined) {
    db.executeSql("delete from offer where id=" + req.body.id, function (data1, err) {
      if (err) {
        console.log(err);
      } else {
        db.executeSql("delete from offerservices where offerid=" + req.body.id, function (data2, err) {
          if (err) {
            console.log(err);
          } else {
            db.executeSql("INSERT INTO `offer`(`salonid`,`offername`,`totalprice`,`offerprice`,`percentage`,`status`)VALUES(" + req.body.salonid + ",'" + req.body.offername + "'," + req.body.totalprice + "," + req.body.offerprice + "," + req.body.percentage + ",true);", function (data, err) {
              if (err) {
                console.log(err);
              } else {
                for (let i = 0; i < req.body.services.length; i++) {
                  db.executeSql("INSERT INTO `offerservices`(`offerid`,`serviceId`,`servicesname`,`totalprice`,`offername`,`offerprice`) VALUES(" + data.insertId + "," + req.body.services[i].selectedServid + ",'" + req.body.services[i].selectedServ + "'," + req.body.totalprice + ",'" + req.body.offername + "'," + req.body.offerprice + ");", function (data1, err) {
                    if (err) {
                      console.log(err);
                    } else {
                      if (i == req.body.services.length - 1) {
                        return res.json("success");
                      }
                    }
                  });
                }
              }
            });
          }
        });
      }
    });
  } else {
    db.executeSql("INSERT INTO `offer`(`salonid`,`offername`,`totalprice`,`offerprice`,`percentage`,`status`)VALUES(" + req.body.salonid + ",'" + req.body.offername + "'," + req.body.totalprice + "," + req.body.offerprice + "," + req.body.percentage + ",true);", function (data, err) {
      if (err) {
        console.log(err);
      } else {
        for (let i = 0; i < req.body.services.length; i++) {
          db.executeSql(
            "INSERT INTO `offerservices`(`offerid`,`serviceId`,`servicesname`,`totalprice`,`offername`,`offerprice`) VALUES(" + data.insertId + "," + req.body.services[i].selectedServid + ",'" + req.body.services[i].servicesname + "'," + req.body.totalprice + ",'" + req.body.offername + "'," + req.body.offerprice + ");", function (data1, err) {
              if (err) {
                console.log(err);
              } else {
              }
            }
          );
        }
      }
      return res.json("success");
    }
    );
  }
});

router.post("/GetUsedServicesByOffer", midway.checkToken, (req, res, next) => {
  db.executeSql("select s.offerid,s.servicesname,s.offername,s.offerprice,sl.id as slId,sl.offerid,sl.servicesname,sl.offername,sl.offerprice from offerservices s join serviceslist sl on s.servicesid=sl.id where s.offerappointmentid = " + req.body.id + "", function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
    } else {
      return res.json(data);
    }
  }
  );
});
router.post("/SaveAcceptUserOrder", midway.checkToken, (req, res, next) => {
  db.executeSql("UPDATE `orderlist` SET isactive=false,updateddate=CURRENT_TIMESTAMP WHERE id = " + req.body.id + "", function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
    } else {
      return res.json(data);
    }
  });
});
router.get("/removeOfferDetails/:id", midway.checkToken, (req, res, next) => {
  db.executeSql("Delete from offer where id=" + req.params.id, function (data, err) {
    if (err) {
      console.log(err);
    } else {
      db.executeSql(
        "Delete from offerservices where offerid=" + req.params.id,
        function (data1, err) {
          if (err) {
            console.log(err);
          } else {
            return res.json(data1);
          }
        }
      );
    }
  }
  );
});

router.get("/GetActiveOffer/:id", midway.checkToken, (req, res, next) => {
  db.executeSql("select * from offer where status=true AND salonid=" + req.params.id + ",", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  });
});
router.post("/getAllOfferDataList", midway.checkToken, (req, res, next) => {
  db.executeSql(
    "select * from offerservices where offerid = " + req.body.id + "",
    function (data, err) {
      if (err) {
        console.log("Error in store.js", err);
      } else {
        return res.json(data);
      }
    }
  );
});
router.post("/SaveMembershipList", midway.checkToken, (req, res, next) => {
  console.log(req.body);

  if (req.body.id != null && req.body.id != undefined) {
    db.executeSql("delete from membership where id=" + req.body.id, function (data1, err) {
      if (err) {
        console.log(err);
      } else {
        db.executeSql("delete from membershipservices where membershipid=" + req.body.id, function (data2, err) {
          if (err) {
            console.log(err);
          } else {
            db.executeSql("INSERT INTO `membership`(`salonid`,`membershipname`, `membershipdiscount`, `totalprice`, `membershipprice`, `status`, `validity`, `validitydays`) VALUES(" + req.body.salonid + ",'" + req.body.membershipname + "'," + req.body.membershipdiscount + "," + req.body.totalprice + "," + req.body.membershipprice + ",true,'" + req.body.validity + "','" + req.body.validitydays + "');", function (data3, err) {
              if (err) {
                console.log(err);
              } else {
                for (let i = 0; i < req.body.services.length; i++) {
                  db.executeSql("INSERT INTO `membershipservices` ( `membershipid`, `servicesname`, `serviceid`, `totalprice`, `membershipname`, `quantity`, `serviceprice`) VALUES(" + data3.insertId + ",'" + req.body.services[i].servicesname + "'," + req.body.services[i].selectedServid + "," + req.body.services[i].totalAmount + ",'" + req.body.membershipname + "'," + req.body.services[i].quantity + "," + req.body.services[i].price + ");", function (data4, err) {
                    if (err) {
                      console.log(err);
                    } else {
                      if (i == req.body.services.length - 1) {
                        res.json("success");
                      }
                    }
                  }
                  );
                }
              }
            });
          }
        });
      }
    });
  }
  else {
    db.executeSql("INSERT INTO `membership`(`salonid`,`membershipname`,`membershipdiscount`,`totalprice`,`membershipprice`,`status`, `validity`, `validitydays`)VALUES(" + req.body.salonid + ",'" + req.body.membershipname + "'," + req.body.membershipdiscount + "," + req.body.totalprice + "," + req.body.membershipprice + ",true,'" + req.body.validity + "','" + req.body.validitydays + "');", function (data, err) {
      if (err) {
        console.log(err);
      } else {
        for (let i = 0; i < req.body.services.length; i++) {
          db.executeSql("INSERT INTO `membershipservices` ( `membershipid`, `servicesname`, `serviceid`, `totalprice`, `membershipname`, `quantity`, `serviceprice`) VALUES(" + data.insertId + ",'" + req.body.services[i].servicesname + "'," + req.body.services[i].selectedServid + "," + req.body.services[i].totalAmount + ",'" + req.body.membershipname + "'," + req.body.services[i].quantity + "," + req.body.services[i].price + ");", function (data1, err) {
            if (err) {
              console.log(err);
            } else {
              if (i == req.body.services.length - 1) {
                res.json("success");
              }
            }
          }
          );
        }
      }
    });
  }

});
router.post("/GetUsedServicesByMembership", midway.checkToken, (req, res, next) => {
  db.executeSql("SELECT * FROM `membershipservices` WHERE membershipid=" + req.body.id + "", function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
    } else {
      return res.json(data);
    }
  }
  );
}
);
router.get("/removeMembershipDetails/:id", midway.checkToken, (req, res, next) => {
  db.executeSql("Delete from membership where id=" + req.params.id, function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  }
  );
}
);
router.get("/GetAllMembership/:id", midway.checkToken, (req, res, next) => {
  db.executeSql("select * from membership where salonid=" + req.params.id + "", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  });
});
router.get("/GetAllActiveMembership/:id", midway.checkToken, (req, res, next) => {
  db.executeSql("select * from membership where status=true AND salonid=" + req.params.id + "", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  });
});
router.post("/UpdateActiveMemberShip", midway.checkToken, (req, res, next) => {
  console.log(req.body);
  db.executeSql("UPDATE  `membership` SET status=" + req.body.status + " WHERE id=" + req.body.id + ";", function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
    } else {
      return res.json(data);
    }
  }
  );
});
router.get("/UpdatePurchaseMembershipStatusURL/:id", midway.checkToken, (req, res, next) => {
  db.executeSql("UPDATE `purchasedmembership` SET isactive=false WHERE memid=" + req.params.id + ";", function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
    } else {
      return res.json(data);
    }
  });
});

// router.post("/SaveAppointmentList", midway.checkToken, (req, res, next) => {
//   console.log("save appt");
//   console.log(req.body);
//   var checkdate = req.body.bookingDate;

//   if (checkdate == undefined) {
//     if (req.body.offerId != undefined) {
//       db.executeSql("INSERT INTO `appointment`(`custid`, `totalprice`, `totalpoint`, `totaltime`, `isactive`, `createddate`,`updatedate`,`ispayment`,`appointmentdate`,`timeslot`)VALUES(" + req.body.custid + ",'" + req.body.totalprice + "','" + req.body.totalpoint + "','" + req.body.totaltime + "'," + req.body.isactive + ",CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,false,'" + req.body.bookingdate + "','" + req.body.timeSlot + "');",
//         function (data, err) {
//           if (err) {
//             console.log(err);
//           } else {
//             for (let i = 0; i < req.body.selectedService.length; i++) {
//               db.executeSql("INSERT INTO `custservices`(`servicesid`,`servicesname`,`custid`,`appointmentid`,`employeename`,`empid`) VALUES(" + req.body.selectedService[i].selectedServid + ",'" + req.body.selectedService[i].selectedServ + "'," + req.body.custid + "," + data.insertId + ",'" + req.body.selectedService[i].selectedEmp + "'," + req.body.selectedService[i].selectedEmpid + ");",
//                 function (data1, err) {
//                   if (err) {
//                     console.log(err);
//                   } else {
//                   }
//                 }
//               );
//             }
//             if (req.body.tCustPoint == 0) {
//               db.executeSql("INSERT INTO `point`( `custid`, `totalcustpoint`)VALUES(" + req.body.custid + "," + req.body.lessPoints + ");", function (data2, err) {
//                 if (err) {
//                   console.log(err);
//                 } else {
//                   console.log(data);
//                 }
//               }
//               );
//             } else {
//               console.log("defined");
//               console.log(req.body);
//               db.executeSql("UPDATE `point` SET totalcustpoint=" + req.body.lessPoints + " WHERE custid=" + req.body.custid + ";", function (data3, err) {
//                 if (err) {
//                   console.log(err);
//                 } else {
//                   console.log(data);
//                 }
//               }
//               );
//             }
//           }
//           return res.json(data);
//         }
//       );
//     } else {
//       db.executeSql("INSERT INTO `appointment`(`custid`, `totalprice`, `totalpoint`, `totaltime`, `isactive`, `createddate`,`updatedate`,`ispayment`,`appointmentdate`,`timeslot`)VALUES(" + req.body.custid + ",'" + req.body.totalprice + "','" + req.body.totalpoint + "','" + req.body.totaltime + "'," + req.body.isactive + ",CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,false,'" + req.body.bookingdate + "','" + req.body.timeSlot + "');", function (data, err) {
//         if (err) {
//           console.log(err);
//         } else {
//           for (let i = 0; i < req.body.selectedService.length; i++) {
//             db.executeSql("INSERT INTO `custservices`(`servicesid`,`servicesname`,`custid`,`appointmentid`,`employeename`,`empid`) VALUES(" + req.body.selectedService[i].selectedServid + ",'" + req.body.selectedService[i].selectedServ + "'," + req.body.custid + "," + data.insertId + ",'" + req.body.selectedService[i].selectedEmp + "'," + req.body.selectedService[i].selectedEmpid + ");", function (data1, err) {
//               if (err) {
//                 console.log(err);
//               } else {
//               }
//             }
//             );
//           }
//           if (req.body.tCustPoint == 0) {
//             db.executeSql("INSERT INTO `point`( `custid`, `totalcustpoint`)VALUES(" + req.body.custid + "," + req.body.lessPoints + ");", function (data, err) {
//               if (err) {
//                 console.log(err);
//               } else {
//                 console.log(data);
//               }
//             }
//             );
//           } else {
//             db.executeSql("UPDATE `point` SET totalcustpoint=" + req.body.lessPoints + " WHERE custid=" + req.body.custid + ";",
//               function (data, err) {
//                 if (err) {
//                   console.log(err);
//                 } else {
//                   console.log(data);
//                 }
//               }
//             );
//           }
//         }
//         return res.json("success");
//       }
//       );
//     }
//   } else {
//     db.executeSql("INSERT INTO `appointment`(`custid`, `totalprice`, `totalpoint`, `totaltime`, `isactive`, `createddate`,`updatedate`,`ispayment`,`appointmentdate`,`timeslot`)VALUES(" + req.body.custid + ",'" + req.body.totalprice + "','" + req.body.totalpoint + "','" + req.body.totaltime + "'," + req.body.isactive + ",CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,false,'" + req.body.bookingdate + "','" + req.body.timeSlot + "');", function (data, err) {
//       if (err) {
//         console.log(err);
//       } else {
//         for (let i = 0; i < req.body.selectedService.length; i++) {
//           db.executeSql("INSERT INTO `custservices`(`servicesid`,`servicesname`,`custid`,`appointmentid`,`employeename`,`empid`) VALUES(" + req.body.selectedService[i].selectedServid + ",'" + req.body.selectedService[i].selectedServ + "'," + req.body.custid + "," + data.insertId + ",'" + req.body.selectedService[i].selectedEmp + "'," + req.body.selectedService[i].selectedEmpid + ");", function (data1, err) {
//             if (err) {
//               console.log(err);
//             } else {
//             }
//           }
//           );
//         }
//         if (req.body.tCustPoint == 0) {
//           db.executeSql("INSERT INTO `point`( `custid`, `totalcustpoint`)VALUES(" + req.body.custid + "," + req.body.lessPoints + ");", function (data, err) {
//             if (err) {
//               console.log(err);
//             } else {
//               console.log(data);
//             }
//           }
//           );
//         } else {
//           db.executeSql("UPDATE `point` SET totalcustpoint=" + req.body.lessPoints + " WHERE custid=" + req.body.custid + ";", function (data, err) {
//             if (err) {
//               console.log(err);
//             } else {
//               console.log(data);
//             }
//           }
//           );
//         }
//       }
//       return res.json("success");
//     }
//     );
//   }
// });

router.post("/SaveBookingDetails", midway.checkToken, (req, res, next) => {
  console.log(req.body, 'save Booking');
  db.executeSql("INSERT INTO `appointment`(`custid`, `bookingdate`, `bookingtime`, `totalprice`, `totalpoint`, `totaltime`, `ispayment`, `isstatus`, `isactive`, `createddate`)VALUES(" + req.body.custid + ",'" + req.body.bookingDate + "','" + req.body.timeSlot + "','" + req.body.totalprice + "','" + req.body.totalpoint + "','" + req.body.totaltime + "',false,'" + req.body.isstatus + "'," + req.body.isactive + ",CURRENT_TIMESTAMP);", function (data, err) {
    if (err) {
      console.log(err);
      res.status(500).json({ error: "Failed to save booking details" });
    } else {
      let completedServices = 0;
      for (let i = 0; i < req.body.selectedService.length; i++) {

        if (req.body.selectedService[i].servicetype === 'Regular') {
          handleRegularService(req.body, data.insertId, i, checkCompletion);
        }
        else if (req.body.selectedService[i].servicetype === 'Combo') {
          handleComboService(req.body, data.insertId, i, checkCompletion);
        }
        else if (req.body.selectedService[i].servicetype === 'Membership') {
          handleMembershipService(req.body, data.insertId, i, checkCompletion);
        }

      }
      function checkCompletion() {
        completedServices++;
        if (completedServices === req.body.selectedService.length) {
          // handlePointAndHistory(req.body, data.insertId);
          res.json({ message: "Booking details saved successfully" });
        }
      }
    }
  });
});


function handleRegularService(body, appointmentId, index, callback) {
  db.executeSql("INSERT INTO `custservices`(`servicetype`, `servicesid`, `servicesname`, `custid`, `appointmentid`) VALUES('" + body.selectedService[index].servicetype + "'," + body.selectedService[index].selectedServid + ",'" + body.selectedService[index].servicesname + "'," + body.custid + "," + appointmentId + ");", function (servdata, err) {
    if (err) {
      console.log(err);
    } else {
      callback();
    }
  });
}

const processedComboIds = {};
function handleComboService(body, appointmentId, index, callback) {
  db.executeSql("INSERT INTO `custservices`(`servicetype`, `servicesid`, `servicesname`, `custid`, `appointmentid`, `comboid`) VALUES('" + body.selectedService[index].servicetype + "'," + body.selectedService[index].selectedServid + ",'" + body.selectedService[index].servicesname + "'," + body.custid + "," + appointmentId + "," + body.selectedService[index].comboId + ");", function (servdata, err) {
    if (err) {
      console.log(err);
      callback();
    } else {
      if (body.selectedService[index].servicetype === 'Combo') {
        const comboId = body.selectedService[index].comboId;
        if (!processedComboIds[comboId]) {
          processedComboIds[comboId] = true;
          db.executeSql("INSERT INTO `purchasedoffer`( `custid`, `offerid`,`appointmentId`,`createddate`) VALUES (" + body.custid + "," + comboId + "," + appointmentId + ",CURRENT_TIMESTAMP);", function (data, err) {
            if (err) {
              console.log(err);
            }
            callback();
          });
        } else {
          callback();
        }
      } else {
        callback();
      }
    }
  });
}

function handleMembershipService(body, appointmentId, index, callback) {
  console.log(body);
  db.executeSql("INSERT INTO `custservices`(`servicetype`, `servicesid`, `servicesname`, `custid`, `appointmentid`,`memid`) VALUES('" + body.selectedService[index].servicetype + "'," + body.selectedService[index].selectedServid + ",'" + body.selectedService[index].servicesname + "'," + body.custid + "," + appointmentId + "," + body.selectedService[index].memid + ");", function (servdata, err) {
    if (err) {
      console.log(err);
    } else {
      db.executeSql("SELECT remainingquantity FROM `purchasedmembership` WHERE cid = " + body.custid + " AND memid = " + body.selectedService[index].memid + " AND serid = " + body.selectedService[index].selectedServid, function (selectData, selectErr) {
        if (selectErr) {
          console.log("Error fetching remainingquantity:", selectErr);
        } else {
          const remainingquantity = selectData[0].remainingquantity;
          if (remainingquantity > 0) {
            db.executeSql("UPDATE `purchasedmembership` SET `remainingquantity` = remainingquantity - 1 WHERE cid = " + body.custid + " AND memid = " + body.selectedService[index].memid + " AND serid = " + body.selectedService[index].selectedServid, function (updateData, updateErr) {
              if (updateErr) {
                console.log("Error updating remainingquantity:", updateErr);
              } else {
                db.executeSql("INSERT INTO `membershiphistory`(`custid`, `memid`, `servid`, `appointmentid`, `usedquantity`, `remainingquantity`, `useddate`, `createddate`) VALUES(" + body.custid + "," + body.selectedService[index].memid + "," + body.selectedService[index].selectedServid + "," + appointmentId + ",1," + (remainingquantity - 1) + ",CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);", function (historyData, historyErr) {
                  if (historyErr) {
                    console.log("Error inserting into membershiphistory:", historyErr);
                  } else {
                    callback();
                  }
                });
              }
            });
          } else {
            console.log("Remaining quantity is not sufficient");
            callback();
          }
        }
      });
    }
  });
}


router.post("/UpdateAppointementEmployeeDetails", midway.checkToken, (req, res, next) => {
  db.executeSql("UPDATE `custservices` SET `employeename`='" + req.body.employeeName + "',`empid`=" + req.body.empId + " WHERE id=" + req.body.CSId + ";", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      db.executeSql("UPDATE `employee` SET `isworking`=true WHERE id=" + req.body.empId + ";", function (data, err) {
        if (err) {
          console.log(err);
        } else {
          db.executeSql("UPDATE `appointment` SET `isstatus`='" + req.body.isstatus + "' WHERE id=" + req.body.bookingId + ";", function (data, err) {
            if (err) {
              console.log(err);
            } else {
              res.json("success");
            }
          });
        }
      });
    }
  });
});

router.post("/RemoveAppointementEmployeeData", midway.checkToken, (req, res, next) => {
  console.log(req.body);
  db.executeSql("UPDATE `custservices` SET `employeename`=NULL,`empid`=NULL WHERE id=" + req.body.CSId + ";", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      db.executeSql("UPDATE `employee` SET `isworking`=false WHERE id=" + req.body.empid + ";", function (data, err) {
        if (err) {
          console.log(err);
        } else {
          db.executeSql("UPDATE `appointment` SET `isstatus`='" + req.body.isstatus + "' WHERE id=" + req.body.bookingId + ";", function (data, err) {
            if (err) {
              console.log(err);
            } else {
              res.json("success");
            }
          });
        }
      });
    }
  });
});

router.post("/RemoveAppointmentDetails", midway.checkToken, (req, res, next) => {
  db.executeSql("DELETE FROM `appointment` WHERE id=" + req.body.id, function (data, err) {
    if (err) {
      console.log(err);
      res.status(500).json({ error: "Failed to save booking details" });
    } else {
      db.executeSql("DELETE FROM `custservices` WHERE appointmentid=" + req.body.id, function (result, err) {
        if (err) {
          console.log(err);
        } else {
          for (let i = 0; i < req.body.usedServices.length; i++) {
            if (req.body.usedServices[i].servicetype === 'Combo') {
              db.executeSql("DELETE FROM `purchasedoffer` WHERE appointmentId=" + req.body.id, function (result1, err) {
                if (err) {
                  console.log(err);
                } else {
                }
              });
            } else if (req.body.usedServices[i].servicetype === 'Membership') {
              db.executeSql("UPDATE `purchasedmembership` SET `remainingquantity` = remainingquantity + 1 WHERE cid = " + req.body.custid + " AND memid = " + req.body.usedServices[i].memid + " AND serid = " + req.body.usedServices[i].servicesid, function (updateResult, err) {
                if (err) {
                  console.log("Error updating remainingquantity:", err);
                } else {
                  db.executeSql("DELETE FROM `membershiphistory` WHERE custid = " + req.body.custid + " AND memid = " + req.body.usedServices[i].memid + " AND servid = " + req.body.usedServices[i].servicesid + " AND appointmentid = " + req.body.id, function (historyResult, err) {
                    if (err) {
                      console.log("Error inserting into membershiphistory:", err);
                    } else {
                    }
                  });
                }
              });
            }
            if (req.body.isstatus == 'Processing' && req.body.usedServices[i].empid != null && req.body.usedServices[i].ifcomplete == false) {
              db.executeSql("UPDATE `employee` SET `isworking` = false WHERE id = " + req.body.usedServices[i].empid + ";", function (data, err) {
                if (err) {
                  console.log(err);
                } else {
                  console.log('Updated employee status to inactive');
                }
              });
            }
          }
          res.status(200).json({ message: "Appointment details removed successfully" });
        }
      });
    }
  });
});

router.post("/RemoveRegularItemsFromServices", midway.checkToken, (req, res, next) => {
  console.log(req.body);
  db.executeSql("DELETE FROM `custservices` WHERE id=" + req.body.CSId + ";", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      db.executeSql("UPDATE appointment SET totalprice = totalprice - " + req.body.price + ",totalpoint = totalpoint -" + req.body.point + ",totaltime = totaltime - " + req.body.time + " WHERE id =" + req.body.appointmentid + ";", function (data, err) {
        if (err) {
          console.log(err);
        } else {
          res.json("success");
        }
      });
    }
  });
});

router.post("/RemoveMembershipItemsFromServices", midway.checkToken, (req, res, next) => {
  console.log(req.body);
  db.executeSql("DELETE FROM `custservices` WHERE id=" + req.body.CSId + ";", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      db.executeSql("UPDATE `purchasedmembership` SET `remainingquantity`=remainingquantity + 1 WHERE cid =" + req.body.custid + " AND memid =" + req.body.memid + " AND serid =" + req.body.servicesid + ";", function (data, err) {
        if (err) {
          console.log(err);
        } else {
          db.executeSql("DELETE FROM `membershiphistory` WHERE custid =" + req.body.custid + " AND memid =" + req.body.memid + " AND servid =" + req.body.servicesid + " AND appointmentid ='" + req.body.appointmentid + "';", function (data, err) {
            if (err) {
              console.log(err);
            } else {
              db.executeSql("UPDATE appointment SET totalprice = totalprice - " + req.body.price + ",totalpoint = totalpoint -" + req.body.point + ",totaltime = totaltime - " + req.body.time + " WHERE id =" + req.body.appointmentid + ";", function (data, err) {
                if (err) {
                  console.log(err);
                } else {
                  res.json("success");
                }
              });
            }
          });
        }
      });
    }
  });
});

router.post("/RemoveComboItemsFromServices", midway.checkToken, (req, res, next) => {
  console.log(req.body);
  db.executeSql("DELETE FROM `custservices` WHERE custid=" + req.body.custid + " AND appointmentid=" + req.body.appointmentid + " AND servicetype='Combo';", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      db.executeSql("DELETE FROM `purchasedoffer` WHERE custid =" + req.body.custid + " AND appointmentId =" + req.body.appointmentid + ";", function (data, err) {
        if (err) {
          console.log(err);
        } else {
          db.executeSql("UPDATE appointment SET totalprice = totalprice - " + req.body.removeprice + ",totalpoint = totalpoint -" + req.body.removepoint + ",totaltime = totaltime - " + req.body.removetime + " WHERE id =" + req.body.appointmentid + ";", function (data, err) {
            if (err) {
              console.log(err);
            } else {
              res.json("success");
            }
          });
        }
      });
    }
  });
});

router.post("/saveOfferPurchase", midway.checkToken, (req, res, next) => {
  db.executeSql("INSERT INTO `purchasedoffer`( `custid`, `employeeid`, `offerid`,`appointmentId`, `payment`, `offerprice`, `createddate`, `updateddate`) VALUES (" + req.body.custid + "," + req.body.empId + "," + req.body.offerId + "," + req.body.appointmentId + "," + false + "," + req.body.offerprice + ",CURRENT_TIMESTAMP,null);", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      res.json("success");
    }
  });
});

router.get("/GetAllAppointment", midway.checkToken, (req, res, next) => {
  db.executeSql("select a.id,a.custid,a.bookingdate,a.bookingtime,a.totalprice,a.totalpoint,a.totaltime,a.raitings,a.ispayment,a.isstatus,a.isactive,a.createddate,a.updateddate,c.id as cId,c.fname,c.lname,c.email,c.contact,c.whatsapp,c.gender,c.vip,c.isMembership,c.notes,c.vouchernotes,c.amountpending from appointment a join customer c on a.custid=c.id where isactive=true ORDER BY a.bookingdate", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  }
  );
});
router.post("/ChackForPassword", midway.checkToken, (req, res, next) => {
  var salt = "7fa73b47df808d36c5fe328546ddef8b9011b2c6";
  var repass = salt + "" + req.body.pass;
  var encPassword = crypto.createHash("sha1").update(repass).digest("hex");

  db.executeSql("select * from users where userid=" + req.body.id + " and password='" + encPassword + "'", function (data, err) {
    if (err) {
      res.status(500).json({ error: "An internal server error occurred" });
    } else {
      if (data.length > 0) {
        res.json({ message: "success" });
      } else {
        res.json({ error: "Invalid credentials" });
      }
    }
  });
});


// router.post("/updatePasswordAccordingRole", midway.checkToken,(req, res, next) => {
//     console.log(req.body)
//     var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
//     var repass = salt + '' + req.body.password;
//     var encPassword = crypto.createHash('sha1').update(repass).digest('hex');
//     if (req.body.role == 'Admin') {
//         db.executeSql("UPDATE  `admin` SET password='" + encPassword + "' WHERE id=" + req.body.id + ";", function(data, err) {
//             if (err) {
//                 console.log("Error in store.js", err);
//             } else {
//                 return res.json(data);
//             }
//         });
//     }
// });

router.get("/GetAllEnquiryList", midway.checkToken, (req, res, next) => {
  db.executeSql("select * from appointment WHERE isactive=true", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  }
  );
});

router.post("/UpdateSalaryStatus", midway.checkToken, (req, res, next) => {
  db.executeSql(
    "UPDATE  `salary` SET status=" +
    req.body.status +
    " WHERE id=" +
    req.body.id +
    ";",
    function (data, err) {
      if (err) {
        console.log("Error in store.js", err);
      } else {
        return res.json(data);
      }
    }
  );
});

var nowDate = new Date();
date = nowDate.getFullYear() + "-" + (nowDate.getMonth() + 1) + "-" + nowDate.getDate();

router.get("/GetDailyTotal", midway.checkToken, (req, res, next) => {
  db.executeSql("select * from appointment where createddate='" + date + "' and ispayment=true", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  }
  );
});

router.get("/GetMonthlyTotal", midway.checkToken, (req, res, next) => {
  db.executeSql("select * from appointment where  DATE_FORMAT(createddate, '%m') = DATE_FORMAT(CURRENT_TIMESTAMP, '%m') and ispayment=true", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  }
  );
});

router.post("/UpdateCustomerList", midway.checkToken, (req, res, next) => {
  db.executeSql("UPDATE `customer` SET fname='" + req.body.fname + "',lname='" + req.body.lname + "',email='" + req.body.email + "',contact='" + req.body.contact + "',whatsapp='" + req.body.whatsapp + "',gender='" + req.body.gender + "',vip=" + req.body.vip + ",updateddate=CURRENT_TIMESTAMP,address='" + req.body.address + "',`landmark`='" + req.body.landmark + "',`state`='" + req.body.state + "',`city`='" + req.body.city + "',`pincode`='" + req.body.pincode + "' WHERE id=" + req.body.id + ";", function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
    } else {
      return res.json(data);
    }
  }
  );
});

router.get("/removeCustomerDetails/:id", midway.checkToken, (req, res, next) => {
  db.executeSql("Delete from customer where id=" + req.params.id, function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
    } else {
      return res.json(data);
    }
  }
  );
}
);

router.get("/RemoveServicesList/:id", midway.checkToken, (req, res, next) => {
  db.executeSql("Delete from serviceslist where id=" + req.params.id, function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  }
  );
});

function mail(filename, data, toemail, subj, mailname) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: "ptlshubham@gmail.com",
      pass: "mmdovwldhqpjzgdg",
    },
  });
  const filePath = "src/assets/emailtemplets/" + filename;
  const source = fs.readFileSync(filePath, "utf-8").toString();
  const template = handlebars.compile(source);
  const replacements = data;
  const htmlToSend = template(replacements);

  const mailOptions = {
    from: `"ptlshubham@gmail.com"`,
    subject: subj,
    to: toemail,
    Name: mailname,
    html: htmlToSend,
    attachments: [
      {
        filename: "8ef701a9-e74c-41f7-a851-2fe09139a836.png",
        path: "src/assets/img/8ef701a9-e74c-41f7-a851-2fe09139a836.png",
        cid: "web-logo",
      },
      {
        filename: "boucher-img.jpg",
        path: "src/assets/img/boucher-img.jpg",
        cid: "boucher-img",
      },
      {
        filename: "check-icon.png",
        path: "src/assets/img/check-icon.png",
        cid: "check-icon",
      },
      {
        filename: "facebook2x.png",
        path: "src/assets/img/facebook2x.png",
        cid: "facebook",
      },
      {
        filename: "instagram2x.png",
        path: "src/assets/img/instagram2x.png",
        cid: "instagram",
      },
      {
        filename: "pinterest2x.png",
        path: "src/assets/img/pinterest2x.png",
        cid: "pinterest",
      },
      {
        filename: "whatsapp2x.png",
        path: "src/assets/img/whatsapp2x.png",
        cid: "whatsapp",
      },
      {
        filename: "youtube2x.png",
        path: "src/assets/img/youtube2x.png",
        cid: "youtube",
      },
      {
        filename: "sad-icon.png",
        path: "src/assets/img/sad-icon.png",
        cid: "sad-icon",
      },
      {
        filename: "bell-icon.png",
        path: "src/assets/img/bell-icon.png",
        cid: "bell-icon",
      },
      {
        filename: "reminder-img.png",
        path: "src/assets/img/reminder-img.png",
        cid: "reminder-img",
      },
      {
        filename: "cover-img-0.png",
        path: "src/assets/img/cover-img-0.png",
        cid: "cover-img",
      },
      {
        filename: "cover-img-002.png",
        path: "src/assets/img/cover-img-002.png",
        cid: "cover-img2",
      },
    ],
  };
  transporter.sendMail(mailOptions, function (error, info) {
    console.log("fgfjfj");
    if (error) {
      console.log(error);
      res.json("Errror");
    } else {
      console.log("Email sent: " + info.response);
      res.json(data);
    }
  });
}

router.post("/ForgotPassword", (req, res, next) => {
  let otp = Math.floor(100000 + Math.random() * 900000);
  console.log(req.body);
  db.executeSql("select * from users where email='" + req.body.email + "';", function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
      return res.json("err");
    } else {
      console.log(data[0]);
      db.executeSql(
        "INSERT INTO `otp`(`userid`, `otp`, `createddate`, `createdtime`,`role`,`isactive`) VALUES (" +
        data[0].userid +
        "," +
        otp +
        ",CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'" +
        data[0].role +
        "',true)",
        function (data1, err) {
          if (err) {
            console.log(err);
          } else {
            const replacements = {
              votp: otp,
              email: req.body.email,
            };
            mail(
              "verification.html",
              replacements,
              req.body.email,
              "Password resetting",
              " "
            );
            res.json(data);
          }
        }
      );
    }
  }
  );
});

router.post("/GetOneTimePassword", (req, res, next) => {
  console.log(req.body);
  db.executeSql("select * from otp where userid = '" + req.body.id + "' " + " and otp =' " + req.body.otp + "' ", function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
    } else {
      return res.json(data);
    } if (data.length > 0) {
      res.json({ message: "success" });
    } else {
      res.json({ error: "Invalid credentials" });
    }
  }
  );
});

router.post("/UpdatePassword", (req, res, next) => {
  console.log(req.body);
  var salt = "7fa73b47df808d36c5fe328546ddef8b9011b2c6";
  var repass = salt + "" + req.body.password;

  var encPassword = crypto.createHash("sha1").update(repass).digest("hex");
  db.executeSql("UPDATE users SET password='" + encPassword + "' WHERE userid=" + req.body.id + ";",
    function (data, err) {

      if (err) {
        console.log("Error in store.js", err);
      } else {
        console.log("shsyuhgsuygdyusgdyus", data);
        return res.json(data);

      }
    }
  );
});

router.post("/UpdateActiveStatus", midway.checkToken, (req, res, next) => {
  db.executeSql("UPDATE `appointment` SET isactive=" + req.body.isactive + ", updateddate=CURRENT_TIMESTAMP,ispayment=true WHERE id=" + req.body.id + ";", function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
    } else {
      return res.json(data);
    }
  }
  );
});

router.post("/GetViewAppointment", midway.checkToken, (req, res, next) => {
  db.executeSql("select * from appointment where custid = " + req.body.id + "", function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
    } else {
      return res.json(data);
    }
  }
  );
});

router.post("/UpdateEnquiryStatus", midway.checkToken, (req, res, next) => {
  db.executeSql(
    "UPDATE  `enquiry` SET isactive=" +
    req.body.isactive +
    " WHERE id=" +
    req.body.id +
    ";",
    function (data, err) {
      if (err) {
        console.log("Error in store.js", err);
      } else {
        return res.json(data);
      }
    }
  );
});

router.post("/GetCustomerTotalPoints", midway.checkToken, (req, res, next) => {
  db.executeSql("select * from point where custid = " + req.body.id + "", function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
    } else {
      return res.json(data);
    }
  }
  );
});

router.post("/GetAllCustomerDataList", midway.checkToken, (req, res, next) => {
  db.executeSql("select * from appointment where custid = " + req.body.id + "", function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
    } else {
      return res.json(data);
    }
  }
  );
});

router.post("/GetCustomerById", midway.checkToken, (req, res, next) => {
  console.log("testing");
  console.log(req.body.id);
  db.executeSql("select * from customer where id=" + req.body.id + "", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      console.log("tesing get cust");
      console.log(data);
      if (data.length > 0) {
        db.executeSql("select * from appointment where custid = " + data[0].id + "", function (data1, err) {
          if (err) {
            console.log("Error in store.js", err);
          } else {
            console.log(data1);
            return res.json(data1);
          }
        }
        );
      } else {
        res.json("customer not found");
      }
    }
  }
  );
});
router.post("/SaveRatingsDetails", midway.checkToken, (req, res, next) => {
  db.executeSql("UPDATE `appointment` SET ratings=" + req.body.ratings + " WHERE id=" + req.body.id + "", function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
    } else {
      return res.json("success");
    }
  }
  );
});
router.post("/GetUsedServicesByCustomer", midway.checkToken, (req, res, next) => {
  console.log(req.body);
  db.executeSql("select s.id as CSId,s.servicetype,s.servicesid,s.servicesname,s.custid,s.appointmentid,s.employeename,s.empid,s.comboid,s.memid,s.ifcomplete,sl.id as slId,sl.price,sl.totalcost,sl.time,sl.point,sl.epoint from custservices s join serviceslist sl on s.servicesid=sl.id where s.appointmentid = " + req.body.id + "", function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
    } else {
      return res.json(data);
    }
  }
  );
}
);

var today = new Date();
var dd = String(today.getDate()).padStart(2, "0");
var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
var yyyy = today.getFullYear();

today = yyyy + "-" + mm + "-" + dd;

router.get("/GetAllCompletedServices", midway.checkToken, (req, res, next) => {
  console.log(today, 'date')
  db.executeSql("select a.id,a.custid,a.bookingdate,a.bookingtime,a.totalprice,a.totalpoint,a.totaltime,a.raitings,a.ispayment,a.isstatus,a.isactive,a.createddate,a.updateddate,c.id as cId,c.fname,c.lname,c.email,c.contact,c.whatsapp,c.gender,c.uid,c.vip,c.isMembership,c.notes,c.vouchernotes, c.amountpending FROM from appointment a join customer c on a.custid=c.id where a.isactive=false and a.createddate='" + today + "'", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  });
});

router.post("/SaveModeOfPayment", midway.checkToken, (req, res, next) => {
  // Check if redeempoints are greater than 0
  if (req.body.redeempoints > 0) {
    // Deduct redeemed points from totalcustpoint
    db.executeSql("UPDATE `point` SET totalcustpoint = totalcustpoint - " + req.body.redeempoints + " WHERE custid=" + req.body.custid + ";", function (data, err) {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Error deducting redeem points" });
      } else {
        // Insert into pointhistory
        db.executeSql("INSERT INTO `pointhistory`(`custid`, `appointmentid`, `redeempoint`, `totalpoint`, `redeemdate`) VALUES(" + req.body.custid + "," + req.body.id + "," + req.body.redeempoints + "," + req.body.tCustPoint + ",CURRENT_TIMESTAMP);", function (data1, err) {
          if (err) {
            console.log(err);
            return res.status(500).json({ error: "Error inserting redeem points history" });
          } else {
            // Continue with other operations
            db.executeSql("UPDATE `point` SET totalcustpoint = totalcustpoint + " + req.body.totalpoint + " WHERE custid=" + req.body.custid + ";", function (data, err) {
              if (err) {
                console.log(err);
                return res.status(500).json({ error: "Error deducting redeem points" });
              } else {
                processPayment(req, res);
              }
            });
          }
        });
      }
    });
  } else {
    if (req.body.redeempoints == 0) {
      if (req.body.tCustPoint == 0) {
        db.executeSql("INSERT INTO `point`( `custid`, `totalcustpoint`)VALUES(" + req.body.custid + ",'" + req.body.totalpoint + "');", function (pointdata, err) {
          if (err) {
            console.log(err);
            return res.status(500).json({ error: "Error inserting points" });
          } else {
            // Continue with other operations
            processPayment(req, res);
          }
        });
      } else {
        db.executeSql("UPDATE `point` SET totalcustpoint=totalcustpoint + " + req.body.totalpoint + " WHERE custid=" + req.body.custid + ";", function (updatepointdata, err) {
          if (err) {
            console.log(err);
            return res.status(500).json({ error: "Error updating points" });
          } else {
            // Continue with other operations
            processPayment(req, res);
          }
        });
      }
    }
  }
});

function processPayment(req, res) {
  // Handle payment insertion
  db.executeSql("INSERT INTO `payment`(`cid`, `appointmentid`, `modeofpayment`, `tprice`, `tpoint`, `paidprice`, `redeempoint`, `redeemamount`, `vipdiscount`, `vipamount`, `maxdiscount`, `maxamount`, `cash`, `online`, `pending`, `pendingstatus`, `appointmentdate`, `pdate`, `lastpdate`, `createddate`) VALUES (" + req.body.cId + "," + req.body.id + ",'" + req.body.modeofpayment + "'," + req.body.totalprice + "," + req.body.totalpoint + "," + req.body.subtotal + "," + req.body.redeempoints + "," + req.body.redeempointprice + "," + req.body.vipdiscount + "," + req.body.vipdiscountprice + "," + req.body.maxdiscount + "," + req.body.maxdiscountprice + "," + req.body.cashamount + "," + req.body.onlineamount + "," + req.body.pendingamount + "," + req.body.pendingstatus + ",'" + req.body.bookingdate + "','" + req.body.pdate + "','" + req.body.lastpdate + "',CURRENT_TIMESTAMP);", function (data1, err) {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error inserting payment data" });
    } else {
      // Insert emppoints data
      if (req.body.pendingamount > 0) {
        db.executeSql("UPDATE `customer` SET `amountpending`=true WHERE id=" + req.body.cId + " ;", function (data1, err) {
          if (err) {
            console.log(err);
            return res.status(500).json({ error: "Error inserting payment data" });
          } else {
          }
        });
      }
      insertEmpPoints(req, res);
    }
  });
}

function insertEmpPoints(req, res) {
  // Loop through emppoint array and insert data
  for (let i = 0; i < req.body.emppoint.length; i++) {
    db.executeSql("INSERT INTO `emppoints`(`userid`, `appointmentid`, `empid`, `spoint`, `status`, `createddate`) VALUES (" + req.body.custid + "," + req.body.id + "," + req.body.emppoint[i].empid + ",'" + req.body.emppoint[i].point + "',true,CURRENT_TIMESTAMP);", function (data2, err) {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Error inserting employee points data" });
      }
      else {
        if (req.body.emppoint[i].empTotalPoint > 0) {
          console.log('UPDATE =', i, ':', req.body.emppoint[i].empTotalPoint, req.body.emppoint[i].empid)
          db.executeSql("UPDATE `emptotalpoint` SET `empid`=" + req.body.emppoint[i].empid + ",`totalpoint`= totalpoint + '" + req.body.emppoint[i].point + "' WHERE empid=" + req.body.emppoint[i].empid + ";", function (data2, err) {
            if (err) {
              console.log(err);
              return res.status(500).json({ error: "Error inserting employee points data" });
            } else {
              if (i == req.body.emppoint.length - 1) {
                // Return success response after all emppoints are inserted
                paymentStatus(req, res);
              }
            }
          });
        }
        if (req.body.emppoint[i].empTotalPoint == 0) {
          console.log('Insert =', i, ':', req.body.emppoint[i].empTotalPoint, req.body.emppoint[i].empid)
          db.executeSql("INSERT INTO `emptotalpoint`(`empid`, `totalpoint`) VALUES (" + req.body.emppoint[i].empid + ",'" + req.body.emppoint[i].point + "');", function (data2, err) {
            if (err) {
              console.log(err);
              return res.status(500).json({ error: "Error inserting employee points data" });
            } else {
              if (i == req.body.emppoint.length - 1) {
                // Return success response after all emppoints are inserted
                paymentStatus(req, res);
              }
            }
          });
        }
      }
    });
  }
}

function paymentStatus(req, res) {
  // Handle payment insertion
  db.executeSql("UPDATE `appointment` SET `ispayment`=true WHERE id=" + req.body.id + " ;", function (data1, err) {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error inserting payment data" });
    } else {
      return res.json("success");
    }
  });
}

router.get("/GetAllEmpPointList", midway.checkToken, (req, res, next) => {
  db.executeSql("SELECT * FROM `emptotalpoint`;", function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
    } else {
      return res.json(data);
    }
  });
});

router.get("/GetAllPendingPaymentTotal", midway.checkToken, (req, res, next) => {
  db.executeSql("SELECT cid,SUM(CASE WHEN pendingstatus = true THEN pending ELSE 0 END) AS totalpending FROM payment GROUP BY cid;", function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
    } else {
      return res.json(data);
    }
  });
});

router.get("/GetAllPaymentList", midway.checkToken, (req, res, next) => {
  db.executeSql("SELECT c.id, c.fname, c.lname, c.email, c.contact,c.whatsapp, c.gender,c.address, c.landmark, c.state, c.city, c.pincode,c.uid, c.vip, c.isMembership, c.notes, c.vouchernotes,c.amountpending, p.id as pid,p.cid, p.appointmentid, p.modeofpayment, p.tprice,p.tpoint,p.paidprice, p.redeempoint, p.redeemamount, p.vipdiscount,p.vipamount, p.maxdiscount, p.maxamount, p.cash,p.online, p.pending, p.pendingstatus,p.appointmentdate, p.pdate,p.lastpdate, p.createddate FROM customer c INNER JOIN payment p ON c.id = p.cid;", function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
    } else {
      return res.json(data);
    }
  }
  );
});

// router.get("/GetTodayPendingPaymentList", midway.checkToken, (req, res, next) => {
//   db.executeSql("SELECT c.id, c.fname, c.lname, c.email, c.contact,c.whatsapp, c.gender,c.address, c.landmark, c.state, c.city, c.pincode,c.uid, c.vip, c.isMembership, c.notes, c.vouchernotes,c.amountpending, p.id as pid,p.cid, p.appointmentid, p.modeofpayment, p.tprice,p.tpoint, p.redeempoint, p.redeemamount, p.vipdiscount,p.vipamount, p.maxdiscount, p.maxamount, p.cash,p.online, p.pending, p.pendingstatus, p.pdate, p.createddate FROM customer c INNER JOIN payment p ON c.id = p.cid where p.pdate ='" + today + "' ", function (data, err) {
//     if (err) {
//       console.log("Error in store.js", err);
//     } else {
//       return res.json(data);
//     }
//   }
//   );
// });

router.get("/GetMonthlyPayment", midway.checkToken, (req, res, next) => {
  db.executeSql("select * from payment ", function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
    } else {
      return res.json(data);
    }
  });
});

router.post("/SaveExpensesList", midway.checkToken, (req, res, next) => {
  console.log(req.body);
  db.executeSql("INSERT INTO expenses (salonid, expensesdate, expensesname, expensesprices, employeename, paymenttype) VALUES ('" + req.body.salonid + "','" + req.body.expensesdate + "','" + req.body.expensesname + "','" + req.body.expensesprices + "','" + req.body.employeename + "','" + req.body.paymenttype + "');", function (data, err) {
    console.log(req.body.expensesdate, " , ", req.body.expensesdate);
    if (err) {
      res.json("error");
    } else {
      return res.json(data);
    }
  }
  );
});
router.get("/GetAllExpenses/:id", midway.checkToken, (req, res, next) => {
  db.executeSql("select * from expenses where salonid=" + req.params.id, function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  });
});

router.post("/RemoveExpensesDetails", midway.checkToken, (req, res, next) => {
  db.executeSql(
    "Delete from expenses where id=" + req.body.id,
    function (data, err) {
      if (err) {
        console.log("Error in store.js", err);
      } else {
        return res.json(data);
      }
    }
  );
});

router.post("/UpdateExpensesDetails", midway.checkToken, (req, res, next) => {
  var newdate = new Date(req.body.expensesdate).getDate() + 1;
  var newMonth = new Date(req.body.expensesdate).getMonth();
  var newyear = new Date(req.body.expensesdate).getFullYear();
  var querydate = new Date(newyear, newMonth, newdate);
  db.executeSql(
    "UPDATE expenses SET expensesdate='" +
    querydate.toISOString() +
    "',expensesname='" +
    req.body.expensesname +
    "',expensesprices='" +
    req.body.expensesprices +
    "',employeename='" +
    req.body.employeename +
    "',paymenttype='" +
    req.body.paymenttype +
    "' WHERE id=" +
    req.body.id +
    ";",
    function (data, err) {
      if (err) {
        console.log("Error in store.js", err);
      } else {
        return res.json(data);
      }
    }
  );
});

router.get("/getMonthlyExpensesList", midway.checkToken, (req, res, next) => {
  db.executeSql(
    "select * from expenses where  DATE_FORMAT(expensesdate, '%m') = DATE_FORMAT(CURRENT_TIMESTAMP, '%m')",
    function (data, err) {
      if (err) {
        console.log(err);
      } else {
        return res.json(data);
      }
    }
  );
});

router.post("/UpdateCategoryList", midway.checkToken, (req, res, next) => {
  console.log(req.body);
  db.executeSql(
    "UPDATE `category` SET name='" +
    req.body.name +
    "' where id=" +
    req.body.id +
    ";",
    function (data, err) {
      if (err) {
        console.log("Error in store.js", err);
      } else {
        return res.json(data);
      }
    }
  );
});
router.post("/SaveCategoryList", midway.checkToken, (req, res, next) => {
  console.log(req.body);
  db.executeSql(
    "INSERT INTO `category`( `name`, `isactive`, `createddate`) VALUES ('" +
    req.body.name +
    "',true,CURRENT_TIMESTAMP);",
    function (data, err) {
      if (err) {
        console.log(err);
      } else {
        return res.json("success");
      }
    }
  );
});
router.post("/saveCartList", midway.checkToken, (req, res, next) => {
  console.log(req.body);
  db.executeSql(
    "INSERT INTO `cartlist`( `userid`, `productid`, `quantity`,`price`, `createddate`) VALUES ('" +
    req.body.uid +
    "','" +
    req.body.id +
    "','" +
    req.body.quant +
    "'," +
    req.body.price +
    ",CURRENT_TIMESTAMP);",
    function (data, err) {
      if (err) {
        console.log(err);
      } else {
        return res.json("success");
      }
    }
  );
});
router.post("/SavePlaceOrderList", midway.checkToken, (req, res, next) => {
  db.executeSql(
    "INSERT INTO `orderlist`(`userid`,`totalprice`,`isactive`,`orderdate`,`createddate`) VALUES (" +
    req.body.uid +
    "," +
    req.body.totalprice +
    ",true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);",
    function (data, err) {
      if (err) {
        console.log(err);
      } else {
        console.log(data.insertId, req.body.productlist.length);
        for (let i = 0; i < req.body.productlist.length; i++) {
          db.executeSql(
            "INSERT INTO `orderdetails`(`oid`, `uid`, `pid`, `oquant`, `createddate`) VALUES(" +
            data.insertId +
            "," +
            req.body.productlist[i].userid +
            "," +
            req.body.productlist[i].Pid +
            "," +
            req.body.productlist[i].quantity +
            ",CURRENT_TIMESTAMP);",
            function (data1, err) {
              if (err) {
                console.log("Error in store.js", err);
              } else {
                for (let i = 0; i < req.body.productlist.length; i++) {
                  db.executeSql(
                    "DELETE FROM `cartlist` WHERE id=" +
                    req.body.productlist[i].id +
                    "",
                    function (data3, err) {
                      if (err) {
                        console.log("Error in store.js", err);
                      } else {
                      }
                    }
                  );
                }
              }
            }
          );
        }
      }
      return res.json("success");
    }
  );
});
router.post("/SavePurchaseServiceList", midway.checkToken, (req, res, next) => {
  console.log(req.body, 'data')
  db.executeSql("UPDATE `customer` SET ismembership=true WHERE id=" + req.body.cid + "", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < req.body.services.length; i++) {
        db.executeSql(
          "INSERT INTO `purchasedmembership`(`cid`, `memid`, `serid`, `sname`, `quntity`, `remainingquantity`, `tprice`, `discount`, `dprice`, `validitydate`, `isactive`, `createddate`)VALUES(" + req.body.cid + "," + req.body.memid + "," + req.body.services[i].serviceid + ",'" + req.body.services[i].servicesname + "'," + req.body.services[i].quantity + "," + req.body.services[i].quantity + "," + req.body.tprice + "," + req.body.discount + "," + req.body.dprice + ",'" + req.body.validitydate + "',true,CURRENT_TIMESTAMP);", function (data1, err) {
            if (err) {
              console.log("Error in store.js", err);
            } else {
              if (i == req.body.services.length - 1) {
                res.json("success");
              }
            }
          }
        );
      }
    }
  }
  );
});

router.get("/GetAllMembershipPurchased", midway.checkToken, (req, res, next) => {
  db.executeSql("SELECT * FROM purchasedmembership,membership,customer where purchasedmembership.memid=membership.id AND purchasedmembership.cid=customer.id GROUP BY cid,memid;", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  }
  );
}
);
router.post("/GetMembershipPurchasedByID", midway.checkToken, (req, res, next) => {
  db.executeSql("SELECT * FROM purchasedmembership where cid=" + req.body.cid + " AND memid=" + req.body.memid + "", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  });
});

router.get("/GetActivatedMembership/:id", midway.checkToken, (req, res, next) => {
  db.executeSql("SELECT * FROM purchasedmembership where cid=" + req.params.id + " AND isactive=true", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  }
  );
});

router.post("/updateCartList", midway.checkToken, (req, res, next) => {
  console.log(req.body);
  db.executeSql(
    "UPDATE `cartlist` SET quantity=" +
    req.body.quantity +
    " where id=" +
    req.body.id +
    ";",
    function (data, err) {
      if (err) {
        console.log("Error in store.js", err);
      } else {
        return res.json(data);
      }
    }
  );
});
router.get("/getAllCartList", midway.checkToken, (req, res, next) => {
  db.executeSql(
    "select * from products , cartlist WHERE products.id=cartlist.productid ",
    function (data, err) {
      if (err) {
        console.log(err);
      } else {
        return res.json(data);
      }
    }
  );
});

router.post("/removeCartDetails", midway.checkToken, (req, res, next) => {
  console.log(req.body);
  db.executeSql(
    "Delete from cartlist where userid=" +
    req.body.userid +
    " AND id=" +
    req.body.id +
    "",
    function (data, err) {
      if (err) {
        console.log("Error in store.js", err);
      } else {
        return res.json(data);
      }
    }
  );
});
router.get(
  "/RemoveCategoryDetails/:id",
  midway.checkToken,
  (req, res, next) => {
    console.log(req.params.id);
    db.executeSql(
      "Delete from category where id=" + req.params.id,
      function (data, err) {
        if (err) {
          console.log("Error in store.js", err);
        } else {
          return res.json(data);
        }
      }
    );
  }
);
router.get("/GetAllCategoryList", midway.checkToken, (req, res, next) => {
  db.executeSql("select * from category", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  });
});
router.post("/SaveProductsList", midway.checkToken, (req, res, next) => {
  console.log(req.body);
  db.executeSql(
    "INSERT INTO `products`(`name`, `image`, `category`, `price`, `quantity`, `purchasedate`, `vendorname`, `vendorcontact`, `descripition`, `isactive`, `createddate`,`display`) VALUES ('" +
    req.body.name +
    "','" +
    req.body.image +
    "','" +
    req.body.category +
    "','" +
    req.body.price +
    "','" +
    req.body.quantity +
    "','" +
    req.body.purchasedate +
    "','" +
    req.body.vendorname +
    "','" +
    req.body.vendorcontact +
    "','" +
    req.body.descripition +
    "',true,CURRENT_TIMESTAMP," +
    req.body.display +
    ");",
    function (data, err) {
      if (err) {
        console.log(err);
      } else {
        for (let i = 0; i < req.body.multi.length; i++) {
          db.executeSql(
            "INSERT INTO `images`(`productid`,`catid`,`listimages`,`createddate`)VALUES(" +
            data.insertId +
            ",1,'" +
            req.body.multi[i] +
            "',CURRENT_TIMESTAMP);",
            function (data, err) {
              if (err) {
                console.log("Error in store.js", err);
              } else {
              }
            }
          );
        }
      }
    }
  );
  return res.json("success");
});
router.get("/GetAllProductsList", midway.checkToken, (req, res, next) => {
  db.executeSql("select * from products", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  });
});
router.get("/GetActiveProducts", midway.checkToken, (req, res, next) => {
  db.executeSql(
    "select * from products where display=true",
    function (data, err) {
      if (err) {
        console.log(err);
      } else {
        return res.json(data);
      }
    }
  );
});

router.get("/RemoveProductDetails/:id", midway.checkToken, (req, res, next) => {
  db.executeSql(
    "Delete from products where id=" + req.params.id,
    function (data, err) {
      if (err) {
        console.log("Error in store.js", err);
      } else {
        return res.json(data);
      }
    }
  );
});
router.post("/UploadProductImage", midway.checkToken, (req, res, next) => {
  var imgname = generateUUID();

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "images/products");
    },
    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
      cb(null, imgname + path.extname(file.originalname));
    },
  });
  let upload = multer({ storage: storage }).single("file");
  upload(req, res, function (err) {
    console.log("path=", config.url + "images/products/" + req.file.filename);

    if (req.fileValidationError) {
      console.log("err1", req.fileValidationError);
      return res.json("err1", req.fileValidationError);
    } else if (!req.file) {
      console.log("Please select an image to upload");
      return res.json("Please select an image to upload");
    } else if (err instanceof multer.MulterError) {
      console.log("err3");
      return res.json("err3", err);
    } else if (err) {
      console.log("err4");
      return res.json("err4", err);
    }
    return res.json("/images/products/" + req.file.filename);

    console.log("You have uploaded this image");
  });
});

router.post("/UploadMultiProductImage", midway.checkToken, (req, res, next) => {
  var imgname = generateUUID();

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "images/listimages");
    },
    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
      cb(null, imgname + path.extname(file.originalname));
    },
  });
  let upload = multer({ storage: storage }).single("file");
  upload(req, res, function (err) {
    console.log(
      "path=",
      config.url + "/images/listimages/" + req.file.filename
    );

    if (req.fileValidationError) {
      console.log("err1", req.fileValidationError);
      return res.json("err1", req.fileValidationError);
    } else if (!req.file) {
      console.log("Please select an image to upload");
      return res.json("Please select an image to upload");
    } else if (err instanceof multer.MulterError) {
      console.log("err3");
      return res.json("err3", err);
    } else if (err) {
      console.log("err4");
      return res.json("err4", err);
    }
    return res.json("/images/listimages/" + req.file.filename);
    console.log("You have uploaded this image");
  });
});

router.get(
  "/RemoveRecentUoloadImage",
  midway.checkToken,
  midway.checkToken,
  (req, res, next) => {
    console.log(req.body);
    db.executeSql(
      "SELECT * FROM images ORDER BY createddate DESC LIMIT 1",
      function (data, err) {
        if (err) {
          console.log("Error in store.js", err);
        } else {
          return res.json(data);
        }
      }
    );
  }
);

router.get("/CourosalImage/:id", midway.checkToken, (req, res, next) => {
  console.log(req.body);
  db.executeSql(
    "SELECT * FROM images, products WHERE  images.productid = products.id AND productid=" +
    req.params.id,
    function (data, err) {
      if (err) {
        console.log("Error in store.js", err);
      } else {
        return res.json(data);
      }
    }
  );
});
router.get("/GetCartDataByID/:id", midway.checkToken, (req, res, next) => {
  db.executeSql(
    "select c.id,c.userid,c.productid,c.quantity,c.price,c.createddate,p.id as Pid,p.name,p.image,p.category,p.price,p.quantity as pquantity,p.vendorname,p.vendorcontact,p.descripition,p.isactive from cartlist c join products p on c.productid=p.id  WHERE c.productid=p.id AND c.userid=" +
    req.params.id,
    function (data, err) {
      if (err) {
        console.log("Error in store.js", err);
      } else {
        return res.json(data);
      }
    }
  );
});
router.post("/UpdateProductList", midway.checkToken, (req, res, next) => {
  console.log(req.body);
  db.executeSql(
    "UPDATE `products` SET name='" +
    req.body.name +
    "',descripition='" +
    req.body.descripition +
    "',category='" +
    req.body.category +
    "',purchasedate='" +
    req.body.purchasedate +
    "',quantity=" +
    req.body.quantity +
    ",price=" +
    req.body.price +
    ",vendorname='" +
    req.body.vendorname +
    "',display=" +
    req.body.display +
    ",updateddate=CURRENT_TIMESTAMP where id=" +
    req.body.id +
    ";",
    function (data, err) {
      if (err) {
        console.log("Error in store.js", err);
      } else {
        return res.json(data);
      }
    }
  );
});
router.post("/Verification", midway.checkToken, (req, res, next) => {
  let otp = Math.floor(100000 + Math.random() * 900000);
  db.executeSql(
    "INSERT INTO `otp`(`otp`,`createddate`,`createdtime`,`role`,`isactive`,`email`) VALUES (" +
    otp +
    ",CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,'" +
    req.body.role +
    "',true,'" +
    req.body.email +
    "')",
    function (data1, err) {
      if (err) {
        console.log(err);
      } else {
        const replacements = {
          votp: otp,
          email: req.body.email,
        };
        mail(
          "verification.html",
          replacements,
          req.body.email,
          "Verify a New Account",
          " "
        );
        res.json(data1);
      }
    }
  );
});

router.post("/GetRegisterOtp", (req, res, next) => {
  console.log(req.body);
  db.executeSql(
    "select * from otp where email = '" + req.body.email + "'",
    function (data, err) {
      if (err) {
        console.log("Error in store.js", err);
      } else {
        return res.json(data);
      }
    }
  );
});

router.post("/SaveUserCustomerList", (req, res, next) => {
  var salt = "7fa73b47df808d36c5fe328546ddef8b9011b2c6";
  var repass = salt + "" + req.body.password;
  var encPassword = crypto.createHash("sha1").update(repass).digest("hex");
  db.executeSql(
    "INSERT INTO `users`(`email`,`password`,`role`,`isactive`)VALUES('" +
    req.body.email +
    "','" +
    encPassword +
    "','Customer',true);",
    function (data, err) {
      if (err) {
        console.log(err);
      } else {
        db.executeSql(
          "INSERT INTO `customer`(`fname`,`lname`,`email`,`contact`,`whatsapp`,`gender`,`createddate`,`uid`,`ismembership`)VALUES('" +
          req.body.fname +
          "','" +
          req.body.lname +
          "','" +
          req.body.email +
          "','" +
          req.body.contact +
          "','" +
          req.body.contact +
          "','" +
          req.body.gender +
          "',CURRENT_TIMESTAMP," +
          data.insertId +
          "," +
          req.body.isMembership +
          ");",
          function (data, err) {
            if (err) {
              console.log(err);
            } else {
              console.log(data);
            }
          }
        );
      }
      return res.json("success");
    }
  );
});

router.post("/SaveVendorList", midway.checkToken, (req, res, next) => {
  console.log(req.body);
  db.executeSql("INSERT INTO `vendor`(`salonid`, `fname`, `gst`, `contact`, `whatsapp`, `address`, `state`, `city`, `pincode`, `isactive`, `createdate`, `updatedate`) VALUES ('" + req.body.salonid + "','" + req.body.fname + "','" + req.body.gst + "','" + req.body.contact + "','" + req.body.whatsapp + "','" + req.body.address + "','" + req.body.state + "','" + req.body.city + "'," + req.body.pincode + ",true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json("success");
    }
  }
  );
});
router.get("/GetAllVendor/:id", midway.checkToken, (req, res, next) => {
  db.executeSql("select * from vendor  where salonid=" + req.params.id, function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  });
});

router.post("/RemoveVendorList", midway.checkToken, (req, res, next) => {
  console.log(req.body);
  db.executeSql(
    "Delete from vendor where id=" + req.body.id,
    function (data, err) {
      if (err) {
        console.log("Error in store.js", err);
      } else {
        return res.json(data);
      }
    }
  );
});

router.post("/UpdateVendorList", midway.checkToken, (req, res, next) => {
  db.executeSql(
    "UPDATE `vendor` SET fname='" + req.body.fname + "',gst='" + req.body.gst + "',contact='" + req.body.contact + "',whatsapp='" + req.body.whatsapp + "',address='" + req.body.address + "',state='" + req.body.state + "',city='" + req.body.city + "',updatedate=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data, err) {
      if (err) {
        console.log("Error in store.js", err);
      } else {
        return res.json(data);
      }
    }
  );
});
router.get("/GetCustDetails", midway.checkToken, (req, res, next) => {
  db.executeSql(
    "select c.fname,c.lname,c.contact,c.whatsapp,c.email,c.gender from customer c where custid = id" +
    req.body.id +
    "",
    function (data, err) {
      if (err) {
        console.log(err);
      } else {
        return res.json(data);
      }
    }
  );
});

router.post("/GetCustomerDataById", midway.checkToken, (req, res, next) => {
  console.log(req.body);
  db.executeSql(
    "select * from customer where id = " + req.body.id + "",
    function (data, err) {
      if (err) {
        console.log("Error in store.js", err);
      } else {
        return res.json(data);
      }
    }
  );
});
// router.post("/GetCustomerTotalPoints", midway.checkToken,(req, res, next) => {
//     db.executeSql("select * from point where custid = " + req.body.id + "", function (data, err) {
//         if (err) {
//             console.log("Error in store.js", err);
//         } else {
//             return res.json(data);
//         }
//     });
// })

router.post("/UploadBannersImage", midway.checkToken, (req, res, next) => {
  var imgname = generateUUID();

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "images/banners");
    },
    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
      cb(null, imgname + path.extname(file.originalname));
    },
  });
  let upload = multer({ storage: storage }).single("file");
  upload(req, res, function (err) {
    console.log("path=", config.url + "images/banners/" + req.file.filename);

    if (req.fileValidationError) {
      console.log("err1", req.fileValidationError);
      return res.json("err1", req.fileValidationError);
    } else if (!req.file) {
      console.log("Please select an image to upload");
      return res.json("Please select an image to upload");
    } else if (err instanceof multer.MulterError) {
      console.log("err3");
      return res.json("err3", err);
    } else if (err) {
      console.log("err4");
      return res.json("err4", err);
    }
    return res.json("/images/banners/" + req.file.filename);
  });
});

router.post("/SaveWebBanners", midway.checkToken, (req, res, next) => {
  console.log(req.body);
  db.executeSql("INSERT INTO `webbanners`(`salonid`, `name`, `category`,`bannersimage`,`status`)VALUES('" + req.body.salonid + "','" + req.body.purpose + "','" + req.body.category + "','" + req.body.image + "'," + req.body.status + ");",
    function (data, err) {
      if (err) {
        res.json("error");
      } else {
        res.json("success");
      }
    }
  );
});


router.get("/GetWebBanners/:id", midway.checkToken, (req, res, next) => {
  db.executeSql("select * from webbanners where salonid=" + req.params.id, function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
    } else {
      return res.json(data);
    }
  });
});

router.get("/GetImageCategoryGroupBy", (req, res, next) => {
  db.executeSql("SELECT category,COUNT(*) FROM webbanners GROUP BY category;", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  })
})

router.post("/RemoveWebBanners", midway.checkToken, (req, res, next) => {
  console.log(req.id);
  db.executeSql(
    "Delete from webbanners where id=" + req.body.id,
    function (data, err) {
      if (err) {
        console.log("Error in store.js", err);
      } else {
        return res.json(data);
      }
    }
  );
});

router.post("/UpdateActiveWebBanners", midway.checkToken, (req, res, next) => {
  console.log(req.body);
  db.executeSql(
    "UPDATE  `webbanners` SET status=" + req.body.status + " WHERE id=" + req.body.id + ";", function (data, err) {
      if (err) {
        console.log("Error in store.js", err);
      } else {
        return res.json(data);
      }
    }
  );
});
router.post("/UpdateActiveOffers", midway.checkToken, (req, res, next) => {
  console.log(req.body);
  db.executeSql(
    "UPDATE  `OFFER` SET status=" +
    req.body.status +
    " WHERE id=" +
    req.body.id +
    ";",
    function (data, err) {
      if (err) {
        console.log("Error in store.js", err);
      } else {
        return res.json(data);
      }
    }
  );
});
router.get("/GetWebActiveBanner", midway.checkToken, (req, res, next) => {
  db.executeSql("select * from webbanners where status=1 AND name='slider'", function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
    } else {
      return res.json(data);
    }
  }
  );
});

router.post("/SaveRegistrationList", (req, res, next) => {
  console.log(req.body, "companies");
  db.executeSql("INSERT INTO `companies`(`fname`, `lname`, `uemail`, `cname`, `uphone`, `isactive`, `createddate`) VALUES ('" + req.body.fname + "','" + req.body.lname + "','" + req.body.email + "','" + req.body.cname + "','" + req.body.phoneno + "',true,CURRENT_TIMESTAMP);", function (data, err) {
    if (err) {
      res.json("error");
    } else {
      var salt = "7fa73b47df808d36c5fe328546ddef8b9011b2c6";
      var repass = salt + "" + req.body.password;
      var encPassword = crypto.createHash("sha1").update(repass).digest("hex");
      db.executeSql("INSERT INTO `users`(`salonid`, `email`, `password`, `role`, `isactive`) VALUES (" + data.insertId + ",'" + req.body.email + "','" + encPassword + "','" + req.body.adminrole + "',true);", function (data1, err) {
        if (err) {
          res.json("error");
        } else {
          db.executeSql("INSERT INTO `admin`(`salonid`, `firstname`, `lastname`, `email`, `password`, `isactive`, `role`, `uid`) VALUES (" + data.insertId + ",'" + req.body.fname + "','" + req.body.lname + "','" + req.body.email + "','" + encPassword + "',true,'" + req.body.adminrole + "','" + data1.insertId + "');", function (data2, err) {
            if (err) {
              res.json("error");
            } else {
              db.executeSql("INSERT INTO `general`(`salonid`,`vipdiscount`, `maxdiscount`, `emppointsconvert`, `custpointsconvert`,`currency` ,`createddate`)VALUES (" + data.insertId + ",0,0,0,0,'₹',CURRENT_TIMESTAMP);", function (data3, err) {
                if (err) {
                  console.log(err)
                  res.json("error");
                } else {
                  return res.json('success');
                }
              });
            }
          });
        }
      });
    }
  });
});

router.get("/GetAllRegistrationList/:id", midway.checkToken, (req, res, next) => {
  db.executeSql("select * from companies where id=" + req.params.id, function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  });
});

router.post("/UpdateUserDetails", midway.checkToken, (req, res, next) => {
  console.log(req.body)
  db.executeSql("UPDATE `companies` SET fname='" + req.body.fname + "',lname='" + req.body.lname + "',uphone='" + req.body.uphone + "',uwhatsapp='" + req.body.uwhatsapp + "',uaddress='" + req.body.uaddress + "',ustate='" + req.body.ustate + "',`ulandmark`='" + req.body.ulandmark + "',`ucity`='" + req.body.ucity + "',`ugender`='" + req.body.selectGender + "',`upincode`='" + req.body.upincode + "',updateddate=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
    } else {
      return res.json(data);
    }
  });
});
router.post("/UpdateCompaniesDetails", midway.checkToken, (req, res, next) => {
  // console.log(req.body)
  db.executeSql("UPDATE `companies` SET cname='" + req.body.cname + "',cphone='" + req.body.cphone + "',cwhatsapp='" + req.body.cwhatsapp + "',uwhatsapp='" + req.body.uwhatsapp + "',cemail='" + req.body.cemail + "',cgst='" + req.body.cgst + "',caddress='" + req.body.caddress + "',cstate='" + req.body.cstate + "',`clandmark`='" + req.body.clandmark + "',`ccity`='" + req.body.ccity + "',`cpincode`='" + req.body.cpincode + "',updateddate=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
    } else {
      return res.json(data);
    }
  });
});

router.post("/SaveCompaniesLogo", midway.checkToken, (req, res, next) => {
  console.log(req.body, "compny logo")
  db.executeSql("UPDATE `companies` SET clogo='" + req.body.clogo + "',updateddate=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
    } else {
      return res.json(data);
    }
  });
});
router.post("/RemoveCompaniesLogo", midway.checkToken, (req, res, next) => {
  console.log(req.id);
  db.executeSql(
    "Delete from companies where id=" + req.body.id,
    function (data, err) {
      if (err) {
        console.log("Error in store.js", err);
      } else {
        return res.json(data);
      }
    }
  );
});


router.get("/RemoveRegistrationDetails/:id", midway.checkToken, (req, res, next) => {
  db.executeSql("Delete from saloonlist where id=" + req.params.id, function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  }
  );
}
);

router.post("/SaveSeoDetails", midway.checkToken, (req, res, next) => {
  console.log(req.body)
  db.executeSql("select * from seo where salonid=" + req.body.salonid + " && type='" + req.body.type + "'", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
      if (data.length == 0) {
        db.executeSql("INSERT INTO `seo`(`salonid`, `type`,`code`, `isactive`,`createddate`)VALUES(" + req.body.salonid + ",'" + req.body.type + "','" + req.body.code + "'," + req.body.isactive + ",CURRENT_TIMESTAMP);", function (data1, err) {
          if (err) {
            console.log(err)
            res.json("error");
          } else {
            return res.json(data1);
          }
        });
      }
      else {
        db.executeSql("UPDATE `seo` SET type='" + req.body.type + "',code='" + req.body.code + "', isactive=" + req.body.isactive + ",updateddate=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data2, err) {
          if (err) {
            console.log(err);
            res.json("error");
          } else {
            return res.json(data2);
          }
        });
      }
    }
  });
});
router.get("/GetSeoDetails/:salonid", midway.checkToken, (req, res, next) => {
  db.executeSql("select * from seo where salonid=" + req.params.salonid, function (data, err) {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
      return res.json(data);
    }
  });
});
router.post("/SaveSocialLinks", midway.checkToken, (req, res, next) => {
  console.log(req.body)
  db.executeSql("select * from sociallinks where salonid=" + req.body.salonid + "", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
      if (data.length == 0) {
        db.executeSql("INSERT INTO `sociallinks`(`salonid`, `facebook`,`instagram`, `twitter`, `linkedin`, `youtube`,`createddate`)VALUES(" + req.body.salonid + ",'" + req.body.facebook + "','" + req.body.instagram + "','" + req.body.twitter + "','" + req.body.linkedin + "','" + req.body.youtube + "',CURRENT_TIMESTAMP);", function (data1, err) {
          if (err) {
            console.log(err)
            res.json("error");
          } else {
            return res.json(data1);
          }
        });
      }
      else {
        db.executeSql("UPDATE `sociallinks` SET facebook='" + req.body.facebook + "',instagram='" + req.body.instagram + "',twitter='" + req.body.twitter + "',linkedin='" + req.body.linkedin + "',youtube='" + req.body.youtube + "',updateddate=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data2, err) {
          if (err) {
            console.log(err);
            res.json("error");
          } else {
            return res.json(data2);
          }
        });
      }
    }
  });
});
router.get("/GetSocialLinks/:salonid", midway.checkToken, (req, res, next) => {
  db.executeSql("select * from sociallinks where salonid=" + req.params.salonid, function (data, err) {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
      return res.json(data);
    }
  });
});

router.post("/SaveCredentials", midway.checkToken, (req, res, next) => {
  db.executeSql("select * from credentials where salonid=" + req.body.salonid + " && accounttype='" + req.body.accounttype + "'", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
      if (data.length == 0) {
        console.log('', data)
        db.executeSql("INSERT INTO `credentials`(`salonid`, `username`, `accounttype`, `password`, `createddate`) VALUES(" + req.body.salonid + ",'" + req.body.username + "','" + req.body.accounttype + "','" + req.body.password + "',CURRENT_TIMESTAMP);", function (data1, err) {
          if (err) {
            console.log(err)
          } else {
            return res.json(data1);
          }
        });
      }
      else {
        console.log('fhugfvhjvghgvhyivyhgvyh')
        console.log(req.body)
        db.executeSql("UPDATE `credentials` SET username='" + req.body.username + "',password='" + req.body.password + "',updateddate=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data2, err) {
          if (err) {
            console.log(err);
            res.json("error");
          } else {
            return res.json(data2);
          }
        });
      }
    }
  });
});

router.get("/getSocialCredentials/:salonid", midway.checkToken, (req, res, next) => {
  db.executeSql("select * from credentials where salonid=" + req.params.salonid, function (data, err) {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
      return res.json(data);
    }
  });
});


router.post("/UploadLogoImage", midway.checkToken, (req, res, next) => {
  var imgname = generateUUID();
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "images/logo");
    },
    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
      cb(null, imgname + path.extname(file.originalname));
    },
  });
  let upload = multer({ storage: storage }).single("file");
  upload(req, res, function (err) {
    console.log("path=", config.url + "images/logo/" + req.file.filename);

    if (req.fileValidationError) {
      console.log("err1", req.fileValidationError);
      return res.json("err1", req.fileValidationError);
    } else if (!req.file) {
      console.log("Please select an image to upload");
      return res.json("Please select an image to upload");
    } else if (err instanceof multer.MulterError) {
      console.log("err3");
      return res.json("err3", err);
    } else if (err) {
      console.log("err4");
      return res.json("err4", err);
    }
    return res.json("/images/logo/" + req.file.filename);
  });
});
//----------

router.post("/SaveVendororderList", midway.checkToken, (req, res, next) => {
  console.log(req.body, "dfggf");
  db.executeSql("INSERT INTO `vendororder`(`vid`, `totalorderprice`, `totalquantity`, `orderdate`) VALUES (" + req.body.vid + "," + req.body.finalprice + "," + req.body.totalQuantity + ", CURRENT_TIMESTAMP);", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      console.log(req.body.product.length);
      for (let i = 0; i < req.body.product.length; i++) {
        console.log(req.body.product[i]);
        db.executeSql("INSERT INTO `vendorproduct`(`oid`,`vid`,`pname`,`pquantity`,`pprice`,`createddate`) VALUES(" + data.insertId + "," + req.body.vid + ",'" + req.body.product[i].Productname + "','" + req.body.product[i].qty + "','" + req.body.product[i].productprice + "',CURRENT_TIMESTAMP );", function (data1, err) {
          if (err) {
            console.log(err);
          } else {
          }
        }
        );
      }
      return res.json("success");
    }
  }
  );
});

router.get("/GetVendorOrderList/:id", midway.checkToken, (req, res, next) => {
  db.executeSql("select o.id,o.vid,o.totalorderprice,o.totalquantity,o.orderdate,v.id as vendorid,v.fname,v.gst,v.contact,v.whatsapp,v.address,v.city,v.pincode,v.isactive,v.createdate from vendororder o join vendor v on o.vid=v.id where o.vid = " + req.params.id + "", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  });
});

router.get("/RemoveorderDetails/:id", midway.checkToken, (req, res, next) => {
  db.executeSql("Delete from vendororder where id=" + req.params.id, function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  }
  );
}
);
// let secret = 'prnv';
router.post("/login", (req, res, next) => {
  const body = req.body;
  console.log(body);
  var salt = "7fa73b47df808d36c5fe328546ddef8b9011b2c6";
  var repass = salt + "" + body.password;
  var encPassword = crypto.createHash("sha1").update(repass).digest("hex");
  db.executeSql(
    "select * from admin where email='" + req.body.email + "';",
    function (data, err) {
      console.log(data);
      if (data.length > 0) {
        db.executeSql(
          "select * from admin where email='" +
          req.body.email +
          "' and password='" +
          encPassword +
          "';",
          function (data1, err) {
            console.log(data1);
            if (data1.length > 0) {
              module.exports.user1 = {
                username: data1[0].email,
                password: data1[0].password,
              };
              let token = jwt.sign(
                { username: data1[0].email, password: data1[0].password },
                secret,
                {
                  expiresIn: "1h", // expires in 24 hours
                }
              );
              console.log("token=", token);
              data[0].token = token;

              res.cookie("auth", token);
              res.json(data);
            } else {
              return res.json(2);
            }
          }
        );
      } else {
        return res.json(1);
      }
    }
  );
});
router.post("/removeLastInsertedOTP", midway.checkToken, (req, res, next) => {
  console.log(req.body);
  db.executeSql(
    "Delete from otp where email='" + req.body.email + "'",
    function (data, err) {
      if (err) {
        console.log(err);
      } else {
        return res.json(data);
      }
    }
  );
});

router.post("/UpdateLogoutDetails", (req, res, next) => {
  console.log(req.body);
  db.executeSql(
    "UPDATE users SET status=false,out_time=CURRENT_TIMESTAMP WHERE userid=" +
    req.body.userid,
    function (msg, err) {
      if (err) {
        console.log("Error in store.js", err);
      } else {
        db.executeSql(
          "INSERT INTO `logintime`(`userid`, `login_minute`, `login_date`)VALUES(" +
          req.body.userid +
          "," +
          req.body.loginMinute +
          ",CURRENT_TIMESTAMP);",
          function (data, err) {
            if (err) {
              console.log("Error in store.js", err);
            } else {
              return res.json("Success");
            }
          }
        );
      }
    }
  );
});

router.post("/SaveGeneralSalonDetails", midway.checkToken, (req, res, next) => {
  console.log(req.body, "genral details")
  db.executeSql("UPDATE `general` SET vipdiscount=" + req.body.vipdiscount + ",maxdiscount=" + req.body.maxdiscount + ",emppointsconvert=" + req.body.emppointsconvert + ",custpointsconvert=" + req.body.custpointsconvert + ",currency='" + req.body.currency + "',updateddate=CURRENT_TIMESTAMP WHERE id=" + req.body.id + ";", function (data, err) {
    if (err) {
      console.log(err);
      res.json("error");
    } else {
      return res.json(data);
    }
  });
});

router.get("/GetAllGeneralSalonData/:id", midway.checkToken, (req, res, next) => {
  db.executeSql("SELECT * FROM `general` where salonid=" + req.params.id + ";", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  }
  );
});

router.get("/GetUserDataById/:id", midway.checkToken, (req, res, next) => {
  db.executeSql("SELECT * FROM `users` where userid=" + req.params.id + ";", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  });
});

router.get("/GetCustomerServices", midway.checkToken, (req, res, next) => {
  db.executeSql("SELECT servicesid,servicesname, COUNT(*) AS service_count FROM `custservices` GROUP BY servicesid ORDER BY service_count DESC LIMIT 5", function (data, err) {
    if (err) {
      console.log(err);
    } else {
      return res.json(data);
    }
  });
});

router.post("/SaveBulkServiceDetails", (req, res, next) => {
  for (let i = 0; i < req.body.length; i++) {
    db.executeSql("INSERT INTO `serviceslist`(`salonid`,`name`,`price`, `totalcost`, `time`, `point`, `isactive`,`createdate`,`epoint`) VALUES (" + req.body[i].salonid + ",'" + req.body[i].name + "','" + req.body[i].price + "','" + req.body[i].totalcost + "','" + req.body[i].time + "','" + req.body[i].point + "',true,CURRENT_TIMESTAMP,'" + req.body[i].epoint + "')", function (data, err) {
      if (err) {
        res.json("error");
        console.log(err)
      } else {
        if (i == req.body.length - 1) {
          return res.json('success');

        }
      }
    });
  }
  // console.log(data);
});

function generateUUID() {
  var d = new Date().getTime();
  var uuid = "xxxxxxxx-xxxx-4xxx-yxxx".replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
  });

  return uuid;
}

module.exports = router;
