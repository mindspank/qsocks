/**
 * This example demonstrates how to connect to the same engine session
 * Qlik Sense Desktop is using and reload an app.
 * 
 * By sharing the same engine session the Desktop client will pick up the same changes.
 * The Engine Session is a combinatation of the ws:// connection and the user name.
 */


const qsocks = require('qsocks');

var global = qsocks.Connect()

global
.then(global => {   
    return global.getDefaultAppFolder(); // => C:\\Users\\<username>\\Qlik\\Sense\\Apps
})
// Desktop URL encodes it's paths
.then(folder => encodeURIComponent(folder + '\\') )
.then(folder => {

    /**
     * Connects to the same ws:// path as Qlik Sense Desktop.
     * If your appname contains spaces or funky characther, encode those.
     */
    return qsocks.Connect({appname: folder + 'Ctrl00.qvf'})
        .then(global => {
            // No need to url encode here
            return global.openDoc('Ctrl00.qvf').then(app => app, err => {
                // Can't open more than 1 doc per engine session. 
                // Check for error and call getActiveDoc if app already is opened in desktop.
                if( err.code === 1002 ) return global.getActiveDoc();
            })
        })
        .then(app => {
            return app.doReload()
            .then(() => app.doSave())
            .then(() => app);
        })
        // Clean up
        .then(app => app.connection.close())

})
.then(() => {
    // Clean up
    return global.then(g => g.connection.close())
 }).catch(err => console.log(err))