/**
 * Connects directly to the QIX Engine, bypassing the Qlik Sense Proxy.
 * This method of connecting requires access to the Qlik Sense Certificates and uses a service account.
 */

const qsocks = require('qsocks');
const fs = require('fs');

// Read certificates - Assuming certificates are in the working directory
const client = fs.readFileSync('client.pem');
const client_key = fs.readFileSync('client_key.pem');

const config = {
    host: 'myserver.com',
    port: 4747, // Standard Engine port
    isSecture: true,
    headers: {
        'X-Qlik-User': 'UserDirectory=Internal;UserId=sa_repository' // Passing a user to QIX to authenticate as
    },
    key: client_key,
    cert: client,
    rejectUnauthorized: false // Don't reject self-signed certs
};

qsocks.Connect(config).then(function(global) {
    // Connected
    console.log(global);
}, function(err) {
    // Something went wrong
    console.log(err);
});