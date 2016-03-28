// Create a Generic Object that contains multiple generic objects.

var qsocks = require('qsocks');

// Connect to Qlik Sense Desktop
qsocks.Connect().then(function(global) {
    // Open document Sales Discovery
    return global.openDoc('Sales Discovery.qvf')
}).then(function(app) {
    
    // Define our listbox definition.
    // Optional parameters has been omitted
    // Refer to documentation for a full list of properties
    // Docs: https://help.qlik.com/sense/en-us/developer/Subsystems/EngineAPI/Content/GenericObject/PropertyLevel/ListObjectDef.htm
    var obj = {
        "qInfo": {
            "qId": "CB01",
            "qType": "Combo"
        },
        "ListObject1": {
            "qListObjectDef": {
                "qDef": {
                    "qFieldDefs": [
                        "Month"
                    ],
                    "qSortCriterias": [{
                        "qSortByExpression": -1,
                        "qExpression": {
                            "qv": "=sum([Sales Amount])"
                        }
                    }]
                },
                "qInitialDataFetch": [{
                    "qTop": 0,
                    "qLeft": 0,
                    "qHeight": 100,
                    "qWidth": 2
                }],
                "qExpressions": [{
                    "qExpr": "=sum([Sales Amount])"
                }]
            }
        },
        "ListObject2": {
            "qListObjectDef": {
                "qDef": {
                    "qFieldDefs": [
                        "City"
                    ],
                    "qSortCriterias": [{
                        "qSortByAscii": -1,
                        "qExpression": {}
                    }]
                },
                "qInitialDataFetch": [{
                    "qTop": 0,
                    "qLeft": 0,
                    "qHeight": 100,
                    "qWidth": 1
                }]
            }
        }
    };

    //Create the generic object as a session object which will persist over the session and then be deleted.
    app.createSessionObject(obj).then(function(list) {

        //Object has been created and handle returned.
        //Get the layout of the object which will contain two list objects.
        list.getLayout().then(function(layout) {

            //Layout, model and data is retured.
            console.log(layout.ListObject1, layout.ListObject2)

        });

    });
    
});