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