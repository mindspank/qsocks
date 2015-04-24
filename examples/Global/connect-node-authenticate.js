var qsocks = require('qsocks');
var fs = require('fs');
var request = require('request');

//  Set our request defaults, ignore unauthorized cert warnings as default QS certs are self-signed.
//  Export the certificates from your Qlik Sense installation and refer to them
var r = request.defaults({
  rejectUnauthorized: false,
  host: 'usrad-akl.qliktech.com',
  pfx: fs.readFileSync(__dirname + 'client.pfx')
})

//  Authenticate whatever user you want
var b = JSON.stringify({
  "UserDirectory": 'qtsel',
  "UserId": 'akl',
  "Attributes": []
});

//  Get ticket for user - refer to the QPS API documentation for more information on different authentication methods.
r.post({
  uri: 'https://usrad-akl.qliktech.com:4243/qps/ticket?xrfkey=abcdefghijklmnop',
  body: b,
  headers: {
    'x-qlik-xrfkey': 'abcdefghijklmnop',
    'content-type': 'application/json'
  }
},
function(err, res, body) {

  //  Consume ticket, set cookie response in our upgrade header against the proxy.
  var ticket = JSON.parse(body)['Ticket'];
  r.get('https://usrad-akl.qliktech.com/hub/?qlikTicket=' + ticket, function(error, response, body) {

    var cookies = response.headers['set-cookie'];

    //  qsocks config, merges into standard https/http object headers.
    //  Set the session cookie correctly.
    //  The origin specified needs an entry in the Whitelist for the virtual proxy to allow websocket communication.
    var config = {
      host: 'usrad-akl.qliktech.com',
      isSecure: true,
      origin: 'http://localhost',
      rejectUnauthorized: false,
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookies[0]
      }
    }

    //  Connect to qsocks/qix engine
    qsocks.Connect(config).then(function(global) {

      //  From the global class create a new app
      global.createApp('This is a new app', 'First Script Tab').then(function(success) {

        // App has been created - hopefully :)
        console.log(success)

      });

    })

  })

});