/*
* Author: digitkhrisnaa
*/
var user = require ("../controller/user_controller");

module.exports = function(app){
    app.post('/appmanager/api/v1/user/register', user.insert);
    app.post('/appmanager/api/v1/user/login', user.login)
}
