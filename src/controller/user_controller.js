var MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    ObjectID = require('mongodb').ObjectID
var config = require(".././util/config")
var crypto = require('crypto')

module.exports.insert = function(req, res) {
  var userRegister = {}

  if (req.body.user_email == null) {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "email must be declared", null)
  }

  if (req.body.user_name == null) {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "name must be declared", null)
  }

  if (req.body.password == null) {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "password must be declared", null)
  }

  if (req.body.is_admin == null) {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "Status admin must be declared", null)
  }

  var userSalt = crypto.randomBytes(16).toString('hex')

  userRegister["email"] = req.body.user_email
  userRegister["name"] = req.body.user_name
  userRegister["password"] = crypto.createHash('md5').update(req.body.password).digest("hex") + userSalt
  userRegister["salt"] = userSalt
  userRegister["is_admin"] = (req.body.is_admin == 'true')
  userRegister["app_identifier"] = crypto.randomBytes(8).toString('hex')
  userRegister["time_created"] = new Date()
  userRegister["last_updated"] = new Date()

  MongoClient.connect(config.db, function(err, db) {
    db.collection(config.user).findOne({"email" : req.body.user_email}, function(error, user) {
      if (error != null) {
        throw error
        db.close()
        return jsonResponse(res, config.HttpResponseStatus.InternalServerError, "an error occured", null)
      }

      if (user != null) {
        db.close()
        return jsonResponse(res, config.HttpResponseStatus.BadRequest, "Email is already registered", null)
      }

      db.collection(config.user).insertOne(userRegister, function(err, result) {
        if (err != null) {
          throw error
          db.close()
          return jsonResponse(res, config.HttpResponseStatus.InternalServerError, "an error occured", null)
        }

        db.close()
        var resultReturn = {}
        resultReturn["user_id"] = result.ops[0]._id
        resultReturn["email"] = userRegister["email"]
        resultReturn["name"] = userRegister["name"]
        resultReturn["is_admin"] = userRegister["is_admin"]
        resultReturn["app_identifier"] = userRegister["app_identifier"]
        resultReturn["time_created"] = userRegister["time_created"]
        resultReturn["last_updated"] = userRegister["last_updated"]

        return jsonResponse(res, config.HttpResponseStatus.Success, "Success registered", resultReturn)
      })
    })
  })
}

module.exports.login = function(req, res) {
  if (req.body.user_email == null || req.body.user_email == "") {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "Email must be declared", null)
  }

  if (req.body.password == null || req.body.password == "") {
    return jsonResponse(res, config.HttpResponseStatus.BadRequest, "password must be declared", null)
  }

  MongoClient.connect(config.db, function(err, db) {
    db.collection(config.user).findOne({"email" : req.body.user_email}, function (error, user) {
      if (error != null) {
        throw error
        db.close()
        return jsonResponse(res, config.HttpResponseStatus.InternalServerError, "an error occured", null)
      }

      if (user == null) {
        db.close()
        return jsonResponse(res, config.HttpResponseStatus.BadRequest, "Wrong email or password", null)
      }

      var passwordValidation = crypto.createHash('md5').update(req.body.password).digest("hex") + user.salt

      if (passwordValidation == user.password) {
        var resultReturn = {}
        resultReturn["user_id"] = user._id
        resultReturn["email"] = user.email
        resultReturn["name"] = user.name
        resultReturn["is_admin"] = user.is_admin
        resultReturn["app_identifier"] = user.app_identifier
        resultReturn["time_created"] = user.time_created
        resultReturn["last_updated"] = user.last_updated

        return jsonResponse(res, config.HttpResponseStatus.Success, "login Success", resultReturn)
      } else {
        return jsonResponse(res, config.HttpResponseStatus.BadRequest, "Wrong email or password", null)
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
