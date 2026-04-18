#!/bin/bash

echo "Checking Task 1 (Iteration 2) Acceptance Criteria..."

# AC-1 & AC-3: Icon Check in FileTreeItem
if grep -q "📁" "tiny-wiki/client/src/components/FileTreeItem.vue" || grep -q "📄" "tiny-wiki/client/src/components/FileTreeItem.vue" || grep -q "🗑️" "tiny-wiki/client/src/components/FileTreeItem.vue"; then
    echo "❌ AC-1/3: Emojis still present in FileTreeItem.vue"
    exit 1
else
    if grep -q "<svg" "tiny-wiki/client/src/components/FileTreeItem.vue"; then
        echo "✅ AC-1/3: SVG icons replaced emojis in FileTreeItem.vue"
    else
        echo "❌ AC-1/3: SVG icons not found in FileTreeItem.vue"
        exit 1
    fi
fi

# AC-2: Refresh Button Check in Sidebar
if grep -q "Refresh" "tiny-wiki/client/src/components/Sidebar.vue" || grep -q "🔄" "tiny-wiki/client/src/components/Sidebar.vue"; then
    echo "❌ AC-2: Refresh button still present in Sidebar.vue"
    exit 1
else
    echo "✅ AC-2: Refresh button removed from Sidebar.vue"
fi

echo "Task 1 (Iteration 2) Harness check completed successfully."
