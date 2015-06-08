/* This exmaple demonstrates how to connect to several different scopes and or apps.
 * A single connection can only have a single app/scope opened so make
 * sure to open a app in a seperate scope
 * to avoid the engine mixing your sessions/scopes/identies
**/


//Core config
var CORE = {
  host: 'sense-demo.qlik.com',
  isSecure: true,
  appname: null
};

//First App config
var APP1 = {
  host: 'sense-demo.qlik.com',
  isSecure: true,
  appname: '5621cc5b-0bad-49d8-94c3-bef3aa5d8e84'
};

//Second App config
var APP2 = {
  host: 'sense-demo.qlik.com',
  isSecure: true,
  appname: '45b5016e-6616-4047-aa5e-b6d70696634d'
};

//Global Transient Scope
qsocks.Connect(CORE).then(function(global) {

  console.log('global',global)

})

//Scoped connection for App1
qsocks.Connect(APP1).then(function(global) {

  global.openDoc(APP1.appname).then(function(app) {
    app.getProperties().then(function(reply) {
      console.log('APP1 ' + reply.qAppProperties.qTitle)
    })
  })

})

//Scoped connection for App2
qsocks.Connect(APP2).then(function(global) {

  global.openDoc(APP2.appname).then(function(app) {
    app.getProperties().then(function(reply) {
      console.log('APP2 ' + reply.qAppProperties.qTitle)
    })
  })

})
