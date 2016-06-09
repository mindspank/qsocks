/**
 * This demonstrates how to create a Qlik Sense application.
 * Define a data loading script.
 * Load some data into the application
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

        // Define a load script. In this scenario we'll just autogenerate some data.
        const loadscript = `    
            Data:
            LOAD 
                Rand() * 1000 as [Sales Amount], 
                Date(Date('2015-01-01', 'YYYY-MM-DD') + recno() - 1) as DateField
            AUTOGENERATE Date('2015-12-31', 'YYYY-MM-DD') - Date('2015-01-01', 'YYYY-MM-DD') + 1;
            
            Calendar:
            DECLARE FIELD DEFINITION TAGGED '$date'
               Fields
                  Year($1) As Year Tagged ('$numeric'),
                  Month($1) as Month Tagged ('$numeric'),
                  Date($1) as Date Tagged ('$date'),
                  Weekday($1) as Weekday Tagged ('$numeric')
            ;
            
            DERIVE FIELDS FROM FIELDS DateField USING Calendar;`;

        return app.setScript(loadscript)
            .then(() => {
                // Load the data
                return app.doReload();
            })
            .then(() => {
                // Save our data. Will persist to disk.
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
