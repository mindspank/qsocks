var doc = require('./lib/doc');
var field = require('./lib/field');
var genericBookmark = require('./lib/genericBookmark');
var genericDimension = require('./lib/genericDimension');
var genericMeasure = require('./lib/genericMeasure');
var genericObject = require('./lib/genericObject');
var glob = require('./lib/global');
var genericVariable = require('./lib/genericVariable');

var Promise = require("promise");

var VERSION = '2.2.3';
var IS_NODE = typeof process !== "undefined" && Object.prototype.toString.call(process) === "[object process]";

// ws 1.0.1 breaks in browser. This will fallback to browser versions correctly
var WebSocket = global.WebSocket || global.MozWebSocket;

if (IS_NODE) {
    try {
        WebSocket = require('ws');
    } catch (e) {}
};

var qsocks = {
    version: VERSION,
    Doc: doc,
    Field: field,
    GenericBookmark: genericBookmark,
    GenericDimension: genericDimension,
    GenericMeasure: genericMeasure,
    GenericObject: genericObject,
    Global: glob,
    GenericVariable: genericVariable
};

function Connect(config) {
    var cfg = {};
    if (config) {
        cfg.mark = config.mark;
        cfg.port = config.port;
        cfg.appname = config.appname || false;
        cfg.host = config.host;
        cfg.prefix = config.prefix || false;
        cfg.origin = config.origin;
        cfg.isSecure = config.isSecure;
        cfg.rejectUnauthorized = config.rejectUnauthorized;
        cfg.headers = config.headers || {};
        cfg.ticket = config.ticket || false;
        cfg.key = config.key;
        cfg.cert = config.cert;
        cfg.ca = config.ca;
        cfg.identity = config.identity;
    }

    return new Promise(function(resolve, reject) {
        cfg.done = function(glob) {
            resolve(glob);
        };
        cfg.error = function(msg) {
            reject(msg);
        };
        new Connection(cfg);
    });
};
qsocks.Connect = Connect;

function ConnectOpenApp(config) {
    if (!config.appname) return Promise.reject(new Error('Missing appname property'));

    var cfg = {};
    if (config) {
        cfg.mark = config.mark;
        cfg.port = config.port;
        cfg.appname = config.appname || false;
        cfg.host = config.host;
        cfg.prefix = config.prefix || false;
        cfg.origin = config.origin;
        cfg.isSecure = config.isSecure;
        cfg.rejectUnauthorized = config.rejectUnauthorized;
        cfg.headers = config.headers || {};
        cfg.ticket = config.ticket || false;
        cfg.key = config.key;
        cfg.cert = config.cert;
        cfg.ca = config.ca;
        cfg.identity = config.identity;
        cfg.debug = config.debug || false;
    }

    return new Promise(function(resolve, reject) {
        cfg.done = function(glob) {
            glob.openDoc(cfg.appname).then(function(app) {
                resolve([glob, app]);
            }, function(error) {
                reject(error)
            })
        };
        cfg.error = function(msg) {
            reject(msg);
        };
        new Connection(cfg);
    });
};
qsocks.ConnectOpenApp = ConnectOpenApp;

function Connection(config) {

    var self = this;
    var host = (config && config.host) ? config.host : 'localhost';
    var port;

    if (config && config.host === undefined) {
        port = ':4848';
    } else {
        port = (config && config.port) ? ':' + config.port : '';
    };
    
    var IS_SERVICE_CONNECTION = false; 
    
    if(config && config.host) {
     if (config.headers.hasOwnProperty('X-Qlik-User') && config.key !== undefined && config.cert !== undefined ) {
        IS_SERVICE_CONNECTION = true;            
     };
    };
    
    var isSecure = (config && config.isSecure) ? 'wss://' : 'ws://';
    var error = config ? config.error : null;
    var done = config ? config.done : null;

    this.glob = null;
    this.seqid = 0;
    this.pending = {};
    this.handles = {};
    this.debug = config.debug;

    var prefix = config.prefix ? config.prefix : '/';

    if (prefix.slice(0, 1) !== '/') {
        prefix = '/' + prefix;
    };
    if (prefix.split('').pop() !== '/') {
        prefix = prefix + '/';
    };

    config.prefix = prefix;

    var suffix = config.appname ? 'app/' + config.appname : 'app/%3Ftransient%3D';
    var identity = (config && config.identity) ? '/identity/' + config.identity : '';
    var ticket = config.ticket ? '?qlikTicket=' + config.ticket : '';

    /**
     * Use correct WS constructor depending on context.
     */
    if (IS_NODE) {
        this.ws = new WebSocket(isSecure + host + port + prefix + suffix + identity + ticket, null, config);
    } else {
        this.ws = new WebSocket(isSecure + host + port + prefix + suffix + identity + ticket);
    };

    /**
     * For desktop return a global instance.
     * For Server send a frame to get a notification back.
     */
    this.ws.addEventListener('open', function open() {
        if ((host === 'localhost' && port === ':4848') || IS_SERVICE_CONNECTION ) {
            this.glob = new qsocks.Global(this, -1);
            done.call(this, this.glob);
        } else {
            this.ws.send(JSON.stringify({
                "method": "ProductVersion",
                "handle": -1,
                "params": [],
                "id": ++self.seqid,
                "jsonrpc": "2.0"
            }));
        }
    }.bind(this));

    this.ws.addEventListener('error', function err(ev) {
        if (error) {
            error(ev.message)
        } else {
            console.log(ev.message)
        }
        self.ws = null;
    });

    this.ws.addEventListener('close', function close() {
        var unexpected = self.ws != null;
        if (unexpected && error) {
            error();
        };
        this.ws = null;
    }.bind(this));

    this.ws.addEventListener('message', function message(ev) {
        var msg = JSON.parse(ev.data);
        if (this.debug) {
            console.log('Incoming', msg);
        };

        /**
         * We recived a frame from the server that is not a response.
         */
        if (!msg.id) {
            if ((msg.method === "OnAuthenticationInformation" && msg.params.mustAuthenticate) || (msg.params && msg.params.severity)) {
                this.ws.close();
                return error(msg.params);
            };
            if (msg.method === "OnAuthenticationInformation" && !msg.params.mustAuthenticate) {
                this.glob = new qsocks.Global(this, -1);
                done.call(this, this.glob);
            };
        };

        var pending = this.pending[msg.id];
        delete this.pending[msg.id];

        if (pending) {
            if (pending.returnRaw) {
                pending.resolve(msg)
            }
            else if (msg.result) {
                pending.resolve(msg.result);
            } else {
                pending.reject(msg.error);
            }
        };

        if (msg.change) {
            msg.change.forEach(function(d) {
                if (this.handles[d]) return this.handles[d].emit('change');
            }.bind(this));
        };
        
        if (msg.close) {
            msg.close.forEach(function(d) {
                if (this.handles[d]) return this.handles[d].emit('close');
            }.bind(this));            
        };

    }.bind(this));

};
Connection.prototype.ask = function(handle, method, args, id) {
    var connection = this;
    if (!Array.isArray(args)) {
        var array = [];
        for (var ix in args) {
            array[ix] = args[ix];
        }
        args = array;
    };
    var seqid = id || ++connection.seqid;
    var request = {
        method: method,
        handle: handle,
        params: args,
        id: seqid,
        jsonrpc: '2.0'
    };

    if (this.debug) {
        console.log('Outgoing', request)
    };

    return new Promise(function(resolve, reject) {
        connection.pending[seqid] = {
            resolve: resolve,
            reject: reject,
            returnRaw: id ? true : false
        };
        connection.ws.send(JSON.stringify(request));
    });
};
Connection.prototype.create = function(arg) {
    if (qsocks[arg.qType]) {
        this.handles[arg.qHandle] = new qsocks[arg.qType](this, arg.qHandle);
        return this.handles[arg.qHandle];
    } else {
        return null;
    }
};
Connection.prototype.close = function() {
    return this.ws.close();
};
module.exports = qsocks;