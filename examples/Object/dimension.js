const qsocks = require('qsocks')

/**
 * Creating a master dimension in a Qlik Sense app.
 */

// Connecting to Qlik Sense Desktop
qsocks.Connect().then(function(global) {
	// from the global handle we can invoke methods from the global class
	return global.openDoc('Executive Dashboard.qvf')
})
.then(function(app) {
	// returns a app handle which we can invoke app methods on
	
	// Create a dimension
    // Docs: http://help.qlik.com/en-US/sense-developer/2.2/Subsystems/EngineAPI/Content/Classes/AppClass/App-class-CreateDimension-method.htm
	app.createDimension({
		qInfo: {
			qId: '', // This can be left blank if you want the engine to assign a ID for you.
			qType: 'dimension'
		},
		qDim: {
			qGrouping: 'N', // N = no grouping, H = drill-group, C = cyclic grouping
			qFieldDefs: ['ARCredit'],
			qFieldLabels: ['AR Credit Rating'],
			title: 'This is my Client title' //This is a dynamic property, engine does not care about it. Only used for the client.
		},
        // The Qlik Sense client requires full dynamic properties to display metadata around the dimension in the library
		qMetaDef: {
			title: 'This is my Client title',
			tags: ['TaggieTag'],
			description: 'This is a description that is used in the client.'
		}
	})
    .then(function(dimension) {
        // Dimension has been created. Persist our changes.		
		return app.doSave()
	})
	
})
.then(function() {
	console.log('All Done')
})