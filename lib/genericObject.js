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