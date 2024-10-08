
# Unicity-Mock

Unicity-Mock is a lightweight Express.js server that manages an append-only table of non-modifiable key-value records. The key (`request_id`) is a 256-bit hash derived from a public key and a state. The value is a tuple consisting of a 256-bit payload and an authenticator, where the authenticator includes an elliptic curve (EC) signature of the payload. The server provides two JSON-RPC methods:
- `register`: Registers a new record.
- `get`: Retrieves a previously registered record's payload and authenticator.

## Features
- **Immutable records**: The server manages append-only, non-modifiable records.
- **Cryptographic signatures**: Records are validated using elliptic curve signatures.
- **Persistent storage**: Records are stored persistently in a JSON file.

## Requirements

- Node.js (v12+)
- npm

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/yourusername/unicity-mock.git
   cd unicity-mock
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

## Running the Server Locally

1. Start the server:

   ```bash
   node server.js
   ```

   The server will listen on port `3000` by default.

## Example Scenario

This example demonstrates how to register a request and retrieve it using the provided `register_request.js` and `get_request.js` scripts.

### 1. Register a Request

To register a request, use the `register_request.js` script. You will need the following:
- **`endpoint_url`**: The server URL (e.g., `http://localhost:3000`).
- **`secret`**: A string from which the private key will be derived.
- **`state`**: A string representing the state.
- **`transition`**: A string representing the transition.

#### Command:
```bash
node register_request.js <endpoint_url> <secret> <state> <transition>
```

#### Example:
```bash
node register_request.js http://localhost:3000 "my_secret" "state_123" "transition_data"
```

This will generate a `request_id` and register a record on the server.

#### Expected Output:
```bash
Request successfully registered. Request ID: 1a2b3c4d5e6f7g...
```

### 2. Retrieve a Request

To retrieve the registered record, use the `get_request.js` script by providing the server URL and the `request_id`.

#### Command:
```bash
node get_request.js <endpoint_url> <request_id>
```

#### Example:
```bash
node get_request.js http://localhost:3000 1a2b3c4d5e6f7g...
```

#### Expected Output:
```bash
Payload: <payload_data>
Authenticator: [<signature>, <public_key>, <state>]
```

## File Structure

- **`server.js`**: The main Express.js server that handles JSON-RPC requests for registering and retrieving records.
- **`unicity-mock-client.js`**: A client library for interacting with the server's API.
- **`register_request.js`**: A command-line script for registering requests with the server.
- **`get_request.js`**: A command-line script for retrieving registered records from the server.

## License

This project is licensed under the MIT License.
