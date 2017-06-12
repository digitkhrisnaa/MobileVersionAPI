/*
* Author: digitkhrisnaa
*/
var mobile = require ("../controller/mobile_controller");

module.exports = function(app){
    app.get('/appmanager/mobile/api/v1/version', mobile.mobileVersionStatus)
}
