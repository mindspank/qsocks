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