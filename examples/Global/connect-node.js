var qsocks = require('qsocks');

var config = {
  host: 'sense-demo.qlik.com',
  origin: 'http://localhost', // Pass a origin that has a corresponding record in the virtual proxy whitelist
  isSecure: true
};

//Connect to a server using the config object.
//Connecting without a config object automatically assumes a instance of Qlik Sense Desktop

//When connected we are returned with a handle that represents the Global class.
qsocks.Connect(config).then(function(global) {

  //We can now interact with the global class, for example fetch the document list.
  //qsocks mimics the Engine API, refer to the Engine API documentation for available methods.
  global.getDocList().then(function(docList) {

    docList.forEach(function(doc) {
      console.log(doc)
    });

  });

});