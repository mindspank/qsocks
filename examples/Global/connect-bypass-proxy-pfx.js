/**
 * Connects directly to the QIX Engine, bypassing the Qlik Sense Proxy.
 * This method of connecting requires access to the Qlik Sense Certificates in PFX format and uses a service account.
 */

const qsocks = require('qsocks');
const fs = require('fs');

// Read certificates - Assuming certificates are in the working directory
const pfx = fs.readFileSync('client.pfx');
const passphrase = '1234'

const config = {
    host: 'myserver.com',
    port: 4747, // Standard Engine port
    isSecure: true,
    headers: {
        'X-Qlik-User': 'UserDirectory=Internal;UserId=sa_repository' // Passing a user to QIX to authenticate as
    },
    pfx: pfx,
    passphrase: passphrase,
    rejectUnauthorized: false // Don't reject self-signed certs
};

qsocks.Connect(config).then(function(global) {
    // Connected
    console.log(global);
}, function(err) {
    // Something went wrong
    console.log(err);
});
