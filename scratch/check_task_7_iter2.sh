#!/bin/bash
# scratch/check_task_7_iter2.sh

echo "Checking Task 7 (Iteration 2) Acceptance Criteria..."

# Check if handleContextMenuAction in Sidebar.vue is implemented (not just a console.log)
if grep -q "createNewFile(path)" tiny-wiki/client/src/components/Sidebar.vue && \
   grep -q "createNewFolder(path)" tiny-wiki/client/src/components/Sidebar.vue; then
    echo "✅ AC-1: handleContextMenuAction implemented in Sidebar.vue"
else
    echo "❌ AC-1: handleContextMenuAction implementation missing or incomplete in Sidebar.vue"
fi

# Check if createNewFile/Folder support targetDir
if grep -q "targetDir =" tiny-wiki/client/src/components/Sidebar.vue; then
    echo "✅ AC-2: createNewFile/Folder support target directory"
else
    echo "❌ AC-2: createNewFile/Folder do not support target directory"
fi

echo "Task 7 (Iteration 2) Harness check completed."
