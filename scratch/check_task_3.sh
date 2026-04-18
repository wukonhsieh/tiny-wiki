#!/bin/bash

echo "Checking Task 3 Acceptance Criteria..."

# AC-1: Component Existence
if [ -f "tiny-wiki/client/src/components/Sidebar.vue" ] && [ -f "tiny-wiki/client/src/components/FileTreeItem.vue" ]; then
    echo "✅ AC-1: Sidebar and FileTreeItem components exist."
else
    echo "❌ AC-1: Components missing."
    exit 1
fi

# AC-2: Logic Check (Recursion)
if grep -q "<FileTreeItem" "tiny-wiki/client/src/components/FileTreeItem.vue"; then
    echo "✅ AC-2: Recursion logic detected in FileTreeItem."
else
    echo "❌ AC-2: Recursive call not found."
    exit 1
fi

# AC-3: State Check (selectedFilePath)
if grep -q "selectedFilePath" "tiny-wiki/client/src/App.vue"; then
    echo "✅ AC-3: State management for selected file detected."
else
    echo "❌ AC-3: selectedFilePath state missing in App.vue."
    exit 1
fi

echo "Task 3 Harness check completed successfully."
