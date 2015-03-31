(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.qsocks = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var doc = require('./lib/doc');
var field = require('./lib/field');
var genericBookmark = require('./lib/GenericBookmark');
var genericDimension = require('./lib/GenericDimension');
var genericMeasure = require('./lib/GenericMeasure');
var genericObject = require('./lib/GenericObject');
var global = require('./lib/global');
var variable = require('./lib/variable');

var WebSocket = require('ws');
var Promise = require("promise");


var qsocks = {
	Doc: doc,
	Field: field,
	GenericBookmark: genericBookmark,
	GenericDimension: genericDimension,
	GenericMeasure: genericMeasure,
	GenericObject: genericObject,
	Global: global,
	Variable: variable
};

function Connect(config) {
	var cfg = {};
	if (config) {
		cfg.mark = config.mark;
		cfg.port = config.port;
		cfg.appname = config.appname || false;
		cfg.host = config.host;
		cfg.origin = config.origin;
		cfg.isSecure = config.isSecure;
		cfg.rejectUnauthorized = config.rejectUnauthorized;
		cfg.headers = config.headers || {};
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

function Connection(config) {
	var mark = (config && config.mark) ? config.mark + ': ' : '';
	var host = (config && config.host) ? config.host : 'localhost';
    var port;

    if(host == 'localhost') {
        port = ':4848';
    } else {
        port = (config && config.port) ? ':' + config.port : '';
    };

	var isSecure = (config && config.isSecure) ? 'wss://' : 'ws://'
	var error = config ? config.error : null;
	var done = config ? config.done : null;

	this.mark = mark;
	this.seqid = 0;
	this.pending = {};
	this.handles = {};

	var self = this;
	var suffix = config.appname ? '/app/' + config.appname : '/app/%3Ftransient%3D';

	this.ws = new WebSocket(isSecure + host + port + suffix, null, config);

	this.ws.onopen = function(ev) {
		if (done) {
			done.call(self, new qsocks.Global(self, -1));
		};
	};
	this.ws.onerror = function(ev) {
		if (error) {
			console.log(ev.message)
		}
		self.ws = null;
	};
	this.ws.onclose = function() {
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
	this.ws.onmessage = function(ev) {
		var text = ev.data;
		var msg = JSON.parse(text);
		var pending = self.pending[msg.id];
		delete self.pending[msg.id];
		if (pending) {
			if (msg.result) {
				pending.resolve(msg.result);
			} else {
				pending.reject(msg.error);
			}
		}
	};
}
Connection.prototype.ask = function(handle, method, args) {
	var connection = this;
	if (!Array.isArray(args)) {
		var array = [];
		for (var ix in args) {
			array[ix] = args[ix];
		}
		args = array;
	}
	var seqid = ++connection.seqid;
	var request = {
		method: method,
		handle: handle,
		params: args,
		id: seqid,
		jsonrpc: '2.0'
	};
	return new Promise(function(resolve, reject) {
		connection.pending[seqid] = {
			resolve: resolve,
			reject: reject
		};
		connection.ws.send(JSON.stringify(request));
	});
};
Connection.prototype.create = function(arg) {
	if (qsocks[arg.qType]) {
		return new qsocks[arg.qType](this, arg.qHandle);
	} else {
		return null;
	}
};
module.exports = qsocks;
},{"./lib/GenericBookmark":2,"./lib/GenericDimension":3,"./lib/GenericMeasure":4,"./lib/GenericObject":5,"./lib/doc":6,"./lib/field":7,"./lib/global":8,"./lib/variable":9,"promise":11,"ws":17}],2:[function(require,module,exports){
function GenericBookmark(connection, handle) {
    this.connection = connection;
    this.handle = handle;
}
GenericBookmark.prototype.getLayout = function() {
    return this.connection.ask(this.handle, 'GetLayout', arguments).then(function(msg) {
        return msg.qLayout;
    });
};
GenericBookmark.prototype.applyPatches = function(Patches) {
    return this.connection.ask(this.handle, 'ApplyPatches', arguments);
};
GenericBookmark.prototype.setProperties = function(Prop) {
    return this.connection.ask(this.handle, 'SetProperties', arguments);
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
GenericBookmark.prototype.publish = function() {
    return this.connection.ask(this.handle, 'Publish', arguments);
};
module.exports = GenericBookmark;
},{}],3:[function(require,module,exports){
 function GenericDimension(connection, handle) {
     this.connection = connection;
     this.handle = handle;
 }
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
 module.exports = GenericDimension;
},{}],4:[function(require,module,exports){
function GenericMeasure(connection, handle) {
    this.connection = connection;
    this.handle = handle;
}
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
module.exports = GenericMeasure;
},{}],5:[function(require,module,exports){
function GenericObject(connection, handle) {
    this.connection = connection;
    this.handle = handle;
}
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
module.exports = GenericObject;
},{}],6:[function(require,module,exports){
function Doc(connection, handle) {
    this.connection = connection;
    this.handle = handle;
}
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
Doc.prototype.getVariable = function(Name) {
    var connection = this.connection;
    return this.connection.ask(this.handle, 'GetVariable', arguments).then(function(msg) {
        return connection.create(msg.qReturn);
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
Doc.prototype.getAllSheets = function() {
    var connection = this.connection;
    return this.connection.ask(this.handle, 'GetAllSheets', arguments).then(function(msg) {
        return connection.create(msg.qSheets);
    });
};
Doc.prototype.createVariable = function(Name) {
    return this.connection.ask(this.handle, 'CreateVariable', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Doc.prototype.removeVariable = function(Name) {
    return this.connection.ask(this.handle, 'RemoveVariable', arguments).then(function(msg) {
        return msg.qReturn;
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
    return this.connection.ask(this.handle, 'CreateObject', arguments);
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
    return this.connection.ask(this.handle, 'CreateDimension', arguments);
};
Doc.prototype.destroyDimension = function(Id) {
    return this.connection.ask(this.handle, 'DestroyDimension', arguments).then(function(msg) {
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
    return this.connection.ask(this.handle, 'CreateMeasure', arguments);
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
        return msg.qErrorList;
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
Doc.prototype.getDatabaseTables = function(Connection, Database, Owner) {
    return this.connection.ask(this.handle, 'GetDatabaseTables', arguments).then(function(msg) {
        return msg.qTables;
    });
};
Doc.prototype.getTableFields = function(Connection, Database, Owner, Table) {
    return this.connection.ask(this.handle, 'GetTableFields', arguments).then(function(msg) {
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
    return this.connection.ask(this.handle, 'CreateBookmark', arguments);
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
Doc.prototype.unPublish = function() {
    return this.connection.ask(this.handle, 'UnPublish', arguments);
};
Doc.prototype.searchAssociations = function(Options, Terms, Page) {
    return this.connection.ask(this.handle, 'SearchAssociations', arguments).then(function(msg) {
        return msg.qResults;
    });
};
Doc.prototype.searchSuggest = function(Options, Terms) {
    return this.connection.ask(this.handle, 'SearchAssociations', arguments).then(function(msg) {
        return msg.qResult;
    });
};
Doc.prototype.selectAssociations = function(Options, Terms, MatchIx, Softlock) {
    return this.connection.ask(this.handle, 'SelectAssociations', arguments);
};
module.exports = Doc;
},{}],7:[function(require,module,exports){
function Field(connection, handle) {
    this.connection = connection;
    this.handle = handle;
}
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
},{}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
function Variable(connection, handle) {
    this.connection = connection;
    this.handle = handle;
}
Variable.prototype.getProperties = function() {
    return this.connection.ask(this.handle, 'GetProperties', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Variable.prototype.getContent = function() {
    return this.connection.ask(this.handle, 'GetContent', arguments).then(function(msg) {
        return msg.qContent;
    });
};
Variable.prototype.getRawContent = function() {
    return this.connection.ask(this.handle, 'GetRawContent', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Variable.prototype.setContent = function(Content, UpdateMRU) {
    return this.connection.ask(this.handle, 'SetContent', arguments).then(function(msg) {
        return msg.qReturn;
    });
};
Variable.prototype.forceContent = function(s, d) {
    return this.connection.ask(this.handle, 'ForceContent', arguments);
};
Variable.prototype.getNxProperties = function() {
    return this.connection.ask(this.handle, 'GetNxProperties', arguments).then(function(msg) {
        return msg.qProperties;
    });
};
Variable.prototype.setNxProperties = function(Properties) {
    return this.connection.ask(this.handle, 'SetNxProperties', arguments);
};
module.exports = Variable;
},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
'use strict';

module.exports = require('./lib/core.js')
require('./lib/done.js')
require('./lib/es6-extensions.js')
require('./lib/node-extensions.js')
},{"./lib/core.js":12,"./lib/done.js":13,"./lib/es6-extensions.js":14,"./lib/node-extensions.js":15}],12:[function(require,module,exports){
'use strict';

var asap = require('asap')

module.exports = Promise;
function Promise(fn) {
  if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new')
  if (typeof fn !== 'function') throw new TypeError('not a function')
  var state = null
  var value = null
  var deferreds = []
  var self = this

  this.then = function(onFulfilled, onRejected) {
    return new self.constructor(function(resolve, reject) {
      handle(new Handler(onFulfilled, onRejected, resolve, reject))
    })
  }

  function handle(deferred) {
    if (state === null) {
      deferreds.push(deferred)
      return
    }
    asap(function() {
      var cb = state ? deferred.onFulfilled : deferred.onRejected
      if (cb === null) {
        (state ? deferred.resolve : deferred.reject)(value)
        return
      }
      var ret
      try {
        ret = cb(value)
      }
      catch (e) {
        deferred.reject(e)
        return
      }
      deferred.resolve(ret)
    })
  }

  function resolve(newValue) {
    try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.')
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then
        if (typeof then === 'function') {
          doResolve(then.bind(newValue), resolve, reject)
          return
        }
      }
      state = true
      value = newValue
      finale()
    } catch (e) { reject(e) }
  }

  function reject(newValue) {
    state = false
    value = newValue
    finale()
  }

  function finale() {
    for (var i = 0, len = deferreds.length; i < len; i++)
      handle(deferreds[i])
    deferreds = null
  }

  doResolve(fn, resolve, reject)
}


function Handler(onFulfilled, onRejected, resolve, reject){
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null
  this.onRejected = typeof onRejected === 'function' ? onRejected : null
  this.resolve = resolve
  this.reject = reject
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, onFulfilled, onRejected) {
  var done = false;
  try {
    fn(function (value) {
      if (done) return
      done = true
      onFulfilled(value)
    }, function (reason) {
      if (done) return
      done = true
      onRejected(reason)
    })
  } catch (ex) {
    if (done) return
    done = true
    onRejected(ex)
  }
}

},{"asap":16}],13:[function(require,module,exports){
'use strict';

var Promise = require('./core.js')
var asap = require('asap')

module.exports = Promise
Promise.prototype.done = function (onFulfilled, onRejected) {
  var self = arguments.length ? this.then.apply(this, arguments) : this
  self.then(null, function (err) {
    asap(function () {
      throw err
    })
  })
}
},{"./core.js":12,"asap":16}],14:[function(require,module,exports){
'use strict';

//This file contains the ES6 extensions to the core Promises/A+ API

var Promise = require('./core.js')
var asap = require('asap')

module.exports = Promise

/* Static Functions */

function ValuePromise(value) {
  this.then = function (onFulfilled) {
    if (typeof onFulfilled !== 'function') return this
    return new Promise(function (resolve, reject) {
      asap(function () {
        try {
          resolve(onFulfilled(value))
        } catch (ex) {
          reject(ex);
        }
      })
    })
  }
}
ValuePromise.prototype = Promise.prototype

var TRUE = new ValuePromise(true)
var FALSE = new ValuePromise(false)
var NULL = new ValuePromise(null)
var UNDEFINED = new ValuePromise(undefined)
var ZERO = new ValuePromise(0)
var EMPTYSTRING = new ValuePromise('')

Promise.resolve = function (value) {
  if (value instanceof Promise) return value

  if (value === null) return NULL
  if (value === undefined) return UNDEFINED
  if (value === true) return TRUE
  if (value === false) return FALSE
  if (value === 0) return ZERO
  if (value === '') return EMPTYSTRING

  if (typeof value === 'object' || typeof value === 'function') {
    try {
      var then = value.then
      if (typeof then === 'function') {
        return new Promise(then.bind(value))
      }
    } catch (ex) {
      return new Promise(function (resolve, reject) {
        reject(ex)
      })
    }
  }

  return new ValuePromise(value)
}

Promise.all = function (arr) {
  var args = Array.prototype.slice.call(arr)

  return new Promise(function (resolve, reject) {
    if (args.length === 0) return resolve([])
    var remaining = args.length
    function res(i, val) {
      try {
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          var then = val.then
          if (typeof then === 'function') {
            then.call(val, function (val) { res(i, val) }, reject)
            return
          }
        }
        args[i] = val
        if (--remaining === 0) {
          resolve(args);
        }
      } catch (ex) {
        reject(ex)
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i])
    }
  })
}

Promise.reject = function (value) {
  return new Promise(function (resolve, reject) { 
    reject(value);
  });
}

Promise.race = function (values) {
  return new Promise(function (resolve, reject) { 
    values.forEach(function(value){
      Promise.resolve(value).then(resolve, reject);
    })
  });
}

/* Prototype Methods */

Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected);
}

},{"./core.js":12,"asap":16}],15:[function(require,module,exports){
'use strict';

//This file contains then/promise specific extensions that are only useful for node.js interop

var Promise = require('./core.js')
var asap = require('asap')

module.exports = Promise

/* Static Functions */

Promise.denodeify = function (fn, argumentCount) {
  argumentCount = argumentCount || Infinity
  return function () {
    var self = this
    var args = Array.prototype.slice.call(arguments)
    return new Promise(function (resolve, reject) {
      while (args.length && args.length > argumentCount) {
        args.pop()
      }
      args.push(function (err, res) {
        if (err) reject(err)
        else resolve(res)
      })
      var res = fn.apply(self, args)
      if (res && (typeof res === 'object' || typeof res === 'function') && typeof res.then === 'function') {
        resolve(res)
      }
    })
  }
}
Promise.nodeify = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments)
    var callback = typeof args[args.length - 1] === 'function' ? args.pop() : null
    var ctx = this
    try {
      return fn.apply(this, arguments).nodeify(callback, ctx)
    } catch (ex) {
      if (callback === null || typeof callback == 'undefined') {
        return new Promise(function (resolve, reject) { reject(ex) })
      } else {
        asap(function () {
          callback.call(ctx, ex)
        })
      }
    }
  }
}

Promise.prototype.nodeify = function (callback, ctx) {
  if (typeof callback != 'function') return this

  this.then(function (value) {
    asap(function () {
      callback.call(ctx, null, value)
    })
  }, function (err) {
    asap(function () {
      callback.call(ctx, err)
    })
  })
}

},{"./core.js":12,"asap":16}],16:[function(require,module,exports){
(function (process){

// Use the fastest possible means to execute a task in a future turn
// of the event loop.

// linked list of tasks (single, with head node)
var head = {task: void 0, next: null};
var tail = head;
var flushing = false;
var requestFlush = void 0;
var isNodeJS = false;

function flush() {
    /* jshint loopfunc: true */

    while (head.next) {
        head = head.next;
        var task = head.task;
        head.task = void 0;
        var domain = head.domain;

        if (domain) {
            head.domain = void 0;
            domain.enter();
        }

        try {
            task();

        } catch (e) {
            if (isNodeJS) {
                // In node, uncaught exceptions are considered fatal errors.
                // Re-throw them synchronously to interrupt flushing!

                // Ensure continuation if the uncaught exception is suppressed
                // listening "uncaughtException" events (as domains does).
                // Continue in next event to avoid tick recursion.
                if (domain) {
                    domain.exit();
                }
                setTimeout(flush, 0);
                if (domain) {
                    domain.enter();
                }

                throw e;

            } else {
                // In browsers, uncaught exceptions are not fatal.
                // Re-throw them asynchronously to avoid slow-downs.
                setTimeout(function() {
                   throw e;
                }, 0);
            }
        }

        if (domain) {
            domain.exit();
        }
    }

    flushing = false;
}

if (typeof process !== "undefined" && process.nextTick) {
    // Node.js before 0.9. Note that some fake-Node environments, like the
    // Mocha test runner, introduce a `process` global without a `nextTick`.
    isNodeJS = true;

    requestFlush = function () {
        process.nextTick(flush);
    };

} else if (typeof setImmediate === "function") {
    // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
    if (typeof window !== "undefined") {
        requestFlush = setImmediate.bind(window, flush);
    } else {
        requestFlush = function () {
            setImmediate(flush);
        };
    }

} else if (typeof MessageChannel !== "undefined") {
    // modern browsers
    // http://www.nonblocking.io/2011/06/windownexttick.html
    var channel = new MessageChannel();
    channel.port1.onmessage = flush;
    requestFlush = function () {
        channel.port2.postMessage(0);
    };

} else {
    // old browsers
    requestFlush = function () {
        setTimeout(flush, 0);
    };
}

function asap(task) {
    tail = tail.next = {
        task: task,
        domain: isNodeJS && process.domain,
        next: null
    };

    if (!flushing) {
        flushing = true;
        requestFlush();
    }
};

module.exports = asap;


}).call(this,require('_process'))
},{"_process":10}],17:[function(require,module,exports){

/**
 * Module dependencies.
 */

var global = (function() { return this; })();

/**
 * WebSocket constructor.
 */

var WebSocket = global.WebSocket || global.MozWebSocket;

/**
 * Module exports.
 */

module.exports = WebSocket ? ws : null;

/**
 * WebSocket constructor.
 *
 * The third `opts` options object gets ignored in web browsers, since it's
 * non-standard, and throws a TypeError if passed to the constructor.
 * See: https://github.com/einaros/ws/issues/227
 *
 * @param {String} uri
 * @param {Array} protocols (optional)
 * @param {Object) opts (optional)
 * @api public
 */

function ws(uri, protocols, opts) {
  var instance;
  if (protocols) {
    instance = new WebSocket(uri, protocols);
  } else {
    instance = new WebSocket(uri);
  }
  return instance;
}

if (WebSocket) ws.prototype = WebSocket.prototype;

},{}]},{},[1])(1)
});