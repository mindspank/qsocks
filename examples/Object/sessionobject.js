const qsocks = require('qsocks');

/**
 * Creating a Generic Object that only is available during the session.
 * The Generic Object will have a HyperCube definition and a ValueExpression definition.
 */

qsocks.Connect({
    host: 'branch.qlik.com',
    prefix: 'anon',
    isSecure: true
})
.then(function(global) {
    return global.openDoc('3f3a866b-238f-4d1a-8aeb-81e97756af7a')
})
.then(function(app) {
    
    // Create a Generic Session Object
    app.createSessionObject({   
        qInfo: {
            qType: 'mycubiecube' // We can assign it a arbitrary type
        },
        // A HyperCube Structure
        // Docs: http://help.qlik.com/en-US/sense-developer/2.2/Subsystems/EngineAPI/Content/GenericObject/PropertyLevel/HyperCubeDef.htm
        qHyperCubeDef: {
            qDimensions: [{
                qDef: {
                    qFieldDefs: ['Brewery']
                }
            }],
            qMeasures: [{
                qDef: {
                    qLabel: 'Number of Beers',
                    qDef: '=Count(Beer)'
                }
            }],
            qInitialDataFetch: [{
                qWidth: 2,
                qHeight: 4000,
                qTop: 0,
                qLeft: 0
            }]
        },
        // Independent calculation using a ValueExpression
        // Docs: http://help.qlik.com/en-US/sense-developer/2.2/Subsystems/EngineAPI/Content/GenericObject/PropertyLevel/ValueExpression.htm
        total: {
            qValueExpression: { qExpr: "=Count(DISTINCT Brewery)" }
        },
        myfulldynamicproperty: {
            thiscanbeanything: 'My Own Value, hurrah!'
        }
        
    }).then(function(cube) {
        
        // We have created a generic object, see docs for the full list of available methods
        // Docs: http://help.qlik.com/en-US/sense-developer/2.2/Subsystems/EngineAPI/Content/Classes/GenericObjectClass/GenericObject-class.htm
        
        // Evaluate the generic object properties and expand them into a layout.
        cube.getLayout().then(function(layout) {
            
            // Hypercube
            console.log(layout.qHyperCube);
            // Total calculation
            console.log(layout.total)
            // My full dynamic property
            console.log(layout.myfulldynamicproperty)
             
        })
    })
    .catch(function(err) { console.log(err) })
    
});