/*
* Author: digitkhrisnaa
*/

//Define constant variable here
module.exports = {
    db: process.env.MONGODB_URI || 'mongodb://localhost:27017/appver',
    collection: "appver",
    port: process.env.port || 8080,
    secret: '@VErsIOnAPpMODuLeSEcReT?172d5',
    HttpResponseStatus: {
      Success: 200,
      SuccessNoContent: 204,
      BadRequest: 400,
      UnAuthorized: 401,
      NotFound: 404,
      MethodNotAllowed: 405,
      InternalServerError: 500
    }
}
