const qsocks = require('qsocks');
const fs = require('fs');

/**
 * Creating a master measure in Qlik Sense Desktop
 */
qsocks.Connect().then(function(global) {
    // Open a document    
    global.openDoc('2422586d-89ba-4e68-b790-418526bb1079').then(function(app) {
        
        // Creating a measure in the master library
        // See this article for the request structure
        // http://help.qlik.com/sense/2.1/en-us/developer/Subsystems/EngineAPI/Content/Classes/AppClass/App-class-CreateMeasure-method.htm
        app.createMeasure({
            qInfo: {
                qId: '', // Leaving the ID property blank will tell the Engine to generate a unique id for us.
                qType: 'measure'
            },
            qMeasure: {
                qLabel: 'This is a measure created with the Engine API',
                qDef: '=Sum(Expression1)'
            },
            // The Qlik Sense client requires full dynamic properties to display metadata around the measure in the library
            qMetaDef: {
                title: 'This is a measure created with the Engine API',
                description: 'A description' 
            }
        })
        .then(function() {
            // Persist changes to disk.
            return app.doSave();
        });
        
    });
})
.catch(function(error) {
    console.log(error)
});