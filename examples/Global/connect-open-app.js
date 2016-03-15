/**
 * Connects to Qlik Sense, opens a global session and scopes the session to specificed app.
 * Returns both the global object and the app object as an array.
 * 
 * The same behaviour can be achieved with Connect() and calling openDoc() on the global object manually.
 */

const qsocks = require('qsocks');

qsocks.ConnectOpenApp({
    appname: 'Sales Discovery.qvf'
})
.then(function(connections) {
    var global = connections[0];
    var app = connections[1];
    
    // Access to the global object.
    global.getDocList().then(function(doclist) {
        console.log(doclist);
    });
    
    // Access to the app object.
    app.getAppLayout().then(function(applayout) {
        console.log(applayout);
    });
    
})
.catch(function(err) {
    // Will throw if connection failed or missing appname property.
    console.log(err);
})