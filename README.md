#qsocks 
####A lightweight promise wrapper around the Qlik Sense Engine API  



qsocks was born to provide a lightweight promise layer around the Engine API. Shortening the time to implemention without limiting the developer in what she or he can accomplish.

The aim of qsocks is to mimic the functionality in the Engine API bringing the capabilities to node and the browser.   
qsocks currently uses browserify to package up qsocks, ws and promises to bring consistency to the browser landscape.

##Getting Started

### Installing
```
npm install qsocks --save
```
Or just grab qsocks.bundle.js and drop it into your page and you are good to go.

### Connecting to a Qlik Sense Server in node

```js
var qsocks = require('qsocks');

var config = {
    host: 'sense-demo.qlik.com',
    isSecure: true
};
    
qsocks.Connect(config).then(function(global) {
    console.log(global);
})
```

### Connecting to a Qlik Sense Server in the browser

```js
<script src="https://rawgit.com/mindspank/qsocks/master/qsocks.bundle.js"></script>
<script>

  var config = {
    host: 'sense-demo.qlik.com',
    isSecure: true
  };

  qsocks.Connect(config).then(function(global) {
    console.log(global)
  });

</script>
<body></body>
```

### Connecting to Qlik Sense Desktop in the browser

```js
<script src="https://rawgit.com/mindspank/qsocks/master/qsocks.bundle.js"></script>
<script>
  
  // Calling Connect() without a config object automatically 
  // assumes a desktop connection, i.e localhost:4848

  qsocks.Connect().then(function(global) {
    console.log(global)
  });

</script>
<body></body>
```

###Documentation

####Config  
* `host` - (String) Hostname of server
* `appname` - (String) Scoped connection to app.
* `isSecure` - (Boolean) If true uses wss and port 443, otherwise ws and port 80
* `port` - (Integer) Port of connection, defaults 443/80
* `prefix` - (String) Virtual Proxy, defaults to '/'
* `origin` - (String) Origin of requests, node only.
* `rejectUnauthorized` - (Boolean) False will ignore unauthorized self-signed certs.
* `headers` - (Object) HTTP headers
* `ticket` - (String) Qlik Sense ticket, consumes ticket on Connect()
* `key` - (String) Client Certificate key for QIX connections
* `cert` - (String) Client certificate for QIX connections
* `ca` - (Array of String) CA root certificates for QIX connections

For more documentation on available methods refer to the [Engine API documentation](https://help.qlik.com/sense/en-us/developer/index.html#../Subsystems/EngineAPI/Content/introducing-engine-API.htm%3FTocPath%3DQlik%2520Engine%2520API%7C_____0)  
Or see the examples in the Examples directory (work in progress)


###Projects built with qsocks
[SenseIt - Extension for Google Chrome to easily load web data](https://github.com/mindspank/SenseIt)  
[Service Charges - Interactive Web App by Axis Group & https://github.com/skokenes](http://viz.axisgroup.com/servicecharges/#/)  
[Generate Qlik Sense apps from ElasticSearch](https://github.com/pouc/qlik-elastic)  
[Chrome Extension - lets you create calculations on the fly](https://github.com/countnazgul/qlik-sense-chrome-devtools-extension)
