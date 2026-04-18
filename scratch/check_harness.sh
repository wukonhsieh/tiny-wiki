#!/bin/bash

echo "Checking Task 1 Acceptance Criteria..."

# AC-3: Directory check
if [ -f "tiny-wiki/server/package.json" ] && [ -f "tiny-wiki/client/package.json" ]; then
    echo "✅ AC-3: server and client package.json exist."
else
    echo "❌ AC-3: server or client package.json missing."
    exit 1
fi

# AC-1: Server API check
echo "Starting temporary server to check API..."
export PATH=$PATH:/Users/wukon/.nvm/versions/node/v24.14.0/bin
cd tiny-wiki/server
node index.js > /tmp/server.log 2>&1 &
SERVER_PID=$!
sleep 2

RESPONSE=$(curl -s http://localhost:3000/api/hello)
if [[ "$RESPONSE" == *"hello from server"* ]]; then
    echo "✅ AC-1: Server responded correctly: $RESPONSE"
else
    echo "❌ AC-1: Server response incorrect or timeout. Response: $RESPONSE"
    kill $SERVER_PID
    exit 1
fi

kill $SERVER_PID
echo "Harness check completed successfully."
