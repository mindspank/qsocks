var qsocks = require('qsocks');

// ConnectOpenApp requires a appname property.
// Returns an array of [globalhandle, apphandle]
var connection = qsocks.ConnectOpenApp({
    host: 'localhost',
    isSecure: true,
    rejectUnauthorized: false, // <- Don't reject self-signed certificates
    appname: '7c876a9a-d62d-49ea-b21c-aaccda76c067',
    debug: true // <- Will log all websocket traffic to console DO NOT USE IN PRODUCTION
});

connection.then(function(q) {
    // Create a session object with a qListObjectDef
    q[1].createSessionObject({
        qInfo: {
            qId: '',
            qType: 'list'
        },
        qListObjectDef: {
            qDef: {
                qFieldDefs: ['[Case Owner]'] // Since our field name contains a space, wrap it in brackets.
            },
            // This is the size of the data page we want to fetch on getLayout execution.
            qInitialDataFetch: [{
                qWidth: 1,
                qHeight: 1000,
                qLeft: 0,
                qTop: 0
            }]
        }
    })
    .then(function(model) {
        
        model.getLayout().then(function(layout) {
            console.log(layout)
        });
        
        // When the server notifies us that there has been a change to the model on the server
        // Run the getlayout / getlistobjectdata cycle again.
        model.on('change', function() {
            model.getLayout().then(function(layout) {
                console.log(layout)
            })
        });
        
    });
    
    // Fetch a field
    q[1].getField('[Case Owner Group]').then(function(field) {
        // If field changes on server 
        field.on('change', function() {
            console.log('Field change')
        });
        
        // Issue a selection on the field handle.
        field.select('Systems').then(console.log, console.log);
        
        /**
         * All qsocks classes inherits from Nodes eventemitter https://nodejs.org/api/events.html
         * This means that you can create your own event streams through by having emit/on/once available on all classes
         */

    });
})
.catch(function(err) {
    console.log('err', err)
});