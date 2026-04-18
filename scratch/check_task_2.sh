#!/bin/bash

echo "Checking Task 2 Acceptance Criteria..."
export PATH=$PATH:/Users/wukon/.nvm/versions/node/v24.14.0/bin

# Start Server
cd tiny-wiki/server
node index.js > /tmp/server_task_2.log 2>&1 &
SERVER_PID=$!
sleep 2

# Fetch Tree
RESPONSE=$(curl -s http://localhost:3000/api/tree)

# AC-1: Hierarchical check
if [[ "$RESPONSE" == *"folder1"* ]] && [[ "$RESPONSE" == *"note3.md"* ]]; then
    echo "✅ AC-1: Tree structure contains correctly nested items."
else
    echo "❌ AC-1: Tree structure missing items. Response: $RESPONSE"
    kill $SERVER_PID
    exit 1
fi

# AC-2: Negative check (Exclude hidden/node_modules)
if [[ "$RESPONSE" == *".hidden_file.md"* ]]; then
    echo "❌ AC-2: Hidden file was NOT filtered out."
    kill $SERVER_PID
    exit 1
else
    echo "✅ AC-2: Hidden files correctly filtered."
fi

# AC-3: Filter check (Only .md)
if [[ "$RESPONSE" == *"ignore.txt"* ]]; then
    echo "❌ AC-3: Non-MD file was NOT filtered out."
    kill $SERVER_PID
    exit 1
else
    echo "✅ AC-3: Non-MD files correctly filtered."
fi

kill $SERVER_PID
echo "Task 2 Harness check completed successfully."
