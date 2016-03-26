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