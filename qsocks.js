var doc = require('./lib/doc');
var field = require('./lib/field');
var genericBookmark = require('./lib/genericBookmark');
var genericDimension = require('./lib/genericDimension');
var genericMeasure = require('./lib/genericMeasure');
var genericObject = require('./lib/genericObject');
var global = require('./lib/global');
var genericVariable = require('./lib/genericVariable');

var WebSocket = require('ws');
var Promise = require("promise");

var VERSION = '2.1.13';

var qsocks = {
	version: VERSION,
	Doc: doc,
	Field: field,
	GenericBookmark: genericBookmark,
	GenericDimension: genericDimension,
	GenericMeasure: genericMeasure,
	GenericObject: genericObject,
	Global: global,
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

	return new Promise(function (resolve, reject) {
		cfg.done = function (glob) {
			resolve(glob);
		};
		cfg.error = function (msg) {
			reject(msg);
		};
		new Connection(cfg);
	});
};

qsocks.Connect = Connect;

function Connection(config) {
	var host = (config && config.host) ? config.host : 'localhost';
    var port;

    if (config && config.host === undefined ) {
        port = ':4848';
    } else {
        port = (config && config.port) ? ':' + config.port : '';
    };

	var isSecure = (config && config.isSecure) ? 'wss://' : 'ws://';
	var error = config ? config.error : null;
	var done = config ? config.done : null;

	this.seqid = 0;
	this.pending = {};
	this.handles = {};

	var self = this;
	var prefix = config.prefix ? config.prefix : '/';
	
	if (prefix.slice(0,1) !== '/') {
		prefix = '/' + prefix;
	};
	if (prefix.split('').pop() !== '/') {
		prefix = prefix + '/';
	};
	
	config.prefix = prefix;
		
	var suffix = config.appname ? 'app/' + config.appname : 'app/%3Ftransient%3D';
	var identity = (config && config.identity) ? '/identity/' + config.identity : '';
	var ticket = config.ticket ? '?qlikTicket=' + config.ticket : '';

	this.ws = new WebSocket(isSecure + host + port + prefix + suffix + identity + ticket, null, config);

	this.ws.onopen = function (ev) {
		if (done) {
			done.call(self, new qsocks.Global(self, -1));
		};
	};
	this.ws.onerror = function (ev) {
		if (error) {
			error(ev.message)
		} else {
			console.log(ev.message)
		}
		self.ws = null;
	};
	this.ws.onclose = function () {
		var unexpected = self.ws != null;
		var pending = self.pending[-99];
		delete self.pending[-99];
		if (pending) {
			pending.callback();
		} else if (unexpected) {
			if (error) {
				error();
			}
		}
		self.ws = null;
	};
	this.ws.onmessage = function (ev) {
		var text = ev.data;
		var msg = JSON.parse(text);
		var pending = self.pending[msg.id];
		delete self.pending[msg.id];
		if (pending) {
			if (pending.returnRaw) {
				pending.resolve(msg)
			}
			else if (msg.result) {
				pending.resolve(msg.result);
			} else {
				pending.reject(msg.error);
			}
		}
	};
}
Connection.prototype.ask = function (handle, method, args, id) {
	var connection = this;
	if (!Array.isArray(args)) {
		var array = [];
		for (var ix in args) {
			array[ix] = args[ix];
		}
		args = array;
	}
	var seqid = id || ++connection.seqid;
	var request = {
		method: method,
		handle: handle,
		params: args,
		id: seqid,
		jsonrpc: '2.0'
	};
	return new Promise(function (resolve, reject) {
		connection.pending[seqid] = {
			resolve: resolve,
			reject: reject,
			returnRaw: id ? true : false
		};
		connection.ws.send(JSON.stringify(request));
	});
};
Connection.prototype.create = function (arg) {
	if (qsocks[arg.qType]) {
		return new qsocks[arg.qType](this, arg.qHandle);
	} else {
		return null;
	}
};
Connection.prototype.close = function() {
	return this.ws.close();
};
module.exports = qsocks;