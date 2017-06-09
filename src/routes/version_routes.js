/*
* Author: digitkhrisnaa
*/
var version = require ("../controller/version_controller");

module.exports = function(app) {
    app.get('/api/v1/version', version.list);
    app.get('/api/v1/version/get', version.listSpesific);
    app.post('/api/v1/version', version.insert);
    app.post('/api/v1/version/invite', version.invite)
    app.put('/api/v1/version', version.update);
}
