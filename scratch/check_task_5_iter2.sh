#!/bin/bash

echo "Checking Task 5 (Iteration 2) Acceptance Criteria..."

# AC-1/2: isDirty logic check
if grep -q "const isDirty = computed(() => rawContent.value !== originalContent.value)" "tiny-wiki/client/src/components/WikiEditor.vue"; then
    echo "✅ AC-1/2: isDirty logic found in WikiEditor.vue"
else
    echo "❌ AC-1/2: isDirty logic missing"
    exit 1
fi

# AC-2: UI Check
if grep -q "class=\"notification-bar\"" "tiny-wiki/client/src/components/WikiEditor.vue"; then
    echo "✅ AC-2: Notification bar UI found in WikiEditor.vue"
else
    echo "❌ AC-2: Notification bar UI missing"
    exit 1
fi

# AC-3: Shortcut Check
if grep -q "addEventListener('keydown', handleKeyboard)" "tiny-wiki/client/src/components/WikiEditor.vue" && grep -q "e.key === 's'" "tiny-wiki/client/src/components/WikiEditor.vue"; then
    echo "✅ AC-3: Keyboard shortcut listener (Ctrl+S) found"
else
    echo "❌ AC-3: Keyboard shortcut listener missing"
    exit 1
fi

# AC-3: Reset isDirty on save
if grep -q "originalContent.value = rawContent.value" "tiny-wiki/client/src/components/WikiEditor.vue"; then
    echo "✅ AC-3: originalContent updated after save (resets isDirty)"
else
    echo "❌ AC-3: originalContent not updated after save"
    exit 1
fi

echo "Task 5 (Iteration 2) Harness check completed successfully."
