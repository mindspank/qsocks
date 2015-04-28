// Create a list object for the duration of the session.
// Sort the list by a expression.


//Your server you want to connect to.
var config = {
  host: 'sense-demo.qlik.com',
  isSecure: true
}

qsocks.Connect(config).then(function(global) {

  //Open document Sales Discovery
  global.openDoc('9a2471a4-3fab-48bb-9b39-d55e47ca2471').then(function(app) {

    //Define our listbox definition.
    //Optional parameters has been omitted
    //Refer to documentation for a full list of properties
    //https://help.qlik.com/sense/en-us/developer/Subsystems/EngineAPI/Content/GenericObject/PropertyLevel/ListObjectDef.htm
    var obj = {
      "qInfo": {
        "qId": "LB01",
        "qType": "ListObject"
      },
      "qListObjectDef": {
        "qDef": {
          "qFieldDefs": [
            "Month"
          ],
          "qFieldLabels": [
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
    };

    //Create the listbox as a session object which will persist over the session and then be deleted.
    app.createSessionObject(obj).then(function(list) {

      //List has been created and handle returned.
      //Get the layout of the listobject.
      list.getLayout().then(function(layout) {
        //Layout, model and data is retured.
        console.log(layout)
      })
    })

  })

});