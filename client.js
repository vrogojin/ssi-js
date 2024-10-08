const axios = require('axios');
const crypto = require('crypto');
const elliptic = require('elliptic');

// Elliptic curve for signing/verifying
const ec = new elliptic.ec('secp256k1');

// Generate request_id: SHA256(publicKey + state)
function generateRequestId(publicKey, state) {
    const hash = crypto.createHash('sha256');
    hash.update(Buffer.concat([Buffer.from(publicKey, 'hex'), Buffer.from(state, 'utf-8')]));
    return hash.digest('hex');
}

// Sign the payload using EC privateKey
function signPayload(payload, privateKey) {
    const key = ec.keyFromPrivate(privateKey, 'hex');
    const messageHash = crypto.createHash('sha256').update(payload).digest();
    return key.sign(messageHash).toDER('hex');
}

// Register new record (payload + authenticator)
async function registerRecord(serverUrl, privateKey, payload, state) {
    const publicKey = ec.keyFromPrivate(privateKey).getPublic('hex');
    const requestId = generateRequestId(publicKey, state);  // Now correctly uses publicKey + state
    const signature = signPayload(payload, privateKey);
    const authenticator = [signature, publicKey, state];

    const response = await axios.post(serverUrl, {
        jsonrpc: '2.0',
        method: 'register',
        params: {
            request_id: requestId,
            payload,
            authenticator
        },
        id: 1
    });
    
    return {requestId, result: response.data.result};
}

// Retrieve record by request_id
async function getRecord(serverUrl, requestId) {
    const response = await axios.post(serverUrl, {
        jsonrpc: '2.0',
        method: 'get',
        params: {
            request_id: requestId
        },
        id: 1
    });

    return response.data.result;
}

module.exports = {
    generateRequestId,
    registerRecord,
    getRecord
};
