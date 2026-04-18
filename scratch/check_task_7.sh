#!/bin/bash

echo "Checking Task 7 Acceptance Criteria..."
export PATH=$PATH:/Users/wukon/.nvm/versions/node/v24.14.0/bin

# Start Server
cd tiny-wiki/server
node index.js > /tmp/server_task_7.log 2>&1 &
SERVER_PID=$!
sleep 2

# AC-1: Add folder check
curl -s -X POST -H "Content-Type: application/json" \
     -d '{"path":"new_dir"}' \
     http://localhost:3000/api/directory
     
if [ -d "../repository/new_dir" ]; then
    echo "✅ AC-1: Successfully created new directory."
else
    echo "❌ AC-1: Failed to create directory."
    kill $SERVER_PID
    exit 1
fi

# AC-2: Add file inside folder
curl -s -X POST -H "Content-Type: application/json" \
     -d '{"path":"new_dir/sub.md", "content":"sub"}' \
     http://localhost:3000/api/file
     
if [ -f "../repository/new_dir/sub.md" ]; then
    echo "✅ AC-2: Successfully created file inside directory."
else
    echo "❌ AC-2: Failed to create file in directory."
    kill $SERVER_PID
    exit 1
fi

# AC-3: Delete non-empty directory check
DELETE_RES=$(curl -s -X DELETE http://localhost:3000/api/file?path=new_dir)
if [[ "$DELETE_RES" == *"error"* ]]; then
    echo "✅ AC-3: Blocked deletion of non-empty directory."
else
    echo "❌ AC-3: Non-empty directory deletion was NOT blocked. Response: $DELETE_RES"
    kill $SERVER_PID
    exit 1
fi

# Cleanup
curl -s -X DELETE http://localhost:3000/api/file?path=new_dir/sub.md
curl -s -X DELETE http://localhost:3000/api/file?path=new_dir
kill $SERVER_PID
echo "Task 7 Harness check completed successfully."
