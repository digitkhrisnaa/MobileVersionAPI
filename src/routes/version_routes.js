/*
* Author: digitkhrisnaa
*/
var version = require ("../controller/version_controller");

module.exports = function(app) {
    app.get('/appmanager/api/v1/version', version.list);
    app.get('/appmanager/api/v1/version/get', version.listSpesific);
    app.post('/appmanager/api/v1/version', version.insert);
    app.post('/appmanager/api/v1/version/invite', version.invite)
    app.put('/appmanager/api/v1/version', version.update);
}
