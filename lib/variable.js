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