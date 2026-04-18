#!/bin/bash

echo "Checking Task 2 (Iteration 2) Acceptance Criteria..."

# AC-1: Flex and min-width Check
if grep -q "flex: 1" "tiny-wiki/client/src/App.vue" && grep -q "min-width: 0" "tiny-wiki/client/src/App.vue"; then
    echo "✅ AC-1: Flexbox responsive properties found in App.vue"
else
    echo "❌ AC-1: Missing responsive properties in App.vue"
    exit 1
fi

# AC-2: Ellipsis Check
if grep -q "text-overflow: ellipsis" "tiny-wiki/client/src/components/FileTreeItem.vue"; then
    echo "✅ AC-2: Text ellipsis style found in FileTreeItem.vue"
else
    echo "❌ AC-2: Missing text-overflow property in FileTreeItem.vue"
    exit 1
fi

# AC-3: Component Width Check
if grep -q "width: 100%" "tiny-wiki/client/src/components/WikiReader.vue"; then
    echo "✅ AC-3: WikiReader width is set to 100%"
else
    echo "❌ AC-3: WikiReader width property missing"
    exit 1
fi

echo "Task 2 (Iteration 2) Harness check completed successfully."
