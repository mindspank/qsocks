function Global(connection, handle) {
    this.connection = connection;
    this.handle = handle;
}
Global.prototype.abortAll = function() {
    return this.connection.ask(this.handle, 'AbortAll', arguments);
};
Global.prototype.getProgress = function(RequestId) {
    return this.connection.ask(this.handle, 'GetProgress', arguments).then(function(msg) {
        return msg.qProgressData;
    });
};
Global.prototype.openDoc = function(DocName, UserName, Password, Serial) {
    var connection = this.connection;
    return this.connection.ask(this.handle, 'OpenDoc', arguments).then(function(msg) {
        return connection.create(msg.qReturn);
    });
};
Global.prototype.qvVersion = function() {
    return this.connection.ask(this.handle, 'QvVersion', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Global.prototype.oSVersion = function() {
    return this.connection.ask(this.handle, 'OSVersion', arguments).then(function(msg) {
        return msg.qReturn;
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
    return this.connection.ask(this.handle, 'CreateDocEx', arguments);
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
Global.prototype.getInternalTest = function(Key) {
    var connection = this.connection;
    return this.connection.ask(this.handle, 'GetInternalTest', arguments).then(function(msg) {
        return connection.create(msg.qReturn);
    });
};
Global.prototype.getListOfFunctions = function(Group) {
    return this.connection.ask(this.handle, 'GetListOfFunctions', arguments).then(function(msg) {
        return msg.qFunctionList;
    });
};
Global.prototype.testLogging = function(Logger, Verbosity, Steps) {
    return this.connection.ask(this.handle, 'TestLogging', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Global.prototype.testRepositoryLogging = function(Logger, Verbosity, Message) {
    return this.connection.ask(this.handle, 'TestRepositoryLogging', arguments).then(function(msg) {
        return msg.qReturn;
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
Global.prototype.getOdbcDsnList = function() {
    return this.connection.ask(this.handle, 'GetOdbcDsnList', arguments).then(function(msg) {
        return msg.qOdbcDsns;
    });
};
Global.prototype.getOleDbProviderList = function() {
    return this.connection.ask(this.handle, 'GetOleDbProviderList', arguments).then(function(msg) {
        return msg.qOleDbProviders;
    });
};
Global.prototype.getDatabasesFromConnectStatement = function(ConnectionString, UserName, Password) {
    return this.connection.ask(this.handle, 'GetDatabasesFromConnectStatement', arguments).then(function(msg) {
        return msg.qDatabases;
    });
};
Global.prototype.getListOfCustomConnectors = function(ReloadList) {
    return this.connection.ask(this.handle, 'GetListOfCustomConnectors', arguments).then(function(msg) {
        return msg.qCustomConnectors;
    });
};
Global.prototype.cancelReload = function() {
    return this.connection.ask(this.handle, 'CancelReload', arguments);
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
Global.prototype.getDefaultDocumentDirectory = function() {
    return this.connection.ask(this.handle, 'GetDefaultDocumentDirectory', arguments).then(function(msg) {
        return msg.qDirectory;
    });
};
Global.prototype.copyApp = function(TargetAppId, SrcAppId, Ids) {
    return this.connection.ask(this.handle, 'CopyApp', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
Global.prototype.importApp = function(AppId, SrcPath, Ids) {
    return this.connection.ask(this.handle, 'ImportApp', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
Global.prototype.exportApp = function(TargetPath, SrcAppId, Ids) {
    return this.connection.ask(this.handle, 'ExportApp', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
Global.prototype.publishApp = function(AppId, StreamId, Copy, ReplaceId) {
    return this.connection.ask(this.handle, 'PublishApp', arguments).then(function(msg) {
        return msg.qSuccess;
    });
};
Global.prototype.isPersonalMode = function() {
    return this.connection.ask(this.handle, 'IsPersonalMode', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Global.prototype.checkPersonalOutdated = function() {
    return this.connection.ask(this.handle, 'CheckPersonalOutdated', arguments);
};
module.exports = Global;