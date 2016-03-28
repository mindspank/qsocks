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
                qFieldDefs: ['[Case Owner]']
            },
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

    });
})
.catch(function(err) {
    console.log('err', err)
});