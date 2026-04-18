#!/bin/bash

echo "Checking Task 4 Acceptance Criteria..."
export PATH=$PATH:/Users/wukon/.nvm/versions/node/v24.14.0/bin

# Start Server
cd tiny-wiki/server
node index.js > /tmp/server_task_4.log 2>&1 &
SERVER_PID=$!
sleep 2

# AC-1: Read file check
echo "test content" > ../repository/harness_test.md
RESPONSE=$(curl -s http://localhost:3000/api/file?path=harness_test.md)
if [[ "$RESPONSE" == *"test content"* ]]; then
    echo "✅ AC-1: Successfully read file content."
else
    echo "❌ AC-1: Failed to read file content. Response: $RESPONSE"
    kill $SERVER_PID
    exit 1
fi

# AC-2: Write file check
curl -s -X POST -H "Content-Type: application/json" \
     -d '{"path":"harness_post.md", "content":"post content"}' \
     http://localhost:3000/api/file
     
AUTH_READ=$(curl -s http://localhost:3000/api/file?path=harness_post.md)
if [[ "$AUTH_READ" == *"post content"* ]]; then
    echo "✅ AC-2: Successfully wrote and verified file content."
else
    echo "❌ AC-2: Failed to write/verify file content. Response: $AUTH_READ"
    kill $SERVER_PID
    exit 1
fi

# AC-3: Security check
TRAVERSAL=$(curl -s "http://localhost:3000/api/file?path=../../package.json")
if [[ "$TRAVERSAL" == *"Invalid path"* ]]; then
    echo "✅ AC-3: Path traversal correctly blocked."
else
    echo "❌ AC-3: Path traversal NOT blocked. Response: $TRAVERSAL"
    kill $SERVER_PID
    exit 1
fi

# AC-4: Delete check
curl -s -X DELETE http://localhost:3000/api/file?path=harness_test.md
CHECK_DELETED=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/file?path=harness_test.md)
if [[ "$CHECK_DELETED" == "404" ]]; then
    echo "✅ AC-4: Successfully deleted file."
else
    echo "❌ AC-4: Failed to delete file. Status: $CHECK_DELETED"
    kill $SERVER_PID
    exit 1
fi

kill $SERVER_PID
# Cleanup
rm ../repository/harness_post.md
echo "Task 4 Harness check completed successfully."
