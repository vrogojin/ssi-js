const crypto = require('crypto');
const { registerRecord } = require('./client.js');

const args = process.argv.slice(2);
if (args.length < 4) {
    console.error('Usage: register_request.js <endpoint_url> <secret> <state> <transition>');
    process.exit(1);
}

const [endpointUrl, secret, state, transition] = args;

// Derive private key from secret
const secretHash = crypto.createHash('sha256').update(secret).digest('hex');
const payload = crypto.createHash('sha256').update(transition).digest('hex');  // Hash of the transition

(async () => {
    try {
        const { requestId, result } = await registerRecord(endpointUrl, secretHash, payload, state);
        if (result.status === 'success') {
            console.log('Request successfully registered. Request ID:', requestId);
        } else {
            console.error('Failed to register request:', result);
        }
    } catch (err) {
        console.error('Error registering request:', err.message);
    }
})();
