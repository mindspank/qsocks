/*
 * Build this file to output a new browserify bundle that can be used in the browser.
 */
var fs = require('fs');
var browserify = require('browserify');

var b = browserify('./qsocks.js', {
	standalone: 'qsocks'
});

b.bundle().pipe(fs.createWriteStream(__dirname + '/qsocks.bundle.js'));