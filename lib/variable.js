function Variable(connection, handle) {
    this.connection = connection;
    this.handle = handle;
}
Variable.prototype.getProperties = function() {
    return this.connection.ask(this.handle, 'GetProperties', arguments).then(function(msg) {
        return msg.qReturn;
    });
};

// API has been reworked in 2.1 to align with the other generic objects structure
Variable.prototype.applyPatches = function(Patches) {
    return this.connection.ask(this.handle, 'ApplyPatches', arguments);
};
Variable.prototype.getInfo = function() {
    return this.connection.ask(this.handle, 'GetNxProperties', arguments).then(function(msg) {
        return msg.qResult;
    });
};
Variable.prototype.getLayout = function() {
    return this.connection.ask(this.handle, 'GetLayout', arguments).then(function(msg) {
        return msg.qLayout;
    });
};
Variable.prototype.publish = function() {
    return this.connection.ask(this.handle, 'Publish', arguments);
};
Variable.prototype.unPublish = function() {
    return this.connection.ask(this.handle, 'UnPublish', arguments);
};
Variable.prototype.setProperties = function(Prop) {
    return this.connection.ask(this.handle, 'SetProperties', arguments);
};
Variable.prototype.setDualValue  = function(Text, Num) {
    return this.connection.ask(this.handle, 'SetDualValue', arguments);
};
Variable.prototype.setNumValue  = function(Value) {
    return this.connection.ask(this.handle, 'SetNumValue', arguments);
};
Variable.prototype.setStringValue  = function(String) {
    return this.connection.ask(this.handle, 'SetStringValue', arguments);
};

// Deprecated Methods
Variable.prototype.forceContent = function() {
    return new Error('This method was deprecated in 2.1. Replaced with SetProperties');
};
Variable.prototype.getContent = function() {
    return new Error('This method was deprecated in 2.1. Replaced with GetProperties');
};
Variable.prototype.getNxProperties = function() {
    return new Error('This method was deprecated in 2.1. Replaced with GetProperties');
};
Variable.prototype.getRawContent = function() {
    return new Error('This method was deprecated in 2.1. Replaced with GetProperties');
};
Variable.prototype.setContent = function() {
    return new Error('This method was deprecated in 2.1. Replaced with SetProperties');
};
Variable.prototype.setNxProperties = function() {
    return new Error('This method was deprecated in 2.1. Replaced with GetProperties');
};
module.exports = Variable;