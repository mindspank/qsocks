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