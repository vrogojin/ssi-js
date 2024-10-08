const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const fs = require('fs');
const { JSONRPCServer } = require('json-rpc-2.0');
const elliptic = require('elliptic');

// Elliptic curve for signing/verifying
const ec = new elliptic.ec('secp256k1');

// Initialize the JSON-RPC server
const jsonRpcServer = new JSONRPCServer();

// Persistent storage file
const STORAGE_FILE = './records.json';

// Load records from the file, or initialize an empty object
let records = {};
if (fs.existsSync(STORAGE_FILE)) {
    records = JSON.parse(fs.readFileSync(STORAGE_FILE));
}

// Helper: Verify authenticator
function verifyAuthenticator(request_id, payload, authenticator) {
    const [signature, publicKeyHex, state] = authenticator;

    // Verify request_id is correct: SHA256(publicKey + state)
    const hash = crypto.createHash('sha256');
    hash.update(Buffer.concat([Buffer.from(publicKeyHex, 'hex'), Buffer.from(state, 'utf-8')]));
    const expectedRequestId = hash.digest('hex');

    if (expectedRequestId !== request_id) {
        return false;
    }

    // Verify the signature on the payload
    const publicKey = ec.keyFromPublic(publicKeyHex, 'hex');
    const messageHash = crypto.createHash('sha256').update(payload).digest();

    return publicKey.verify(messageHash, signature);
}

// RPC Method: register (add a new record)
jsonRpcServer.addMethod('register', ({ request_id, payload, authenticator }) => {
    console.log(JSON.stringify({ request_id, payload, authenticator }));
    if (records[request_id]) {
	if(records[request_id].payload == payload){
	    console.log('OK');
	    return { status: 'success'};
	}
        throw new Error('Request ID already exists');
    }

    if (!verifyAuthenticator(request_id, payload, authenticator)) {
        throw new Error('Invalid authenticator');
    }

    // Store record (append-only)
    records[request_id] = { payload, authenticator };

    // Persist records to file
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(records));

    console.log('OK');
    return { status: 'success' };
});

// RPC Method: get (retrieve payload by request_id)
jsonRpcServer.addMethod('get', ({ request_id }) => {
    return records[request_id];
});

const app = express();
app.use(bodyParser.json());

app.post('/', (req, res) => {
    jsonRpcServer.receive(req.body).then((jsonRpcResponse) => {
        res.json(jsonRpcResponse);
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`unicity-mock listening on port ${PORT}`);
});
