/**
 * This example shows you how to connect to a Qlik Server, fetch a existing object and export the data to csv.
 * NOTE: Currently anonymous users are allowed to export data but not fetch the exported file.
 */

const qsocks = require('qsocks');
const fs = require('fs');

/**
 * Authenticating using the service certificates from Qlik Sense directly against the QIX Engine
 * Read certificates - Assuming certificates are in the working directory
 * */
const client = fs.readFileSync('client.pem');
const client_key = fs.readFileSync('client_key.pem');

qsocks.Connect({
    host: 'myserver',
    port: 4747, //Default Engine port
    isSecure: true,
    appname: 'MyCoolApp'
})
.then(function(global) {
    // Access to global class
    // Docs: http://help.qlik.com/en-US/sense-developer/2.2/Subsystems/EngineAPI/Content/Classes/GlobalClass/Global-class.htm
    return global.openDoc('MyCoolApp');
})
.then(function(app) {
    // Access to app class
    // Docs: http://help.qlik.com/en-US/sense-developer/2.2/Subsystems/EngineAPI/Content/Classes/AppClass/App-class.htm
    
    
    /**
     * Access a already saved/persisted object in the app.
     * In this case it's a GenericObject that represents a Bar Chart in the self-service client.
     * Docs: http://help.qlik.com/en-US/sense-developer/2.2/Subsystems/EngineAPI/Content/Classes/GenericObjectClass/GenericObject-class.htm
     * 
     * You can also create a on-demand object using createSessionObject(GenericObjectDefinition) instead of fetching a pre-existing object.
     * 
     * For very large data volumes it's also possible to export tables during script executing, see STORE under load script syntax.
     * Docs: http://help.qlik.com/en-US/sense/2.2/Subsystems/Hub/Content/Scripting/ScriptRegularStatements/Store.htm
     */
    
    return app.getObject('MyBarChart').then(function(objectmodel) {
        // Export the data of the HyperCubeDef defined on the Generic Object.
        return objectmodel.exportData('CSV_C', '/qHyperCubeDef', 'MyOptionalFileName.csv', 'P');
    });    
})
.then(function(exportresults) {
    // File has been exported
    // HTTP GET exportresults.qUrl
    return console.log(exportresults.qUrl)
})
.catch(function(err) {
    console.log('Something went wrong: ', err);
})