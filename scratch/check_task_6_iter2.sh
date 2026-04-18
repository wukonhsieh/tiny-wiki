#!/bin/bash

echo "Checking Task 6 (Iteration 2) Acceptance Criteria..."

# AC-1: Context Menu component exists
if [ -f "tiny-wiki/client/src/components/ContextMenu.vue" ]; then
    echo "✅ AC-1: ContextMenu.vue component created"
else
    echo "❌ AC-1: ContextMenu.vue missing"
    exit 1
fi

# AC-1: FileTreeItem event binding
if grep -q "@contextmenu.prevent" "tiny-wiki/client/src/components/FileTreeItem.vue"; then
    echo "✅ AC-1: @contextmenu.prevent binding found in FileTreeItem.vue"
else
    echo "❌ AC-1: @contextmenu.prevent binding missing"
    exit 1
fi

# AC-2/3: Sidebar integration
if grep -q "import ContextMenu from './ContextMenu.vue'" "tiny-wiki/client/src/components/Sidebar.vue" && \
   grep -q "handleContextMenu" "tiny-wiki/client/src/components/Sidebar.vue"; then
    echo "✅ AC-2/3: ContextMenu integrated into Sidebar.vue"
else
    echo "❌ AC-2/3: Integration missing in Sidebar.vue"
    exit 1
fi

echo "Task 6 (Iteration 2) Harness check completed successfully."
