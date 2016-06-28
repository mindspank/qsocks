/**
 * This demonstrates how to create a Qlik Sense application and a data connection.
 * 
 * This sample assumes a Desktop installation but the logic is the same
 * for a Qlik Sense Server installation.
 */

const qsocks = require('qsocks');
const applicationName = 'My Application';

qsocks.Connect( {appname: applicationName} )
.then( global => {

    // Access to the global class
    // http://help.qlik.com/en-US/sense-developer/2.2/Subsystems/EngineAPI/Content/Classes/GlobalClass/Global-class.htm

    return global.createApp( applicationName )
        .then( () => global.openDoc( applicationName ) )
        .then( app => {

        // Access to the app class
        // http://help.qlik.com/en-US/sense-developer/2.2/Subsystems/EngineAPI/Content/Classes/AppClass/App-class.htm

        // Create a data connection and save the app.
        // http://help.qlik.com/en-US/sense-developer/2.2/Subsystems/EngineAPI/Content/Classes/AppClass/App-class-CreateConnection-method.htm
        return app.createConnection({
            qType: 'internet',
            qName: 'MyWebConnection',
            qConnectionString: 'https://en.wikipedia.org/wiki/List_of_countries_by_GDP_(nominal)'
        }).then(() => {
            return app.doSave();
        })

    })
    .then(() => {
        // Close our connection.
        return global.connection.close();
    })
    .catch( err => {
        // Failed to create app. In Desktop application names are unique.
        console.log( err )
    })

})
.then(() => {
    console.log('Done!')
})
