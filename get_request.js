const { getRecord } = require('./client.js');

const args = process.argv.slice(2);
if (args.length < 2) {
    console.error('Usage: get_request.js <endpoint_url> <request_id>');
    process.exit(1);
}

const [endpointUrl, requestId] = args;

(async () => {
    try {
        const result = await getRecord(endpointUrl, requestId);
        if (result) {
            console.log('Payload:', result.payload);
            console.log('Authenticator:', result.authenticator);
        } else {
            console.log('No record found for the given request ID.');
        }
    } catch (err) {
        console.error('Error retrieving request:', err.message);
    }
})();
