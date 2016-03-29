(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.qsocks = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global){
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
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./lib/doc":2,"./lib/field":3,"./lib/genericBookmark":4,"./lib/genericDimension":5,"./lib/genericMeasure":6,"./lib/genericObject":7,"./lib/genericVariable":8,"./lib/global":9,"_process":15,"promise":16,"ws":12}],2:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function Doc(connection, handle) {
    this.connection = connection;
    this.handle = handle;
    EventEmitter.call(this);
};
util.inherits(Doc, EventEmitter);

Doc.prototype.commitDraft = function(Id) {
    return this.connection.ask(this.handle, 'CommitDraft', arguments);
};
Doc.prototype.createDraft = function(Id) {
    return this.connection.ask(this.handle, 'CreateDraft', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
Doc.prototype.getProperties = function() {
    return this.connection.ask(this.handle, 'GetProperties', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Doc.prototype.addFieldFromExpression = function(Name, Expression) {
    return this.connection.ask(this.handle, 'AddFieldFromExpression', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Doc.prototype.findMatchingFields = function(Fieldnames, Tags) {
    return this.connection.ask(this.handle, 'FindMatchingFields', arguments).then(function(msg) {
        return msg.qFieldNames;
    });
};
Doc.prototype.getMatchingFields = function(Tags) {
    return this.connection.ask(this.handle, 'GetMatchingFields', arguments).then(function(msg) {
        return msg.qFieldNames;
    });
};
Doc.prototype.getField = function(FieldName, StateName) {
    var connection = this.connection;
    return this.connection.ask(this.handle, 'GetField', arguments).then(function(msg) {
        return connection.create(msg.qReturn);
    });
};
Doc.prototype.getFieldDescription = function(FieldName) {
    return this.connection.ask(this.handle, 'GetFieldDescription', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Doc.prototype.getLooselyCoupledVector = function() {
    return this.connection.ask(this.handle, 'GetLooselyCoupledVector', arguments).then(function(msg) {
        return msg.qv;
    });
};
Doc.prototype.setLooselyCoupledVector = function(v) {
    return this.connection.ask(this.handle, 'SetLooselyCoupledVector', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Doc.prototype.backCount = function() {
    return this.connection.ask(this.handle, 'BackCount', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Doc.prototype.forwardCount = function() {
    return this.connection.ask(this.handle, 'ForwardCount', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Doc.prototype.clearAll = function(LockedAlso, StateName) {
    return this.connection.ask(this.handle, 'ClearAll', arguments);
};
Doc.prototype.lockAll = function(StateName) {
    return this.connection.ask(this.handle, 'LockAll', arguments);
};
Doc.prototype.unlockAll = function(StateName) {
    return this.connection.ask(this.handle, 'UnlockAll', arguments);
};
Doc.prototype.back = function() {
    return this.connection.ask(this.handle, 'Back', arguments);
};
Doc.prototype.forward = function() {
    return this.connection.ask(this.handle, 'Forward', arguments);
};
Doc.prototype.removeAllData = function(Confirm) {
    return this.connection.ask(this.handle, 'RemoveAllData', arguments);
};
Doc.prototype.getDocBookmarks = function() {
    return this.connection.ask(this.handle, 'GetDocBookmarks', arguments).then(function(msg) {
        return msg.qBookmarks;
    });
};
Doc.prototype.getAllInfos = function() {
    return this.connection.ask(this.handle, 'GetAllInfos', arguments);
};
Doc.prototype.getAssociationScores = function(Table1, Table2) {
    return this.connection.ask(this.handle, 'GetAssociationScores', arguments).then(function(msg) {
        return msg.qScore;
    });
};
Doc.prototype.getLocaleInfo = function() {
    return this.connection.ask(this.handle, 'GetLocaleInfo', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Doc.prototype.getTablesAndKeys = function(WindowSize, NullSize, CellHeight, SyntheticMode, IncludeSysVars) {
    return this.connection.ask(this.handle, 'GetTablesAndKeys', arguments);
};
Doc.prototype.getViewDlgSaveInfo = function() {
    return this.connection.ask(this.handle, 'GetViewDlgSaveInfo', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Doc.prototype.setViewDlgSaveInfo = function(Info) {
    return this.connection.ask(this.handle, 'SetViewDlgSaveInfo', arguments);
};
Doc.prototype.getEmptyScript = function(LocalizedMainSection) {
    return this.connection.ask(this.handle, 'GetEmptyScript', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Doc.prototype.getDocBookmarkInfo = function() {
    return this.connection.ask(this.handle, 'GetDocBookmarkInfo', arguments).then(function(msg) {
        return msg.qInfoArray;
    });
};
Doc.prototype.getAllExpressions = function() {
    return this.connection.ask(this.handle, 'GetAllExpressions', arguments).then(function(msg) {
        return msg.qList;
    });
};
Doc.prototype.doReload = function(Mode, Partial, Debug) {
    return this.connection.ask(this.handle, 'DoReload', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Doc.prototype.doReloadEx = function(Mode, Partial, Debug) {
    return this.connection.ask(this.handle, 'DoReloadEx', arguments).then(function(msg) {
        return msg.qResult;
    });
};
Doc.prototype.getScriptBreakpoints = function() {
    return this.connection.ask(this.handle, 'GetScriptBreakpoints', arguments).then(function(msg) {
        return msg.qBreakpoints;
    });
};
Doc.prototype.setScriptBreakpoints = function(Breakpoints) {
    return this.connection.ask(this.handle, 'SetScriptBreakpoints', arguments);
};
Doc.prototype.getScript = function() {
    return this.connection.ask(this.handle, 'GetScript', arguments).then(function(msg) {
        return msg.qScript;
    });
};
Doc.prototype.getTextMacros = function() {
    return this.connection.ask(this.handle, 'GetTextMacros', arguments).then(function(msg) {
        return msg.qMacros;
    });
};
Doc.prototype.setFetchLimit = function(Limit) {
    return this.connection.ask(this.handle, 'SetFetchLimit', arguments);
};
Doc.prototype.doSave = function(FileName) {
    return this.connection.ask(this.handle, 'DoSave', arguments);
};
Doc.prototype.getTableData = function(Offset, Rows, SyntheticMode, TableName) {
    return this.connection.ask(this.handle, 'GetTableData', arguments).then(function(msg) {
        return msg.qData;
    });
};
Doc.prototype.getAppLayout = function() {
    return this.connection.ask(this.handle, 'GetAppLayout', arguments).then(function(msg) {
        return msg.qLayout;
    });
};
Doc.prototype.setAppProperties = function(Prop) {
    return this.connection.ask(this.handle, 'SetAppProperties', arguments);
};
Doc.prototype.getAppProperties = function() {
    return this.connection.ask(this.handle, 'GetAppProperties', arguments).then(function(msg) {
        return msg.qProp;
    });
};
Doc.prototype.createSessionObject = function(Prop) {
    var connection = this.connection;
    return this.connection.ask(this.handle, 'CreateSessionObject', arguments).then(function(msg) {
        return connection.create(msg.qReturn);
    });
};
Doc.prototype.destroySessionObject = function(Id) {
    return this.connection.ask(this.handle, 'DestroySessionObject', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
Doc.prototype.createObject = function(Prop) {
    var connection = this.connection;
    return this.connection.ask(this.handle, 'CreateObject', arguments).then(function(msg) {
        return connection.create(msg.qReturn);
    });
};
Doc.prototype.destroyObject = function(Id) {
    return this.connection.ask(this.handle, 'DestroyObject', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
Doc.prototype.getObject = function(Id) {
    var connection = this.connection;
    return this.connection.ask(this.handle, 'GetObject', arguments).then(function(msg) {
        return connection.create(msg.qReturn);
    });
};
Doc.prototype.cloneObject = function(Id) {
    return this.connection.ask(this.handle, 'CloneObject', arguments).then(function(msg) {
        return msg.qCloneId;
    });
};
Doc.prototype.undo = function() {
    return this.connection.ask(this.handle, 'Undo', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
Doc.prototype.redo = function() {
    return this.connection.ask(this.handle, 'Redo', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
Doc.prototype.clearUndoBuffer = function() {
    return this.connection.ask(this.handle, 'ClearUndoBuffer', arguments);
};
Doc.prototype.createDimension = function(Prop) {
    var connection = this.connection;
    return this.connection.ask(this.handle, 'CreateDimension', arguments).then(function(msg) {
        return connection.create(msg.qReturn);
    });
};
Doc.prototype.destroyDimension = function(Id) {
    return this.connection.ask(this.handle, 'DestroyDimension', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
Doc.prototype.destroyDraft = function(Id, SourceId) {
    return this.connection.ask(this.handle, 'DestroyDraft', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
Doc.prototype.getDimension = function(Id) {
    var connection = this.connection;
    return this.connection.ask(this.handle, 'GetDimension', arguments).then(function(msg) {
        return connection.create(msg.qReturn);
    });
};
Doc.prototype.cloneDimension = function(Id) {
    return this.connection.ask(this.handle, 'CloneDimension', arguments).then(function(msg) {
        return msg.qCloneId;
    });
};
Doc.prototype.createMeasure = function(Prop) {
    var connection = this.connection;
    return this.connection.ask(this.handle, 'CreateMeasure', arguments).then(function(msg) {
        return connection.create(msg.qReturn);
    });    
};
Doc.prototype.destroyMeasure = function(Id) {
    return this.connection.ask(this.handle, 'DestroyMeasure', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
Doc.prototype.getMeasure = function(Id) {
    var connection = this.connection;
    return this.connection.ask(this.handle, 'GetMeasure', arguments).then(function(msg) {
        return connection.create(msg.qReturn);
    });
};

Doc.prototype.cloneMeasure = function(Id) {
    return this.connection.ask(this.handle, 'CloneMeasure', arguments).then(function(msg) {
        return msg.qCloneId;
    });
};
Doc.prototype.checkExpression = function(Expr) {
    return this.connection.ask(this.handle, 'CheckExpression', arguments);
};
Doc.prototype.checkNumberOrExpression = function(Expr) {
    return this.connection.ask(this.handle, 'CheckNumberOrExpression', arguments);
};
Doc.prototype.addAlternateState = function(StateName) {
    return this.connection.ask(this.handle, 'AddAlternateState', arguments);
};
Doc.prototype.removeAlternateState = function(StateName) {
    return this.connection.ask(this.handle, 'RemoveAlternateState', arguments);
};
Doc.prototype.setScript = function(Script) {
    return this.connection.ask(this.handle, 'SetScript', arguments);
};
Doc.prototype.checkScriptSyntax = function() {
    return this.connection.ask(this.handle, 'CheckScriptSyntax', arguments).then(function(msg) {
        return msg.qErrors;
    });
};
Doc.prototype.getDirectoryListing = function(Connection, RelativePath, Path) {
    return this.connection.ask(this.handle, 'GetDirectoryListing', arguments).then(function(msg) {
        return msg.qContent;
    });
};
Doc.prototype.canCreateConnection = function() {
    return this.connection.ask(this.handle, 'CanCreateConnection', arguments);
};
Doc.prototype.createConnection = function() {
    return this.connection.ask(this.handle, 'CreateConnection', arguments).then(function(msg) {
        return msg.qConnectionId;
    });
};
Doc.prototype.getConnections = function() {
    return this.connection.ask(this.handle, 'GetConnections', arguments).then(function(msg) {
        return msg.qConnections;
    });
};
Doc.prototype.createNewConnection = function(Name, ConnectionString, UserName, Password) {
    return this.connection.ask(this.handle, 'CreateNewConnection', arguments);
};
Doc.prototype.deleteConnection = function(Id) {
    return this.connection.ask(this.handle, 'DeleteConnection', arguments);
};
Doc.prototype.getConnection = function(Id) {
    return this.connection.ask(this.handle, 'GetConnection', arguments);
};
Doc.prototype.modifyConnection = function(Id, Name, ConnectionString, Type, OverrideCredentials, UserName, Password) {
    return this.connection.ask(this.handle, 'ModifyConnection', arguments);
};
Doc.prototype.getConnectionInfo = function(Connection) {
    return this.connection.ask(this.handle, 'GetConnectionInfo', arguments).then(function(msg) {
        return msg.qConnInfo;
    });
};
Doc.prototype.getConnectionDatabases = function(Connection) {
    return this.connection.ask(this.handle, 'GetConnectionDatabases', arguments).then(function(msg) {
        return msg.qDatabases;
    });
};
Doc.prototype.getConnectionOwners = function(Connection, Database) {
    return this.connection.ask(this.handle, 'GetConnectionOwners', arguments).then(function(msg) {
        return msg.qOwners;
    });
};
Doc.prototype.getDatabaseInfo = function(Connection) {
    return this.connection.ask(this.handle, 'GetDatabaseInfo', arguments).then(function(msg) {
        return msg.qInfo;
    });
};
Doc.prototype.getDatabases = function(Connection) {
    return this.connection.ask(this.handle, 'GetDatabases', arguments).then(function(msg) {
        return msg.qDatabases;
    });
};
Doc.prototype.getDatabaseOwners = function(Connection, Databse) {
    return this.connection.ask(this.handle, 'GetDatabaseOwners', arguments).then(function(msg) {
        return msg.qOwners;
    });
};
Doc.prototype.getDatabaseTables = function(Connection, Database, Owner) {
    return this.connection.ask(this.handle, 'GetDatabaseTables', arguments).then(function(msg) {
        return msg.qTables;
    });
};
Doc.prototype.getDatabaseTableFields = function(Connection, Database, Owner, Table) {
    return this.connection.ask(this.handle, 'GetDatabaseTableFields', arguments).then(function(msg) {
        return msg.qFields;
    });
};
Doc.prototype.getDatabaseTablePreview = function(Connection, Database, Owner, Table) {
    return this.connection.ask(this.handle, 'GetDatabaseTablePreview', arguments).then(function(msg) {
        return msg.qPreview;
    });
};
Doc.prototype.guessFileType = function(Connection, RelativePath) {
    return this.connection.ask(this.handle, 'GuessFileType', arguments).then(function(msg) {
        return msg.qFormatInfo;
    });
};
Doc.prototype.getFileTables = function(Connection, RelativePath, Type) {
    return this.connection.ask(this.handle, 'GetFileTables', arguments).then(function(msg) {
        return msg.qTables;
    });
};
Doc.prototype.getFileTablesEx = function(Connection, RelativePath, Type) {
    return this.connection.ask(this.handle, 'GetFileTablesEx', arguments).then(function(msg) {
        return msg.qTables;
    });
};
Doc.prototype.getFileTableFields = function(Connection, RelativePath, Table, FormatInfo) {
    return this.connection.ask(this.handle, 'GetFileTableFields', arguments);
};
Doc.prototype.getFileTableFieldsPreview = function(Connection, RelativePath, Table, FormatInfo) {
    return this.connection.ask(this.handle, 'GetFileTableFieldsPreview', arguments);
};
Doc.prototype.getFileTablesAndFields = function(Connection, RelativePath, Type) {
    return this.connection.ask(this.handle, 'GetFileTablesAndFields', arguments).then(function(msg) {
        return msg.qTables;
    });
};
Doc.prototype.getFolderItemsForConnection = function(Connection, RelativePath) {
    return this.connection.ask(this.handle, 'GetFolderItemsForConnection', arguments).then(function(msg) {
        return msg.qFolderItems;
    });
};
Doc.prototype.getIncludeFileContent = function(Path) {
    return this.connection.ask(this.handle, 'GetIncludeFileContent', arguments).then(function(msg) {
        return msg.qContent;
    });
};
Doc.prototype.sendGenericCommandToCustomConnector = function(Provider, Command, Method, Parameters, AppendConnection) {
    return this.connection.ask(this.handle, 'SendGenericCommandToCustomConnector', arguments).then(function(msg) {
        return msg.qResult;
    });
};
Doc.prototype.getFavoriteVariables = function() {
    return this.connection.ask(this.handle, 'GetFavoriteVariables', arguments).then(function(msg) {
        return msg.qNames;
    });
};
Doc.prototype.setFavoriteVariables = function(Names) {
    return this.connection.ask(this.handle, 'SetFavoriteVariables', arguments);
};
Doc.prototype.createBookmark = function(Prop) {
    var connection = this.connection;
    return this.connection.ask(this.handle, 'CreateBookmark', arguments).then(function(msg) {
        return connection.create(msg.qReturn);
    });
};
Doc.prototype.destroyBookmark = function(Id) {
    return this.connection.ask(this.handle, 'DestroyBookmark', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
Doc.prototype.getBookmark = function(Id) {
    var connection = this.connection;
    return this.connection.ask(this.handle, 'GetBookmark', arguments).then(function(msg) {
        return connection.create(msg.qReturn);
    });
};
Doc.prototype.applyBookmark = function(Id) {
    return this.connection.ask(this.handle, 'ApplyBookmark', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
Doc.prototype.cloneBookmark = function(Id) {
    return this.connection.ask(this.handle, 'CloneBookmark', arguments).then(function(msg) {
        return msg.qCloneId;
    });
};
Doc.prototype.getExpressions = function() {
    return this.connection.ask(this.handle, 'GetExpressions', arguments).then(function(msg) {
        return msg.qExpressions;
    });
};
Doc.prototype.resume = function() {
    return this.connection.ask(this.handle, 'Resume', arguments);
};
Doc.prototype.abortModal = function(Accept) {
    return this.connection.ask(this.handle, 'AbortModal', arguments);
};
Doc.prototype.generateThumbNail = function(ObjectId) {
    return this.connection.ask(this.handle, 'GenerateThumbNail', arguments).then(function(msg) {
        return msg.qContent;
    });
};
Doc.prototype.publish = function(StreamId, Name) {
    return this.connection.ask(this.handle, 'Publish', arguments);
};
Doc.prototype.saveObjects = function() {
    return this.connection.ask(this.handle, 'SaveObjects', arguments);
};
Doc.prototype.unPublish = function() {
    return this.connection.ask(this.handle, 'UnPublish', arguments);
};
Doc.prototype.searchAssociations = function(Options, Terms, Page) {
    return this.connection.ask(this.handle, 'SearchAssociations', arguments).then(function(msg) {
        return msg.qResults;
    });
};
Doc.prototype.searchSuggest = function(Options, Terms) {
    return this.connection.ask(this.handle, 'SearchSuggest', arguments).then(function(msg) {
        return msg.qResult;
    });
};
Doc.prototype.selectAssociations = function(Options, Terms, MatchIx, Softlock) {
    return this.connection.ask(this.handle, 'SelectAssociations', arguments);
};

// 2.1 Added methods
Doc.prototype.getLibraryContent = function(qName) {
    return this.connection.ask(this.handle, 'GetLibraryContent', arguments).then(function(msg) {
        return msg.qList;
    });
};
Doc.prototype.getContentLibraries = function() {
    return this.connection.ask(this.handle, 'GetContentLibraries', arguments).then(function(msg) {
        return msg.qList;
    });
};
Doc.prototype.createSessionVariable = function(Prop) {
    var connection = this.connection;
    return this.connection.ask(this.handle, 'CreateSessionVariable', arguments).then(function(msg) {
        return connection.create(msg.qReturn);
    });
};
Doc.prototype.createVariableEx = function(Prop) {
    var connection = this.connection;
    return this.connection.ask(this.handle, 'CreateVariableEx', arguments).then(function(msg) {
        return connection.create(msg.qReturn);
    });
};
Doc.prototype.getVariableById = function(Id) {
    var connection = this.connection;
    return this.connection.ask(this.handle, 'GetVariableById', arguments).then(function(msg) {
        return connection.create(msg.qReturn);
    });
};
Doc.prototype.getVariableByName  = function(Name) {
    var connection = this.connection;
    return this.connection.ask(this.handle, 'GetVariableByName', arguments).then(function(msg) {
        return connection.create(msg.qReturn);
    });
};
Doc.prototype.destroySessionVariable = function(Id) {
    return this.connection.ask(this.handle, 'DestroySessionVariable', arguments).then(function(msg) {
        return msg.qResults;
    });
};
Doc.prototype.destroyVariableById = function(Id) {
    return this.connection.ask(this.handle, 'DestroyVariableById', arguments).then(function(msg) {
        return msg.qResults;
    });
};
Doc.prototype.destroyVariableByName  = function(Name) {
    return this.connection.ask(this.handle, 'DestroyVariableByName', arguments).then(function(msg) {
        return msg.qResults;
    });
};
Doc.prototype.evaluate = function(qExpression) {
    return this.connection.ask(this.handle, 'Evaluate', arguments).then(function(msg) {
       return msg.qReturn 
    });
};
Doc.prototype.evaluateEx = function(qExpression) {
    return this.connection.ask(this.handle, 'EvaluateEx', arguments).then(function(msg) {
       return msg.qValue; 
    });
};
// Deprecated Methods
Doc.prototype.getMediaList = function(Prop) {
    return new Error('This method was deprecated in 2.1. Replaced with GetLibraryContent');
};
Doc.prototype.createVariable = function(Name) {
    return new Error('This method was deprecated in 2.1. Replaced with CreateVariableEx and CreateSessionVariable');
};
Doc.prototype.getVariable = function(Name) {
    return new Error('This method was deprecated in 2.1. Replaced with GetVariableById and GetVariableByName');
};
Doc.prototype.removeVariable = function(Name) {
    return new Error('This method was deprecated in 2.1. Replaced with DestroyVariableById, DestroyVariableByName and DestroySessionVariable');
};
module.exports = Doc;
},{"events":13,"util":25}],3:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function Field(connection, handle) {
    this.connection = connection;
    this.handle = handle;
    EventEmitter.call(this);
};
util.inherits(Field, EventEmitter);

Field.prototype.getCardinal = function() {
    return this.connection.ask(this.handle, 'GetCardinal', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Field.prototype.getAndMode = function() {
    return this.connection.ask(this.handle, 'GetAndMode', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Field.prototype.setAndMode = function(AndMode) {
    return this.connection.ask(this.handle, 'SetAndMode', arguments);
};
Field.prototype.lowLevelSelect = function(Values, ToggleMode, SoftLock) {
    return this.connection.ask(this.handle, 'LowLevelSelect', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Field.prototype.select = function(Match, SoftLock, ExcludedValuesMode) {
    return this.connection.ask(this.handle, 'Select', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Field.prototype.toggleSelect = function(Match, SoftLock, ExcludedValuesMode) {
    return this.connection.ask(this.handle, 'ToggleSelect', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Field.prototype.clearAllButThis = function(SoftLock) {
    return this.connection.ask(this.handle, 'ClearAllButThis', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Field.prototype.selectPossible = function(SoftLock) {
    return this.connection.ask(this.handle, 'SelectPossible', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Field.prototype.selectExcluded = function(SoftLock) {
    return this.connection.ask(this.handle, 'SelectExcluded', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Field.prototype.selectAll = function(SoftLock) {
    return this.connection.ask(this.handle, 'SelectAll', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Field.prototype.selectValues = function(FieldValues, Toggle, SoftLock) {
    return this.connection.ask(this.handle, 'SelectValues', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Field.prototype.clear = function() {
    return this.connection.ask(this.handle, 'Clear', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Field.prototype.lock = function() {
    return this.connection.ask(this.handle, 'Lock', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Field.prototype.unlock = function() {
    return this.connection.ask(this.handle, 'Unlock', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Field.prototype.selectAlternative = function(SoftLock) {
    return this.connection.ask(this.handle, 'SelectAlternative', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Field.prototype.getNxProperties = function() {
    return this.connection.ask(this.handle, 'GetNxProperties', arguments).then(function(msg) {
        return msg.qProperties;
    });
};
Field.prototype.setNxProperties = function(Properties) {
    return this.connection.ask(this.handle, 'SetNxProperties', arguments);
};
module.exports = Field;
},{"events":13,"util":25}],4:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function GenericBookmark(connection, handle) {
    this.connection = connection;
    this.handle = handle;
    EventEmitter.call(this);
};
util.inherits(GenericBookmark, EventEmitter);

GenericBookmark.prototype.apply = function() {
    return this.connection.ask(this.handle, 'Apply', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
GenericBookmark.prototype.applyPatches = function(Patches) {
    return this.connection.ask(this.handle, 'ApplyPatches', arguments);
};
GenericBookmark.prototype.getLayout = function() {
    return this.connection.ask(this.handle, 'GetLayout', arguments).then(function(msg) {
        return msg.qLayout;
    });
};
GenericBookmark.prototype.getProperties = function() {
    return this.connection.ask(this.handle, 'GetProperties', arguments).then(function(msg) {
        return msg.qProp;
    });
};
GenericBookmark.prototype.getInfo = function() {
    return this.connection.ask(this.handle, 'GetInfo', arguments).then(function(msg) {
        return msg.qInfo;
    });
};
GenericBookmark.prototype.setProperties = function(Prop) {
    return this.connection.ask(this.handle, 'SetProperties', arguments);
};
GenericBookmark.prototype.publish = function() {
    return this.connection.ask(this.handle, 'Publish', arguments);
};
GenericBookmark.prototype.unPublish = function() {
    return this.connection.ask(this.handle, 'UnPublish', arguments);
};
module.exports = GenericBookmark;
},{"events":13,"util":25}],5:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function GenericDimension(connection, handle) {
    this.connection = connection;
    this.handle = handle;
    EventEmitter.call(this);
};
util.inherits(GenericDimension, EventEmitter);

GenericDimension.prototype.getLayout = function() {
    return this.connection.ask(this.handle, 'GetLayout', arguments).then(function(msg) {
        return msg.qLayout;
    });
};
GenericDimension.prototype.applyPatches = function(Patches) {
    return this.connection.ask(this.handle, 'ApplyPatches', arguments);
};
GenericDimension.prototype.setProperties = function(Prop) {
    return this.connection.ask(this.handle, 'SetProperties', arguments);
};
GenericDimension.prototype.getProperties = function() {
    return this.connection.ask(this.handle, 'GetProperties', arguments).then(function(msg) {
        return msg.qProp;
    });
};
GenericDimension.prototype.getInfo = function() {
    return this.connection.ask(this.handle, 'GetInfo', arguments).then(function(msg) {
        return msg.qInfo;
    });
};
GenericDimension.prototype.getDimension = function() {
    return this.connection.ask(this.handle, 'GetDimension', arguments).then(function(msg) {
        return msg.qDim;
    });
};
GenericDimension.prototype.getLinkedObjects = function() {
    return this.connection.ask(this.handle, 'GetLinkedObjects', arguments).then(function(msg) {
        return msg.qItems;
    });
};
GenericDimension.prototype.publish = function() {
    return this.connection.ask(this.handle, 'Publish', arguments);
};
GenericDimension.prototype.unPublish = function() {
    return this.connection.ask(this.handle, 'UnPublish', arguments);
};
module.exports = GenericDimension;
},{"events":13,"util":25}],6:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function GenericMeasure(connection, handle) {
    this.connection = connection;
    this.handle = handle;
    EventEmitter.call(this);
};
util.inherits(GenericMeasure, EventEmitter);

GenericMeasure.prototype.getLayout = function() {
    return this.connection.ask(this.handle, 'GetLayout', arguments).then(function(msg) {
        return msg.qLayout;
    });
};
GenericMeasure.prototype.applyPatches = function(Patches) {
    return this.connection.ask(this.handle, 'ApplyPatches', arguments);
};
GenericMeasure.prototype.setProperties = function(Prop) {
    return this.connection.ask(this.handle, 'SetProperties', arguments);
};
GenericMeasure.prototype.getProperties = function() {
    return this.connection.ask(this.handle, 'GetProperties', arguments).then(function(msg) {
        return msg.qProp;
    });
};
GenericMeasure.prototype.getInfo = function() {
    return this.connection.ask(this.handle, 'GetInfo', arguments).then(function(msg) {
        return msg.qInfo;
    });
};
GenericMeasure.prototype.getMeasure = function() {
    return this.connection.ask(this.handle, 'GetMeasure', arguments).then(function(msg) {
        return msg.qMeasure;
    });
};
GenericMeasure.prototype.getLinkedObjects = function() {
    return this.connection.ask(this.handle, 'GetLinkedObjects', arguments).then(function(msg) {
        return msg.qItems;
    });
};
GenericMeasure.prototype.publish = function() {
    return this.connection.ask(this.handle, 'Publish', arguments);
};
GenericMeasure.prototype.unPublish = function() {
    return this.connection.ask(this.handle, 'UnPublish', arguments);
};
module.exports = GenericMeasure;
},{"events":13,"util":25}],7:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function GenericObject(connection, handle) {
    this.connection = connection;
    this.handle = handle;
    EventEmitter.call(this);
};
util.inherits(GenericObject, EventEmitter);

GenericObject.prototype.exportData = function(FileType, Path, FileName, ExportState) {
    return this.connection.ask(this.handle, 'ExportData', arguments).then(function(msg) {
        return msg.qUrl;
    });
};
GenericObject.prototype.getEffectiveProperties = function() {
    return this.connection.ask(this.handle, 'GetEffectiveProperties', arguments).then(function(msg) {
        return msg.qProp;
    });
};
GenericObject.prototype.getLayout = function() {
    return this.connection.ask(this.handle, 'GetLayout', arguments).then(function(msg) {
        return msg.qLayout;
    });
};
GenericObject.prototype.getListObjectData = function(Path, Pages) {
    return this.connection.ask(this.handle, 'GetListObjectData', arguments).then(function(msg) {
        return msg.qDataPages;
    });
};
GenericObject.prototype.getHyperCubeAdaptiveGrid = function(Path, Pages, DataRanges, MaxNbrcells, QueryLevel) {
    return this.connection.ask(this.handle, 'GetHyperCubeAdaptiveGrid', arguments).then(function(msg) {
        return msg.qDataPages;
    });
};
GenericObject.prototype.getHyperCubeBinnedData = function(Path, Pages, Viewport, DataRanges, MaxNbrCells, QueryLevel, BinningMethod) {
    return this.connection.ask(this.handle, 'GetHyperBinnedCubeData', arguments).then(function(msg) {
        return msg.qDataPages;
    });
};
GenericObject.prototype.getHyperCubeData = function(Path, Pages) {
    return this.connection.ask(this.handle, 'GetHyperCubeData', arguments).then(function(msg) {
        return msg.qDataPages;
    });
};
GenericObject.prototype.getHyperCubeReducedData = function(Path, Pages, ZoomFactor, ReductionMode) {
    return this.connection.ask(this.handle, 'GetHyperCubeReducedData', arguments).then(function(msg) {
        return msg.qDataPages;
    });
};
GenericObject.prototype.getHyperCubePivotData = function(Path, Pages) {
    return this.connection.ask(this.handle, 'GetHyperCubePivotData', arguments).then(function(msg) {
        return msg.qDataPages;
    });
};
GenericObject.prototype.getHyperCubeStackData = function(Path, Pages, MaxNbrCells) {
    return this.connection.ask(this.handle, 'GetHyperCubeStackData', arguments).then(function(msg) {
        return msg.qDataPages;
    });
};
GenericObject.prototype.applyPatches = function(Patches, SoftPatch) {
    return this.connection.ask(this.handle, 'ApplyPatches', arguments);
};
GenericObject.prototype.clearSoftPatches = function() {
    return this.connection.ask(this.handle, 'ClearSoftPatches', arguments);
};
GenericObject.prototype.setProperties = function(Prop) {
    return this.connection.ask(this.handle, 'SetProperties', arguments);
};
GenericObject.prototype.getProperties = function() {
    return this.connection.ask(this.handle, 'GetProperties', arguments).then(function(msg) {
        return msg.qProp;
    });
};
GenericObject.prototype.setFullPropertyTree = function(PropEntry) {
    return this.connection.ask(this.handle, 'SetFullPropertyTree', arguments);
};
GenericObject.prototype.getFullPropertyTree = function() {
    return this.connection.ask(this.handle, 'GetFullPropertyTree', arguments).then(function(msg) {
        return msg.qPropEntry;
    });
};
GenericObject.prototype.getInfo = function() {
    return this.connection.ask(this.handle, 'GetInfo', arguments).then(function(msg) {
        return msg.qInfo;
    });
};
GenericObject.prototype.clearSelections = function(Path, ColIndices) {
    return this.connection.ask(this.handle, 'ClearSelections', arguments);
};
GenericObject.prototype.selectListObjectValues = function(Path, Values, ToggleMode, SoftLock) {
    return this.connection.ask(this.handle, 'SelectListObjectValues', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
GenericObject.prototype.selectListObjectPossible = function(Path, SoftLock) {
    return this.connection.ask(this.handle, 'SelectListObjectPossible', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
GenericObject.prototype.selectListObjectExcluded = function(Path, SoftLock) {
    return this.connection.ask(this.handle, 'SelectListObjectExcluded', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
GenericObject.prototype.selectListObjectAlternative = function(Path, SoftLock) {
    return this.connection.ask(this.handle, 'SelectListObjectAlternative', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
GenericObject.prototype.selectListObjectAll = function(Path, SoftLock) {
    return this.connection.ask(this.handle, 'SelectListObjectAll', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
GenericObject.prototype.searchListObjectFor = function(Path, Match) {
    return this.connection.ask(this.handle, 'SearchListObjectFor', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
GenericObject.prototype.abortListObjectSearch = function(Path) {
    return this.connection.ask(this.handle, 'AbortListObjectSearch', arguments);
};
GenericObject.prototype.acceptListObjectSearch = function(Path, ToggleMode, SoftLock) {
    return this.connection.ask(this.handle, 'AcceptListObjectSearch', arguments);
};
GenericObject.prototype.expandLeft = function(Path, Row, Col, All) {
    return this.connection.ask(this.handle, 'ExpandLeft', arguments);
};
GenericObject.prototype.expandTop = function(Path, Row, Col, All) {
    return this.connection.ask(this.handle, 'ExpandTop', arguments);
};
GenericObject.prototype.collapseLeft = function(Path, Row, Col, All) {
    return this.connection.ask(this.handle, 'CollapseLeft', arguments);
};
GenericObject.prototype.collapseTop = function(Path, Row, Col, All) {
    return this.connection.ask(this.handle, 'CollapseTop', arguments);
};
GenericObject.prototype.drillUp = function(Path, DimNo, NbrSteps) {
    return this.connection.ask(this.handle, 'DrillUp', arguments);
};
GenericObject.prototype.lock = function(Path, ColIndices) {
    return this.connection.ask(this.handle, 'Lock', arguments);
};
GenericObject.prototype.unlock = function(Path, ColIndices) {
    return this.connection.ask(this.handle, 'Unlock', arguments);
};
GenericObject.prototype.selectHyperCubeValues = function(Path, DimNo, Values, ToggleMode) {
    return this.connection.ask(this.handle, 'SelectHyperCubeValues', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
GenericObject.prototype.selectHyperCubeCells = function(Path, RowIndices, ColIndices, SoftLock, DeselectOnlyOneSelected) {
    return this.connection.ask(this.handle, 'SelectHyperCubeCells', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
GenericObject.prototype.selectPivotCells = function(Path, Selections, SoftLock, DeselectOnlyOneSelected) {
    return this.connection.ask(this.handle, 'SelectPivotCells', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
GenericObject.prototype.rangeSelectHyperCubeValues = function(Path, Ranges, OrMode, DeselectOnlyOneSelected) {
    return this.connection.ask(this.handle, 'RangeSelectHyperCubeValues', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
GenericObject.prototype.getChild = function(Id) {
    var connection = this.connection;
    return this.connection.ask(this.handle, 'GetChild', arguments).then(function(msg) {
        return connection.create(msg.qReturn);
    });
};
GenericObject.prototype.getChildInfos = function() {
    return this.connection.ask(this.handle, 'GetChildInfos', arguments).then(function(msg) {
        return msg.qInfos;
    });
};
GenericObject.prototype.createChild = function(Prop, PropForThis) {
    return this.connection.ask(this.handle, 'CreateChild', arguments);
};
GenericObject.prototype.destroyChild = function(Id, PropForThis) {
    return this.connection.ask(this.handle, 'DestroyChild', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
GenericObject.prototype.destroyAllChildren = function(PropForThis) {
    return this.connection.ask(this.handle, 'DestroyAllChildren', arguments);
};
GenericObject.prototype.setChildArrayOrder = function(Ids) {
    return this.connection.ask(this.handle, 'SetChildArrayOrder', arguments);
};
GenericObject.prototype.getLinkedObjects = function() {
    return this.connection.ask(this.handle, 'GetLinkedObjects', arguments).then(function(msg) {
        return msg.qItems;
    });
};
GenericObject.prototype.copyFrom = function(FromId) {
    return this.connection.ask(this.handle, 'CopyFrom', arguments);
};
GenericObject.prototype.beginSelections = function(Path) {
    return this.connection.ask(this.handle, 'BeginSelections', arguments);
};
GenericObject.prototype.endSelections = function(Accept) {
    return this.connection.ask(this.handle, 'EndSelections', arguments);
};
GenericObject.prototype.resetMadeSelections = function() {
    return this.connection.ask(this.handle, 'ResetMadeSelections', arguments);
};
GenericObject.prototype.embedSnapshotObject = function(Id) {
    return this.connection.ask(this.handle, 'EmbedSnapshotObject', arguments);
};
GenericObject.prototype.getSnapshotObject = function() {
    var connection = this.connection;
    return this.connection.ask(this.handle, 'GetSnapshotObject', arguments).then(function(msg) {
        return connection.create(msg.qReturn);
    });
};
GenericObject.prototype.publish = function() {
    return this.connection.ask(this.handle, 'Publish', arguments);
};
GenericObject.prototype.unPublish = function() {
    return this.connection.ask(this.handle, 'UnPublish', arguments);
};
module.exports = GenericObject;
},{"events":13,"util":25}],8:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function GenericVariable(connection, handle) {
    this.connection = connection;
    this.handle = handle;
    EventEmitter.call(this);
};
util.inherits(GenericVariable, EventEmitter);

GenericVariable.prototype.getProperties = function() {
    return this.connection.ask(this.handle, 'GetProperties', arguments).then(function(msg) {
        return msg.qProp;
    });
};

// API has been reworked in 2.1 to align with the other generic objects structure
GenericVariable.prototype.applyPatches = function(Patches) {
    return this.connection.ask(this.handle, 'ApplyPatches', arguments);
};
GenericVariable.prototype.getInfo = function() {
    return this.connection.ask(this.handle, 'GetNxProperties', arguments).then(function(msg) {
        return msg.qResult;
    });
};
GenericVariable.prototype.getLayout = function() {
    return this.connection.ask(this.handle, 'GetLayout', arguments).then(function(msg) {
        return msg.qLayout;
    });
};
GenericVariable.prototype.publish = function() {
    return this.connection.ask(this.handle, 'Publish', arguments);
};
GenericVariable.prototype.unPublish = function() {
    return this.connection.ask(this.handle, 'UnPublish', arguments);
};
GenericVariable.prototype.setProperties = function(Prop) {
    return this.connection.ask(this.handle, 'SetProperties', arguments);
};
GenericVariable.prototype.setDualValue  = function(Text, Num) {
    return this.connection.ask(this.handle, 'SetDualValue', arguments);
};
GenericVariable.prototype.setNumValue  = function(Value) {
    return this.connection.ask(this.handle, 'SetNumValue', arguments);
};
GenericVariable.prototype.setStringValue  = function(String) {
    return this.connection.ask(this.handle, 'SetStringValue', arguments);
};

// Deprecated Methods
GenericVariable.prototype.forceContent = function() {
    return new Error('This method was deprecated in 2.1. Replaced with SetProperties');
};
GenericVariable.prototype.getContent = function() {
    return new Error('This method was deprecated in 2.1. Replaced with GetProperties');
};
GenericVariable.prototype.getNxProperties = function() {
    return new Error('This method was deprecated in 2.1. Replaced with GetProperties');
};
GenericVariable.prototype.getRawContent = function() {
    return new Error('This method was deprecated in 2.1. Replaced with GetProperties');
};
GenericVariable.prototype.setContent = function() {
    return new Error('This method was deprecated in 2.1. Replaced with SetProperties');
};
GenericVariable.prototype.setNxProperties = function() {
    return new Error('This method was deprecated in 2.1. Replaced with GetProperties');
};
module.exports = GenericVariable;
},{"events":13,"util":25}],9:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function Global(connection, handle) {
    this.connection = connection;
    this.handle = handle;
    EventEmitter.call(this);
};
util.inherits(Global, EventEmitter);

Global.prototype.abortAll = function() {
    return this.connection.ask(this.handle, 'AbortAll', arguments);
};
Global.prototype.getProgress = function(RequestId) {
    return this.connection.ask(this.handle, 'GetProgress', arguments).then(function(msg) {
        return msg.qProgressData;
    });
};
Global.prototype.openDoc = function(DocName, UserName, Password, Serial, NoData) {
    var connection = this.connection;
    return this.connection.ask(this.handle, 'OpenDoc', arguments).then(function(msg) {
        return connection.create(msg.qReturn);
    });
};
Global.prototype.oSName = function() {
    return this.connection.ask(this.handle, 'OSName', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Global.prototype.qTProduct = function() {
    return this.connection.ask(this.handle, 'QTProduct', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Global.prototype.getDocList = function() {
    return this.connection.ask(this.handle, 'GetDocList', arguments).then(function(msg) {
        return msg.qDocList;
    });
};
Global.prototype.getInteract = function(RequestId) {
    return this.connection.ask(this.handle, 'GetInteract', arguments);
};
Global.prototype.getUniqueID = function() {
    return this.connection.ask(this.handle, 'GetUniqueID', arguments).then(function(msg) {
        return msg.qUniqueID;
    });
};
Global.prototype.interactDone = function(RequestId, Def) {
    return this.connection.ask(this.handle, 'InteractDone', arguments);
};

Global.prototype.getAuthenticatedUser = function() {
    return this.connection.ask(this.handle, 'GetAuthenticatedUser', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Global.prototype.getStreamList = function() {
    return this.connection.ask(this.handle, 'GetStreamList', arguments).then(function(msg) {
        return msg.qStreamList;
    });
};
Global.prototype.createDocEx = function(DocName, UserName, Password, Serial, LocalizedScriptMainSection) {
    var connection = this.connection;
    return this.connection.ask(this.handle, 'CreateDocEx', arguments).then(function(msg) {
        return connection.create(msg.qReturn);
    });
};
Global.prototype.getActiveDoc = function() {
    var connection = this.connection;
    return this.connection.ask(this.handle, 'GetActiveDoc', arguments).then(function(msg) {
        return connection.create(msg.qReturn);
    });
};
Global.prototype.allowCreateApp = function() {
    return this.connection.ask(this.handle, 'AllowCreateApp', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Global.prototype.createApp = function(AppName, LocalizedScriptMainSection) {
    return this.connection.ask(this.handle, 'CreateApp', arguments)
};
Global.prototype.createSessionApp = function() {
    var connection = this.connection;
    return this.connection.ask(this.handle, 'CreateSessionApp', arguments).then(function(msg) {
        return connection.create(msg.qReturn);
    });
};
Global.prototype.createSessionAppFromApp = function(qSrcAppId) {
    var connection = this.connection;
    return this.connection.ask(this.handle, 'CreateSessionAppFromApp', arguments).then(function(msg) {
        return connection.create(msg.qReturn);
    });
};
Global.prototype.deleteApp = function(AppId, FilePath) {
    return this.connection.ask(this.handle, 'DeleteApp', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
Global.prototype.isDesktopMode = function() {
    return this.connection.ask(this.handle, 'IsDesktopMode', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Global.prototype.allowEditMode = function() {
    return this.connection.ask(this.handle, 'AllowEditMode', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Global.prototype.getListOfFunctions = function(Group) {
    return this.connection.ask(this.handle, 'GetListOfFunctions', arguments).then(function(msg) {
        return msg.qFunctionList;
    });
};
Global.prototype.getBNF = function(BnfType) {
    return this.connection.ask(this.handle, 'GetBNF', arguments).then(function(msg) {
        return msg.qBnfDefs;
    });
};
Global.prototype.getLogicalDriveStrings = function() {
    return this.connection.ask(this.handle, 'GetLogicalDriveStrings', arguments).then(function(msg) {
        return msg.qDrives;
    });
};
Global.prototype.getSupportedCodePages = function() {
    return this.connection.ask(this.handle, 'GetSupportedCodePages', arguments).then(function(msg) {
        return msg.qCodePages;
    });
};
Global.prototype.getOdbcDsns = function() {
    return this.connection.ask(this.handle, 'GetOdbcDsns', arguments).then(function(msg) {
        return msg.qOdbcDsns;
    });
};
Global.prototype.getOleDbProviders = function() {
    return this.connection.ask(this.handle, 'GetOleDbProviders', arguments).then(function(msg) {
        return msg.qOleDbProviders;
    });
};
Global.prototype.getDatabasesFromConnectStatement = function(ConnectionString, UserName, Password) {
    return this.connection.ask(this.handle, 'GetDatabasesFromConnectStatement', arguments).then(function(msg) {
        return msg.qDatabases;
    });
};
Global.prototype.getCustomConnectors = function(ReloadList) {
    return this.connection.ask(this.handle, 'GetCustomConnectors', arguments).then(function(msg) {
        return msg.qConnectors;
    });
};
Global.prototype.cancelReload = function() {
    return this.connection.ask(this.handle, 'CancelReload', arguments);
};
Global.prototype.cancelRequest = function(RequestId) {
    return this.connection.ask(this.handle, 'CancelRequest', arguments);
};
Global.prototype.configureReload = function(CancelOnScriptError, UseErrorData, InteractOnError) {
    return this.connection.ask(this.handle, 'ConfigureReload', arguments);
};
Global.prototype.shutdownProcess = function() {
    return this.connection.ask(this.handle, 'ShutdownProcess', arguments);
};
Global.prototype.reloadExtensionList = function() {
    return this.connection.ask(this.handle, 'ReloadExtensionList', arguments);
};
Global.prototype.getDefaultAppFolder = function() {
    return this.connection.ask(this.handle, 'GetDefaultAppFolder', arguments).then(function(msg) {
        return msg.qPath;
    });
};
Global.prototype.getFolderItemsForPath = function(Path) {
    return this.connection.ask(this.handle, 'GetFolderItemsForPath', arguments).then(function(msg) {
        return msg.qFolderItems;
    });
};
Global.prototype.getFunctions = function(Group) {
    return this.connection.ask(this.handle, 'GetFunctions', arguments).then(function(msg) {
        return msg.qFunctions;
    });
};
Global.prototype.copyApp = function(TargetAppId, SrcAppId, Ids) {
    return this.connection.ask(this.handle, 'CopyApp', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
Global.prototype.importApp = function(AppId, SrcPath, Ids) {
    console.log('It is not recommended to use this method to import an app. Use the Qlik Sense Repository Service API instead. In addition to importing the app, the Qlik Sense Repository Service API migrates the app if needed.');
    return this.connection.ask(this.handle, 'ImportApp', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
Global.prototype.importAppEx = function(AppId, SrcPath, Ids, qExcludeConnections) {
    console.log('It is not recommended to use this method to import an app. Use the Qlik Sense Repository Service API instead. In addition to importing the app, the Qlik Sense Repository Service API migrates the app if needed.');
    return this.connection.ask(this.handle, 'ImportAppEx', arguments);
};
Global.prototype.exportApp = function(TargetPath, SrcAppId, Ids) {
    return this.connection.ask(this.handle, 'ExportApp', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
Global.prototype.replaceAppFromID = function(TargetAppId, SrcAppId, Ids) {
    return this.connection.ask(this.handle, 'ReplaceAppFromID', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
Global.prototype.isValidConnectionString = function(Connection) {
    return this.connection.ask(this.handle, 'IsValidConnectionString', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Global.prototype.oSVersion = function() {
    return this.connection.ask(this.handle, 'OSVersion', arguments).then(function(msg) {
        return msg.qReturn;
    });
};

// New methods in 2.0
Global.prototype.getAppEntry = function(AppId) {
    return this.connection.ask(this.handle, 'GetAppEntry', arguments).then(function(msg) {
        return msg.qEntry;
    });
};
Global.prototype.productVersion = function() {
    return this.connection.ask(this.handle, 'ProductVersion', arguments).then(function(msg) {
        return msg.qReturn;
    });
};

// Deprecated Methos
Global.prototype.isPersonalMode = function() {
    return new Error('This method was removed in 2.0');
};
Global.prototype.replaceAppFromPath = function(TargetAppId, SrcAppId, Ids) {
    return new Error('This method was removed in 2.1. Use ReplaceAppFromID method instead.');
};
Global.prototype.qvVersion = function() {
    return new Error('This method was removed in 2.0. Use ProductVersion method instead.');
};

module.exports = Global;
},{"events":13,"util":25}],10:[function(require,module,exports){
"use strict";

// rawAsap provides everything we need except exception management.
var rawAsap = require("./raw");
// RawTasks are recycled to reduce GC churn.
var freeTasks = [];
// We queue errors to ensure they are thrown in right order (FIFO).
// Array-as-queue is good enough here, since we are just dealing with exceptions.
var pendingErrors = [];
var requestErrorThrow = rawAsap.makeRequestCallFromTimer(throwFirstError);

function throwFirstError() {
    if (pendingErrors.length) {
        throw pendingErrors.shift();
    }
}

/**
 * Calls a task as soon as possible after returning, in its own event, with priority
 * over other events like animation, reflow, and repaint. An error thrown from an
 * event will not interrupt, nor even substantially slow down the processing of
 * other events, but will be rather postponed to a lower priority event.
 * @param {{call}} task A callable object, typically a function that takes no
 * arguments.
 */
module.exports = asap;
function asap(task) {
    var rawTask;
    if (freeTasks.length) {
        rawTask = freeTasks.pop();
    } else {
        rawTask = new RawTask();
    }
    rawTask.task = task;
    rawAsap(rawTask);
}

// We wrap tasks with recyclable task objects.  A task object implements
// `call`, just like a function.
function RawTask() {
    this.task = null;
}

// The sole purpose of wrapping the task is to catch the exception and recycle
// the task object after its single use.
RawTask.prototype.call = function () {
    try {
        this.task.call();
    } catch (error) {
        if (asap.onerror) {
            // This hook exists purely for testing purposes.
            // Its name will be periodically randomized to break any code that
            // depends on its existence.
            asap.onerror(error);
        } else {
            // In a web browser, exceptions are not fatal. However, to avoid
            // slowing down the queue of pending tasks, we rethrow the error in a
            // lower priority turn.
            pendingErrors.push(error);
            requestErrorThrow();
        }
    } finally {
        this.task = null;
        freeTasks[freeTasks.length] = this;
    }
};

},{"./raw":11}],11:[function(require,module,exports){
(function (global){
"use strict";

// Use the fastest means possible to execute a task in its own turn, with
// priority over other events including IO, animation, reflow, and redraw
// events in browsers.
//
// An exception thrown by a task will permanently interrupt the processing of
// subsequent tasks. The higher level `asap` function ensures that if an
// exception is thrown by a task, that the task queue will continue flushing as
// soon as possible, but if you use `rawAsap` directly, you are responsible to
// either ensure that no exceptions are thrown from your task, or to manually
// call `rawAsap.requestFlush` if an exception is thrown.
module.exports = rawAsap;
function rawAsap(task) {
    if (!queue.length) {
        requestFlush();
        flushing = true;
    }
    // Equivalent to push, but avoids a function call.
    queue[queue.length] = task;
}

var queue = [];
// Once a flush has been requested, no further calls to `requestFlush` are
// necessary until the next `flush` completes.
var flushing = false;
// `requestFlush` is an implementation-specific method that attempts to kick
// off a `flush` event as quickly as possible. `flush` will attempt to exhaust
// the event queue before yielding to the browser's own event loop.
var requestFlush;
// The position of the next task to execute in the task queue. This is
// preserved between calls to `flush` so that it can be resumed if
// a task throws an exception.
var index = 0;
// If a task schedules additional tasks recursively, the task queue can grow
// unbounded. To prevent memory exhaustion, the task queue will periodically
// truncate already-completed tasks.
var capacity = 1024;

// The flush function processes all tasks that have been scheduled with
// `rawAsap` unless and until one of those tasks throws an exception.
// If a task throws an exception, `flush` ensures that its state will remain
// consistent and will resume where it left off when called again.
// However, `flush` does not make any arrangements to be called again if an
// exception is thrown.
function flush() {
    while (index < queue.length) {
        var currentIndex = index;
        // Advance the index before calling the task. This ensures that we will
        // begin flushing on the next task the task throws an error.
        index = index + 1;
        queue[currentIndex].call();
        // Prevent leaking memory for long chains of recursive calls to `asap`.
        // If we call `asap` within tasks scheduled by `asap`, the queue will
        // grow, but to avoid an O(n) walk for every task we execute, we don't
        // shift tasks off the queue after they have been executed.
        // Instead, we periodically shift 1024 tasks off the queue.
        if (index > capacity) {
            // Manually shift all values starting at the index back to the
            // beginning of the queue.
            for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
                queue[scan] = queue[scan + index];
            }
            queue.length -= index;
            index = 0;
        }
    }
    queue.length = 0;
    index = 0;
    flushing = false;
}

// `requestFlush` is implemented using a strategy based on data collected from
// every available SauceLabs Selenium web driver worker at time of writing.
// https://docs.google.com/spreadsheets/d/1mG-5UYGup5qxGdEMWkhP6BWCz053NUb2E1QoUTU16uA/edit#gid=783724593

// Safari 6 and 6.1 for desktop, iPad, and iPhone are the only browsers that
// have WebKitMutationObserver but not un-prefixed MutationObserver.
// Must use `global` instead of `window` to work in both frames and web
// workers. `global` is a provision of Browserify, Mr, Mrs, or Mop.
var BrowserMutationObserver = global.MutationObserver || global.WebKitMutationObserver;

// MutationObservers are desirable because they have high priority and work
// reliably everywhere they are implemented.
// They are implemented in all modern browsers.
//
// - Android 4-4.3
// - Chrome 26-34
// - Firefox 14-29
// - Internet Explorer 11
// - iPad Safari 6-7.1
// - iPhone Safari 7-7.1
// - Safari 6-7
if (typeof BrowserMutationObserver === "function") {
    requestFlush = makeRequestCallFromMutationObserver(flush);

// MessageChannels are desirable because they give direct access to the HTML
// task queue, are implemented in Internet Explorer 10, Safari 5.0-1, and Opera
// 11-12, and in web workers in many engines.
// Although message channels yield to any queued rendering and IO tasks, they
// would be better than imposing the 4ms delay of timers.
// However, they do not work reliably in Internet Explorer or Safari.

// Internet Explorer 10 is the only browser that has setImmediate but does
// not have MutationObservers.
// Although setImmediate yields to the browser's renderer, it would be
// preferrable to falling back to setTimeout since it does not have
// the minimum 4ms penalty.
// Unfortunately there appears to be a bug in Internet Explorer 10 Mobile (and
// Desktop to a lesser extent) that renders both setImmediate and
// MessageChannel useless for the purposes of ASAP.
// https://github.com/kriskowal/q/issues/396

// Timers are implemented universally.
// We fall back to timers in workers in most engines, and in foreground
// contexts in the following browsers.
// However, note that even this simple case requires nuances to operate in a
// broad spectrum of browsers.
//
// - Firefox 3-13
// - Internet Explorer 6-9
// - iPad Safari 4.3
// - Lynx 2.8.7
} else {
    requestFlush = makeRequestCallFromTimer(flush);
}

// `requestFlush` requests that the high priority event queue be flushed as
// soon as possible.
// This is useful to prevent an error thrown in a task from stalling the event
// queue if the exception handled by Node.js’s
// `process.on("uncaughtException")` or by a domain.
rawAsap.requestFlush = requestFlush;

// To request a high priority event, we induce a mutation observer by toggling
// the text of a text node between "1" and "-1".
function makeRequestCallFromMutationObserver(callback) {
    var toggle = 1;
    var observer = new BrowserMutationObserver(callback);
    var node = document.createTextNode("");
    observer.observe(node, {characterData: true});
    return function requestCall() {
        toggle = -toggle;
        node.data = toggle;
    };
}

// The message channel technique was discovered by Malte Ubl and was the
// original foundation for this library.
// http://www.nonblocking.io/2011/06/windownexttick.html

// Safari 6.0.5 (at least) intermittently fails to create message ports on a
// page's first load. Thankfully, this version of Safari supports
// MutationObservers, so we don't need to fall back in that case.

// function makeRequestCallFromMessageChannel(callback) {
//     var channel = new MessageChannel();
//     channel.port1.onmessage = callback;
//     return function requestCall() {
//         channel.port2.postMessage(0);
//     };
// }

// For reasons explained above, we are also unable to use `setImmediate`
// under any circumstances.
// Even if we were, there is another bug in Internet Explorer 10.
// It is not sufficient to assign `setImmediate` to `requestFlush` because
// `setImmediate` must be called *by name* and therefore must be wrapped in a
// closure.
// Never forget.

// function makeRequestCallFromSetImmediate(callback) {
//     return function requestCall() {
//         setImmediate(callback);
//     };
// }

// Safari 6.0 has a problem where timers will get lost while the user is
// scrolling. This problem does not impact ASAP because Safari 6.0 supports
// mutation observers, so that implementation is used instead.
// However, if we ever elect to use timers in Safari, the prevalent work-around
// is to add a scroll event listener that calls for a flush.

// `setTimeout` does not call the passed callback if the delay is less than
// approximately 7 in web workers in Firefox 8 through 18, and sometimes not
// even then.

function makeRequestCallFromTimer(callback) {
    return function requestCall() {
        // We dispatch a timeout with a specified delay of 0 for engines that
        // can reliably accommodate that request. This will usually be snapped
        // to a 4 milisecond delay, but once we're flushing, there's no delay
        // between events.
        var timeoutHandle = setTimeout(handleTimer, 0);
        // However, since this timer gets frequently dropped in Firefox
        // workers, we enlist an interval handle that will try to fire
        // an event 20 times per second until it succeeds.
        var intervalHandle = setInterval(handleTimer, 50);

        function handleTimer() {
            // Whichever timer succeeds will cancel both timers and
            // execute the callback.
            clearTimeout(timeoutHandle);
            clearInterval(intervalHandle);
            callback();
        }
    };
}

// This is for `asap.js` only.
// Its name will be periodically randomized to break any code that depends on
// its existence.
rawAsap.makeRequestCallFromTimer = makeRequestCallFromTimer;

// ASAP was originally a nextTick shim included in Q. This was factored out
// into this ASAP package. It was later adapted to RSVP which made further
// amendments. These decisions, particularly to marginalize MessageChannel and
// to capture the MutationObserver implementation in a closure, were integrated
// back into ASAP proper.
// https://github.com/tildeio/rsvp.js/blob/cddf7232546a9cf858524b75cde6f9edf72620a7/lib/rsvp/asap.js

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],12:[function(require,module,exports){

},{}],13:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],14:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],15:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],16:[function(require,module,exports){
'use strict';

module.exports = require('./lib')

},{"./lib":21}],17:[function(require,module,exports){
'use strict';

var asap = require('asap/raw');

function noop() {}

// States:
//
// 0 - pending
// 1 - fulfilled with _value
// 2 - rejected with _value
// 3 - adopted the state of another promise, _value
//
// once the state is no longer pending (0) it is immutable

// All `_` prefixed properties will be reduced to `_{random number}`
// at build time to obfuscate them and discourage their use.
// We don't use symbols or Object.defineProperty to fully hide them
// because the performance isn't good enough.


// to avoid using try/catch inside critical functions, we
// extract them to here.
var LAST_ERROR = null;
var IS_ERROR = {};
function getThen(obj) {
  try {
    return obj.then;
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

function tryCallOne(fn, a) {
  try {
    return fn(a);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}
function tryCallTwo(fn, a, b) {
  try {
    fn(a, b);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

module.exports = Promise;

function Promise(fn) {
  if (typeof this !== 'object') {
    throw new TypeError('Promises must be constructed via new');
  }
  if (typeof fn !== 'function') {
    throw new TypeError('not a function');
  }
  this._45 = 0;
  this._81 = 0;
  this._65 = null;
  this._54 = null;
  if (fn === noop) return;
  doResolve(fn, this);
}
Promise._10 = null;
Promise._97 = null;
Promise._61 = noop;

Promise.prototype.then = function(onFulfilled, onRejected) {
  if (this.constructor !== Promise) {
    return safeThen(this, onFulfilled, onRejected);
  }
  var res = new Promise(noop);
  handle(this, new Handler(onFulfilled, onRejected, res));
  return res;
};

function safeThen(self, onFulfilled, onRejected) {
  return new self.constructor(function (resolve, reject) {
    var res = new Promise(noop);
    res.then(resolve, reject);
    handle(self, new Handler(onFulfilled, onRejected, res));
  });
};
function handle(self, deferred) {
  while (self._81 === 3) {
    self = self._65;
  }
  if (Promise._10) {
    Promise._10(self);
  }
  if (self._81 === 0) {
    if (self._45 === 0) {
      self._45 = 1;
      self._54 = deferred;
      return;
    }
    if (self._45 === 1) {
      self._45 = 2;
      self._54 = [self._54, deferred];
      return;
    }
    self._54.push(deferred);
    return;
  }
  handleResolved(self, deferred);
}

function handleResolved(self, deferred) {
  asap(function() {
    var cb = self._81 === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      if (self._81 === 1) {
        resolve(deferred.promise, self._65);
      } else {
        reject(deferred.promise, self._65);
      }
      return;
    }
    var ret = tryCallOne(cb, self._65);
    if (ret === IS_ERROR) {
      reject(deferred.promise, LAST_ERROR);
    } else {
      resolve(deferred.promise, ret);
    }
  });
}
function resolve(self, newValue) {
  // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
  if (newValue === self) {
    return reject(
      self,
      new TypeError('A promise cannot be resolved with itself.')
    );
  }
  if (
    newValue &&
    (typeof newValue === 'object' || typeof newValue === 'function')
  ) {
    var then = getThen(newValue);
    if (then === IS_ERROR) {
      return reject(self, LAST_ERROR);
    }
    if (
      then === self.then &&
      newValue instanceof Promise
    ) {
      self._81 = 3;
      self._65 = newValue;
      finale(self);
      return;
    } else if (typeof then === 'function') {
      doResolve(then.bind(newValue), self);
      return;
    }
  }
  self._81 = 1;
  self._65 = newValue;
  finale(self);
}

function reject(self, newValue) {
  self._81 = 2;
  self._65 = newValue;
  if (Promise._97) {
    Promise._97(self, newValue);
  }
  finale(self);
}
function finale(self) {
  if (self._45 === 1) {
    handle(self, self._54);
    self._54 = null;
  }
  if (self._45 === 2) {
    for (var i = 0; i < self._54.length; i++) {
      handle(self, self._54[i]);
    }
    self._54 = null;
  }
}

function Handler(onFulfilled, onRejected, promise){
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, promise) {
  var done = false;
  var res = tryCallTwo(fn, function (value) {
    if (done) return;
    done = true;
    resolve(promise, value);
  }, function (reason) {
    if (done) return;
    done = true;
    reject(promise, reason);
  })
  if (!done && res === IS_ERROR) {
    done = true;
    reject(promise, LAST_ERROR);
  }
}

},{"asap/raw":11}],18:[function(require,module,exports){
'use strict';

var Promise = require('./core.js');

module.exports = Promise;
Promise.prototype.done = function (onFulfilled, onRejected) {
  var self = arguments.length ? this.then.apply(this, arguments) : this;
  self.then(null, function (err) {
    setTimeout(function () {
      throw err;
    }, 0);
  });
};

},{"./core.js":17}],19:[function(require,module,exports){
'use strict';

//This file contains the ES6 extensions to the core Promises/A+ API

var Promise = require('./core.js');

module.exports = Promise;

/* Static Functions */

var TRUE = valuePromise(true);
var FALSE = valuePromise(false);
var NULL = valuePromise(null);
var UNDEFINED = valuePromise(undefined);
var ZERO = valuePromise(0);
var EMPTYSTRING = valuePromise('');

function valuePromise(value) {
  var p = new Promise(Promise._61);
  p._81 = 1;
  p._65 = value;
  return p;
}
Promise.resolve = function (value) {
  if (value instanceof Promise) return value;

  if (value === null) return NULL;
  if (value === undefined) return UNDEFINED;
  if (value === true) return TRUE;
  if (value === false) return FALSE;
  if (value === 0) return ZERO;
  if (value === '') return EMPTYSTRING;

  if (typeof value === 'object' || typeof value === 'function') {
    try {
      var then = value.then;
      if (typeof then === 'function') {
        return new Promise(then.bind(value));
      }
    } catch (ex) {
      return new Promise(function (resolve, reject) {
        reject(ex);
      });
    }
  }
  return valuePromise(value);
};

Promise.all = function (arr) {
  var args = Array.prototype.slice.call(arr);

  return new Promise(function (resolve, reject) {
    if (args.length === 0) return resolve([]);
    var remaining = args.length;
    function res(i, val) {
      if (val && (typeof val === 'object' || typeof val === 'function')) {
        if (val instanceof Promise && val.then === Promise.prototype.then) {
          while (val._81 === 3) {
            val = val._65;
          }
          if (val._81 === 1) return res(i, val._65);
          if (val._81 === 2) reject(val._65);
          val.then(function (val) {
            res(i, val);
          }, reject);
          return;
        } else {
          var then = val.then;
          if (typeof then === 'function') {
            var p = new Promise(then.bind(val));
            p.then(function (val) {
              res(i, val);
            }, reject);
            return;
          }
        }
      }
      args[i] = val;
      if (--remaining === 0) {
        resolve(args);
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

Promise.reject = function (value) {
  return new Promise(function (resolve, reject) {
    reject(value);
  });
};

Promise.race = function (values) {
  return new Promise(function (resolve, reject) {
    values.forEach(function(value){
      Promise.resolve(value).then(resolve, reject);
    });
  });
};

/* Prototype Methods */

Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected);
};

},{"./core.js":17}],20:[function(require,module,exports){
'use strict';

var Promise = require('./core.js');

module.exports = Promise;
Promise.prototype['finally'] = function (f) {
  return this.then(function (value) {
    return Promise.resolve(f()).then(function () {
      return value;
    });
  }, function (err) {
    return Promise.resolve(f()).then(function () {
      throw err;
    });
  });
};

},{"./core.js":17}],21:[function(require,module,exports){
'use strict';

module.exports = require('./core.js');
require('./done.js');
require('./finally.js');
require('./es6-extensions.js');
require('./node-extensions.js');
require('./synchronous.js');

},{"./core.js":17,"./done.js":18,"./es6-extensions.js":19,"./finally.js":20,"./node-extensions.js":22,"./synchronous.js":23}],22:[function(require,module,exports){
'use strict';

// This file contains then/promise specific extensions that are only useful
// for node.js interop

var Promise = require('./core.js');
var asap = require('asap');

module.exports = Promise;

/* Static Functions */

Promise.denodeify = function (fn, argumentCount) {
  if (
    typeof argumentCount === 'number' && argumentCount !== Infinity
  ) {
    return denodeifyWithCount(fn, argumentCount);
  } else {
    return denodeifyWithoutCount(fn);
  }
}

var callbackFn = (
  'function (err, res) {' +
  'if (err) { rj(err); } else { rs(res); }' +
  '}'
);
function denodeifyWithCount(fn, argumentCount) {
  var args = [];
  for (var i = 0; i < argumentCount; i++) {
    args.push('a' + i);
  }
  var body = [
    'return function (' + args.join(',') + ') {',
    'var self = this;',
    'return new Promise(function (rs, rj) {',
    'var res = fn.call(',
    ['self'].concat(args).concat([callbackFn]).join(','),
    ');',
    'if (res &&',
    '(typeof res === "object" || typeof res === "function") &&',
    'typeof res.then === "function"',
    ') {rs(res);}',
    '});',
    '};'
  ].join('');
  return Function(['Promise', 'fn'], body)(Promise, fn);
}
function denodeifyWithoutCount(fn) {
  var fnLength = Math.max(fn.length - 1, 3);
  var args = [];
  for (var i = 0; i < fnLength; i++) {
    args.push('a' + i);
  }
  var body = [
    'return function (' + args.join(',') + ') {',
    'var self = this;',
    'var args;',
    'var argLength = arguments.length;',
    'if (arguments.length > ' + fnLength + ') {',
    'args = new Array(arguments.length + 1);',
    'for (var i = 0; i < arguments.length; i++) {',
    'args[i] = arguments[i];',
    '}',
    '}',
    'return new Promise(function (rs, rj) {',
    'var cb = ' + callbackFn + ';',
    'var res;',
    'switch (argLength) {',
    args.concat(['extra']).map(function (_, index) {
      return (
        'case ' + (index) + ':' +
        'res = fn.call(' + ['self'].concat(args.slice(0, index)).concat('cb').join(',') + ');' +
        'break;'
      );
    }).join(''),
    'default:',
    'args[argLength] = cb;',
    'res = fn.apply(self, args);',
    '}',
    
    'if (res &&',
    '(typeof res === "object" || typeof res === "function") &&',
    'typeof res.then === "function"',
    ') {rs(res);}',
    '});',
    '};'
  ].join('');

  return Function(
    ['Promise', 'fn'],
    body
  )(Promise, fn);
}

Promise.nodeify = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    var callback =
      typeof args[args.length - 1] === 'function' ? args.pop() : null;
    var ctx = this;
    try {
      return fn.apply(this, arguments).nodeify(callback, ctx);
    } catch (ex) {
      if (callback === null || typeof callback == 'undefined') {
        return new Promise(function (resolve, reject) {
          reject(ex);
        });
      } else {
        asap(function () {
          callback.call(ctx, ex);
        })
      }
    }
  }
}

Promise.prototype.nodeify = function (callback, ctx) {
  if (typeof callback != 'function') return this;

  this.then(function (value) {
    asap(function () {
      callback.call(ctx, null, value);
    });
  }, function (err) {
    asap(function () {
      callback.call(ctx, err);
    });
  });
}

},{"./core.js":17,"asap":10}],23:[function(require,module,exports){
'use strict';

var Promise = require('./core.js');

module.exports = Promise;
Promise.enableSynchronous = function () {
  Promise.prototype.isPending = function() {
    return this.getState() == 0;
  };

  Promise.prototype.isFulfilled = function() {
    return this.getState() == 1;
  };

  Promise.prototype.isRejected = function() {
    return this.getState() == 2;
  };

  Promise.prototype.getValue = function () {
    if (this._81 === 3) {
      return this._65.getValue();
    }

    if (!this.isFulfilled()) {
      throw new Error('Cannot get a value of an unfulfilled promise.');
    }

    return this._65;
  };

  Promise.prototype.getReason = function () {
    if (this._81 === 3) {
      return this._65.getReason();
    }

    if (!this.isRejected()) {
      throw new Error('Cannot get a rejection reason of a non-rejected promise.');
    }

    return this._65;
  };

  Promise.prototype.getState = function () {
    if (this._81 === 3) {
      return this._65.getState();
    }
    if (this._81 === -1 || this._81 === -2) {
      return 0;
    }

    return this._81;
  };
};

Promise.disableSynchronous = function() {
  Promise.prototype.isPending = undefined;
  Promise.prototype.isFulfilled = undefined;
  Promise.prototype.isRejected = undefined;
  Promise.prototype.getValue = undefined;
  Promise.prototype.getReason = undefined;
  Promise.prototype.getState = undefined;
};

},{"./core.js":17}],24:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],25:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":24,"_process":15,"inherits":14}]},{},[1])(1)
});