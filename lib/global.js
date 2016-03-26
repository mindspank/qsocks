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