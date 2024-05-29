router.post("/SaveAcceptUserOrder", midway.checkToken, (req, res, next) => {
  db.executeSql("UPDATE `orderlist` SET isactive=false,updateddate=CURRENT_TIMESTAMP WHERE id = " + req.body.id + "", function (data, err) {
    if (err) {
      console.log("Error in store.js", err);
    } else {
      return res.json(data);
    }
  });
});

router.post("/SaveBookingDetails", midway.checkToken, (req, res, next) => {
  console.log(req.body, 'save Booking');
  db.executeSql("INSERT INTO `appointment`(`custid`, `bookingdate`, `bookingtime`, `totalprice`, `totalpoint`, `totaltime`, `ispayment`, `isactive`, `createddate`)VALUES(" + req.body.custid + ",'" + req.body.bookingDate + "','" + req.body.timeSlot + "','" + req.body.totalprice + "','" + req.body.totalpoint + "','" + req.body.totaltime + "',false," + req.body.isactive + ",CURRENT_TIMESTAMP);", function (data, err) {
    if (err) {
      console.log(err);
      res.status(500).json({ error: "Failed to save booking details" });
    } else {
      let completedServices = 0;
      for (let i = 0; i < req.body.selectedService.length; i++) {
        if (req.body.selectedService[i].servicetype === 'Regular') {
          handleRegularService(req.body, data.insertId, i, checkCompletion);
        } else if (req.body.selectedService[i].servicetype === 'Combo') {
          handleComboService(req.body, data.insertId, i, checkCompletion);
        } else if (req.body.selectedService[i].servicetype === 'Membership') {
          handleMembershipService(req.body, data.insertId, i, checkCompletion);
        }
      }
      function checkCompletion() {
        completedServices++;
        if (completedServices === req.body.selectedService.length) {
          handlePointAndHistory(req.body);
          res.json({ message: "Booking details saved successfully" });
        }
      }
    }
  });
});


function handleRegularService(body, appointmentId, index, callback) {
  db.executeSql("INSERT INTO `custservices`(`servicetype`, `servicesid`, `servicesname`, `custid`, `appointmentid`, `employeename`, `empid`) VALUES('" + body.selectedService[index].servicetype + "'," + body.selectedService[index].selectedServid + ",'" + body.selectedService[index].servicesname + "'," + body.custid + "," + appointmentId + ",'" + body.selectedService[index].employeename + "'," + body.selectedService[index].selectedEmpid + ");", function (servdata, err) {
    if (err) {
      console.log(err);
    } else {
      callback();
    }
  });
}

const processedComboIds = {};
function handleComboService(body, appointmentId, index, callback) {
  db.executeSql("INSERT INTO `custservices`(`servicetype`, `servicesid`, `servicesname`, `custid`, `appointmentid`, `employeename`, `empid`, `comboid`) VALUES('" + body.selectedService[index].servicetype + "'," + body.selectedService[index].selectedServid + ",'" + body.selectedService[index].servicesname + "'," + body.custid + "," + appointmentId + ",'" + body.selectedService[index].employeename + "'," + body.selectedService[index].selectedEmpid + "," + body.selectedService[index].comboId + ");", function (servdata, err) {
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
  db.executeSql("INSERT INTO `custservices`(`servicetype`, `servicesid`, `servicesname`, `custid`, `appointmentid`, `employeename`, `empid`) VALUES('" + body.selectedService[index].servicetype + "'," + body.selectedService[index].selectedServid + ",'" + body.selectedService[index].servicesname + "'," + body.custid + "," + appointmentId + ",'" + body.selectedService[index].employeename + "'," + body.selectedService[index].selectedEmpid + ");", function (servdata, err) {
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
                db.executeSql("INSERT INTO `membershiphistory`(`custid`, `memid`, `servid`, `usedquantity`, `remainingquantity`, `useddate`, `createddate`) VALUES(" + body.custid + "," + body.selectedService[index].memid + "," + body.selectedService[index].selectedServid + ",1," + (remainingquantity - 1) + ",CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);", function (historyData, historyErr) {
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
function handlePointAndHistory(body) {
  if (body.tCustPoint == 0) {
    db.executeSql("INSERT INTO `point`( `custid`, `totalcustpoint`)VALUES(" + body.custid + "," + body.totalpoint + ");", function (pointdata, err) {
      if (err) {
        console.log(err);
      } else {
      }
    });
  } else {
    if (body.lessPoints != null) {
      db.executeSql("UPDATE `point` SET totalcustpoint=" + body.lessPoints + " WHERE custid=" + body.custid + ";", function (updatepointdata, err) {
        if (err) {
          console.log(err);
        } else {
          db.executeSql("INSERT INTO `pointhistory`(`custid`, `redeempoint`, `totalpoint`, `redeemdate`) VALUES(" + body.custid + "," + body.redeempoints + "," + body.tCustPoint + ",CURRENT_TIMESTAMP);", function (historydata, err) {
            if (err) {
              console.log(err);
            } else {
            }
          });
        }
      });
    }
  }
}
router.post("/SavePurchaseServiceList", midway.checkToken, (req, res, next) => {
  db.executeSql(
    "UPDATE `customer` SET ismembership=true WHERE id=" + req.body.cid + "", function (data, err) {
      if (err) {
        console.log(err);
      } else {
        for (let i = 0; i < req.body.services.length; i++) {
          db.executeSql(
            "INSERT INTO `purchasedmembership`(`cid`, `memid`, `serid`, `sname`, `quntity`, `remainingquantity`, `tprice`, `discount`, `dprice`, `isactive`, `createddate`)VALUES(" + req.body.cid + "," + req.body.memid + "," + req.body.services[i].serviceid + ",'" + req.body.services[i].servicesname + "'," + req.body.services[i].quantity + "," + req.body.services[i].quantity + "," + req.body.tprice + "," + req.body.discount + "," + req.body.dprice + "," + req.body.isactive + ",CURRENT_TIMESTAMP);", function (data1, err) {
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
