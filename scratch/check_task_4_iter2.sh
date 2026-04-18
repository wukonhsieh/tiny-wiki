#!/bin/bash

echo "Checking Task 4 (Iteration 2) Acceptance Criteria..."

# AC-1: viewMode state check (isEditing)
if grep -q "const isEditing = ref(false)" "tiny-wiki/client/src/App.vue"; then
    echo "✅ AC-1: isEditing state found and initialized to false (Preview mode)"
else
    echo "❌ AC-1: isEditing state missing or incorrectly initialized"
    exit 1
fi

# AC-2: Toggle UI check
if grep -q "class=\"view-toggle\"" "tiny-wiki/client/src/App.vue"; then
    echo "✅ AC-2: View toggle UI element found in App.vue"
else
    echo "❌ AC-2: View toggle UI element missing"
    exit 1
fi

# AC-3: Conditional rendering check
if grep -q "v-if=\"isEditing\"" "tiny-wiki/client/src/App.vue" && grep -q "v-else" "tiny-wiki/client/src/App.vue"; then
    echo "✅ AC-3: Conditional rendering of Editor/Reader found"
else
    echo "❌ AC-3: Conditional rendering missing"
    exit 1
fi

# Cleanup check: WikiReader should not have btn-edit anymore
if grep -q "btn-edit" "tiny-wiki/client/src/components/WikiReader.vue"; then
    echo "❌ Cleanup: btn-edit still exists in WikiReader.vue"
    exit 1
else
    echo "✅ Cleanup: btn-edit removed from WikiReader.vue"
fi

echo "Task 4 (Iteration 2) Harness check completed successfully."
