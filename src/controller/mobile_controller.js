var MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    ObjectID = require('mongodb').ObjectID;
var config = require(".././util/config");
var version = require(".././util/version")

module.exports.mobileVersionStatus = function(req, res) {
  if (req.query.app_id == null || req.query.app_id == "") {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "App id must be declared", null)
  }

  if (req.query.app_version == null || req.query.app_version == "") {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "Current app version must be declared", null)
  }

  if (req.query.app_platform == null || req.query.app_platform == "") {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "App Platform must be declared", null)
  }

  if (!ObjectID.isValid(req.query.app_id)) {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "App ID Object is not valid", null)
  }

  var objectID = new ObjectID(req.query.app_id)


  MongoClient.connect(config.db, function(err, db) {
    db.collection(config.collection).findOne({"_id" : objectID}, function (err, data) {
      if (err != null) {
        throw err
        db.close()
        return jsonResponse(res, config.HttpResponseStatus.InternalServerError, "an error occured", null)
      }

      if (data == null) {
        db.close()
        return jsonResponse(res, config.HttpResponseStatus.BadRequest, "App ID not found", null)
      }

      db.close()

      if (req.query.app_platform == "android") {
        if (version(req.query.app_version, data.data.android.version) < 0) {
          var log = data.data.android.log
          var startIndex = arrayObjectIndexOf(log, req.query.app_version, "version")

          if (startIndex < 0) {
            return jsonResponse(res, config.HttpResponseStatus.BadRequest, "Your version is not registered", null)
          }

          for (var i = startIndex; i < log.length; i++) {
            if (log[i].force_update) {
              return jsonResponse(res, config.HttpResponseStatus.Success, "Success", {
                "version" : data.data.android.version,
                "force_update" : log[i].force_update,
                "link_update" : data.data.android.link_update
              })
            }
          }
          return jsonResponse(res, config.HttpResponseStatus.Success, "Success", {
              "version" : data.data.android.version,
              "force_update" : data.data.android.force_update,
              "link_update" : data.data.android.link_update
          })
        } else if (version(req.query.app_version, data.data.android.version) == 0){
          return jsonResponse(res, config.HttpResponseStatus.SuccessNoContent, "Your version is newer version", null)
        } else {
          return jsonResponse(res, config.HttpResponseStatus.BadRequest, "Your version is not registered", null)
        }
      } else if (req.query.app_platform == "ios") {
        if (version(req.query.app_version, data.data.ios.version) < 0) {
          var log = data.data.ios.log
          var startIndex = arrayObjectIndexOf(log, req.query.app_version, "version")

          if (startIndex < 0) {
            return jsonResponse(res, config.HttpResponseStatus.BadRequest, "Your version is not registered", null)
          }

          for (var i = startIndex; i < log.length; i++) {
            if (log[i].force_update) {
              return jsonResponse(res, config.HttpResponseStatus.Success, "Success", {
                "version" : data.data.ios.version,
                "force_update" : log[i].force_update,
                "link_update" : data.data.ios.link_update
              })
            }
          }
          return jsonResponse(res, config.HttpResponseStatus.Success, "Success", {
              "version" : data.data.ios.version,
              "force_update" : data.data.ios.force_update,
              "link_update" : data.data.ios.link_update
          })
        } else if (version(req.query.app_version, data.data.ios.version) == 0){
          return jsonResponse(res, config.HttpResponseStatus.SuccessNoContent, "Your version is newer", null)
        } else {
          return jsonResponse(res, config.HttpResponseStatus.BadRequest, "Your version is not registered", null)
        }
      } else {
        return jsonResponse(res, config.HttpResponseStatus.BadRequest, "Cannot find app platform", null)
      }
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

function arrayObjectIndexOf(myArray, searchTerm, property) {
    for(var i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
}
