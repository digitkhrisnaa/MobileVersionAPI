var MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    ObjectID = require('mongodb').ObjectID;
var config = require(".././util/config");

module.exports.list = function(req, res) {
  if (req.query.identifier == null || req.query.identifier == "") {
      return jsonResponse(res, config.HttpResponseStatus.BadRequest, "identifier must be declared", null)
  }

  MongoClient.connect(config.db, function(err, db) {
    db.collection(config.user).findOne({"app_identifier" : req.query.identifier}, function(error, user) {
      if (error != null) {
        throw error
        db.close()
        return jsonResponse(res, config.HttpResponseStatus.InternalServerError, "an error occurer", null)
      }

      if (user == null) {
        db.close()
        return jsonResponse(res, config.HttpResponseStatus.BadRequest, "identifier is not valid", null)
      }

      var searchKey = {}

      if (user.is_admin) {
        searchKey["credential"] = "admin"
      } else {
        searchKey["credential"] = user._id
      }

      db.collection(config.collection).find(searchKey, {"credential" : 0}).toArray(function(err, result){
        if (err != null) {
          throw err;
          db.close();
          return jsonResponse(res, config.HttpResponseStatus.InternalServerError, "an error occured when query", null)
        }

        db.close();

        if (result.length == 0) {
          return jsonResponse(res, config.HttpResponseStatus.SuccessNoContent, "No data", null)
        }

        return jsonResponse(res, config.HttpResponseStatus.Success, "Fetch data success", { result })
      })
    })
  })
}

module.exports.insert = function(req, res) {
  if (req.body == null) {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "Bad request", null)
  }

  if (req.body.user_id == null) {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "User ID must be declared", null)
  }

  var objectString = req.body.user_id
  if (!ObjectID.isValid(objectString)) {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "Not valid user ID", null)
  }
  var objectID = new ObjectID(objectString)

  if (req.body.app_name == null) {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "app name must be declared", null)
  }

  if (req.body.app_description == null) {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "description must be declared", null)
  }

  if (req.body.android_ver == null || req.body.android_force == null || req.body.android_link == null) {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "Android properties must be declared", null)
  }

  if (req.body.ios_ver == null || req.body.ios_force == null || req.body.ios_link == null) {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "iOS properties must be declared", null)
  }

  var verData = {
    "app_name" : req.body.app_name,
    "app_description" : req.body.app_description,
    "data" : {
      "android" : {
        "version" : req.body.android_ver,
        "force_update" : (req.body.android_force == 'true'),
        "link_update" : req.body.android_link
      },
      "ios" : {
        "version" : req.body.ios_ver,
        "force_update" : (req.body.ios_force == 'true'),
        "link_update" : req.body.ios_link
      }
    },
    "credential" : ["admin", objectID],
    "meta" : {
      "user_last_updated" : objectID,
      "time_created" : new Date(),
      "last_updated" : new Date(),
    }
  }

  MongoClient.connect(config.db, function(err, db) {
    db.collection(config.user).findOne({"_id" : objectID}, function(error, user) {
      if (error != null) {
        throw error
        db.close()
        return jsonResponse(res, config.HttpResponseStatus.InternalServerError, "an error occurer", null)
      }

      if (user == null) {
        db.close()
        return jsonResponse(res, config.HttpResponseStatus.BadRequest, "User not found", null)
      }

      db.collection(config.collection).insertOne(verData, function(err, result){
        if (err != null) {
          throw err;
          db.close();
          return jsonResponse(res, config.HttpResponseStatus.InternalServerError, "an error occured", null)
        }

        db.close();

        return jsonResponse(res, config.HttpResponseStatus.Success, "Success insert data", null)
      })
    })
  })
}

module.exports.update = function(req, res) {
  if (req.body.app_id == null) {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "App Id must be declared", null)
  }

  if (req.body.user_id == null) {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "User ID must be declared", null)
  }

  var objString = (req.body.app_id).toString()
  var userIDString = (req.body.user_id).toString()

  if (!ObjectID.isValid(objString)) {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "Not valid app ID", null)
  }

  if (!ObjectID.isValid(userIDString)) {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "Not valid user ID", null)
  }

  var objectID = new ObjectID(objString)
  var userObjectID = new ObjectID(userIDString)
  var objectUpdate = {}

  if (req.body.app_name != null) {
    objectUpdate["app_name"] = req.body.app_name
  }

  if (req.body.app_description != null) {
    objectUpdate["app_description"] = req.body.app_description
  }

  if (req.body.android_ver != null) {
    objectUpdate["data.android.version"] = req.body.android_ver
  }

  if (req.body.android_force != null) {
    var isForce = (req.body.android_force == 'true')
    objectUpdate["data.android.force_update"] = isForce
  }

  if (req.body.android_link != null) {
    objectUpdate["data.android.link_update"] = req.body.android_link
  }

  if (req.body.ios_ver != null) {
    objectUpdate["data.ios.version"] = req.body.ios_ver
  }

  if (req.body.ios_force != null) {
    var isForce = (req.body.ios_force == 'true')
    objectUpdate["data.ios.force_update"] = isForce
  }

  if (req.body.ios_link != null) {
    objectUpdate["data.ios.link_update"] = req.body.ios_link
  }

  objectUpdate["meta.user_last_updated"] = userObjectID
  objectUpdate["meta.last_updated"] = new Date()

  MongoClient.connect(config.db, function(err, db) {
    db.collection(config.user).findOne({"_id" : userObjectID}, function(error, user) {
      if (error != null) {
        throw error
        db.close()
        return jsonResponse(res, config.HttpResponseStatus.InternalServerError, "an error occurer", null)
      }

      if (user == null) {
        db.close()
        return jsonResponse(res, config.HttpResponseStatus.BadRequest, "User not found", null)
      }

      db.collection(config.collection).updateOne({"_id" : objectID}, {$set : objectUpdate}, function(err, result){
        if (err != null) {
          throw err
          db.close()
          return jsonResponse(res, config.HttpResponseStatus.InternalServerError, "An error occured", null)
        }

        db.close()
        if (result.result.n == 0) {
          return jsonResponse(res, config.HttpResponseStatus.BadRequest, "User is not found", null)
        } else if (result.result.nModified == 0) {
          return jsonResponse(res, config.HttpResponseStatus.SuccessNoContent, "Success with no modified data", null)
        } else {
          return jsonResponse(res, config.HttpResponseStatus.Success, "Success update data", result)
        }
      })
    })
  })
}

module.exports.listSpesific = function(req, res) {
  if (req.query.appid == null || req.query.appid == "") {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "App Id must be declared", null)
  }

  if (req.query.identifier == null || req.query.identifier == "") {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "Key identifier must be declared", null)
  }

  var objString = (req.query.appid).toString()

  if (!ObjectID.isValid(objString)) {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "Not valid app ID", null)
  }

  var objectID = new ObjectID(objString)

  MongoClient.connect(config.db, function(err, db) {
    db.collection(config.user).findOne({"app_identifier" : req.query.identifier}, function(error, user) {
      if (error != null) {
        throw error
        db.close()
        return jsonResponse(res, config.HttpResponseStatus.InternalServerError, "an error occurer", null)
      }

      if (user == null) {
        db.close()
        return jsonResponse(res, config.HttpResponseStatus.BadRequest, "identifier is not valid", null)
      }

      var searchKey = {"_id" : objectID}

      if (user.is_admin) {
        searchKey["credential"] = "admin"
      } else {
        searchKey["credential"] = user._id
      }

      db.collection(config.collection).find(searchKey, {"credential" : 0}).toArray(function(err, result){
        if (err != null) {
          throw err;
          db.close();
          return jsonResponse(res, config.HttpResponseStatus.InternalServerError, "an error occured when query", null)
        }

        db.close();

        if (result == null || result.length == 0) {
          return jsonResponse(res, config.HttpResponseStatus.SuccessNoContent, "No data", null)
        }

        return jsonResponse(res, config.HttpResponseStatus.Success, "Fetch data success", result)
      })
    })
  })
}

module.exports.invite = function(req, res) {
  if (req.body.app_id == null || req.body.app_id == "") {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "App id must be declared", null)
  }

  if (req.body.user_invited_email == null || req.body.user_invited_email == "") {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "User invited email must be declared", null)
  }

  if (req.body.user_id == null || req.body.user_id == "") {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "User id must be declared", null)
  }

  if (!ObjectID.isValid(req.body.app_id)) {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "App ID is not valid object", null)
  }

  if (!ObjectID.isValid(req.body.user_id)) {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "User ID is not valid object", null)
  }

  var appObjectID = new ObjectID(req.body.app_id)
  var userObjectID = new ObjectID(req.body.user_id)

  MongoClient.connect(config.db, function(err, db ) {
    db.collection(config.user).findOne({"_id" : userObjectID}, function(userErr, user) {
      if (userErr != null) {
        db.close()
        return jsonResponse(res, config.HttpResponseStatus.InternalServerError, "an error was occured", null)
      }

      if (user == null) {
        db.close()
        return jsonResponse(res, config.HttpResponseStatus.BadRequest, "User ID not found", null)
      }

      if (!user.is_admin) {
        db.close()
        return jsonResponse(res, config.HttpResponseStatus.BadRequest, "You dont have access", null)
      }

      db.collection(config.user).findOne({"email" : req.body.user_invited_email}, function(invitedErr, invitedUser) {
        if (invitedErr != null) {
          db.close()
          return jsonResponse(res, config.HttpResponseStatus.InternalServerError, "an error was occured", null)
        }

        if (invitedUser == null) {
          db.close()
          return jsonResponse(res, config.HttpResponseStatus.BadRequest, "Invited email not found", null)
        }

        db.collection(config.collection).findOne({"_id" : appObjectID}, function(appErr, appData) {
          if (appErr != null) {
            db.close()
            return jsonResponse(res, config.HttpResponseStatus.InternalServerError, "an error was occured", null)
          }

          if (appData == null) {
            db.close()
            return jsonResponse(res, config.HttpResponseStatus.BadRequest, "App ID not found", null)
          }

          var searchKey = {}
          var credential = appData.credential
          credential.push(invitedUser._id)
          searchKey["credential"] = credential
          searchKey["meta.user_last_updated"] = user._id
          searchKey["meta.last_updated"] = new Date()

          db.collection(config.collection).updateOne({"_id" : appObjectID}, {$set : searchKey},
            function(updateErr, updateRes) {
            if (updateErr != null) {
              db.close()
              return jsonResponse(res, config.HttpResponseStatus.InternalServerError, "an error was occured", null)
            }

            db.close()
            return jsonResponse(res, config.HttpResponseStatus.Success, "Success invite user", updateRes)
          })
        })
      })
    })
  })
}

function jsonResponse(response, status, message, metadata) {
  return response.json({
    status: status,
    message: message,
    metadata: metadata
  })
}
