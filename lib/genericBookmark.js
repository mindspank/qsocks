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