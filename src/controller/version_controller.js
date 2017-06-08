var MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    ObjectID = require('mongodb').ObjectID;
var config = require(".././util/config");

module.exports.list = function(req, res) {
  MongoClient.connect(config.db, function(err, db) {
    db.collection(config.collection).find().toArray(function(err, result){
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
    });
  });
}

module.exports.insert = function(req, res) {
  if (req.body == null) {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "Bad request", null)
  }

  if (req.body.app_name == null) {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "app name must be declared", null)
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
        "force_update" : req.body.android_force,
        "link_update" : req.body.android_link
      },
      "ios" : {
        "version" : req.body.ios_ver,
        "force_update" : req.body.ios_force,
        "link_update" : req.body.ios_link
      }
    }
  }

  MongoClient.connect(config.db, function(err, db) {
    db.collection(config.collection).insertOne(verData, function(err, result){
      if (err != null) {
        throw err;
        db.close();
        return jsonResponse(res, config.HttpResponseStatus.InternalServerError, "an error occured", null)
      }

      db.close();

      return jsonResponse(res, config.HttpResponseStatus.Success, "Success insert data", null)
    });
  });
}

module.exports.update = function(req, res) {
  if (req.body.app_id == null) {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "App Id must be declared", null)
  }

  var objString = (req.body.app_id).toString()

  if (!ObjectID.isValid(objString)) {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "Not valid app ID", null)
  }

  var objectID = new ObjectID(objString)
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

  MongoClient.connect(config.db, function(err, db) {
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
}

module.exports.listSpesific = function(req, res) {
  if(req.query.appid == "") {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "App Id must be declared", null)
  }

  var objString = (req.query.appid).toString()

  if (!ObjectID.isValid(objString)) {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "Not valid app ID", null)
  }

  var objectID = new ObjectID(objString)
  MongoClient.connect(config.db, function(err, db) {
    db.collection(config.collection).find({"_id" : objectID}).toArray(function(err, result){
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
    });
  });
}

function jsonResponse(response, status, message, metadata) {
  return response.json({
    status: status,
    message: message,
    metadata: metadata
  })
}
