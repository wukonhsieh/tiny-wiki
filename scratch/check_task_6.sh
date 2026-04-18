#!/bin/bash

echo "Checking Task 6 Acceptance Criteria..."

# AC-1: Component Existence
if [ -f "tiny-wiki/client/src/components/WikiEditor.vue" ] && [ -f "tiny-wiki/client/src/utils/markdown.js" ]; then
    echo "✅ AC-1: WikiEditor and markdown utility exist."
else
    echo "❌ AC-1: Files missing."
    exit 1
fi

# AC-2: Real-time Sync Check (computed property or watch)
if grep -q "computed(() => renderMarkdown(rawContent.value))" "tiny-wiki/client/src/components/WikiEditor.vue"; then
    echo "✅ AC-2: Real-time sync logic via computed property found."
else
    echo "❌ AC-2: Real-time sync logic missing."
    exit 1
fi

# AC-3: API Save Check (POST /api/file)
if grep -q "method: 'POST'" "tiny-wiki/client/src/components/WikiEditor.vue" && grep -q "/api/file" "tiny-wiki/client/src/components/WikiEditor.vue"; then
    echo "✅ AC-3: Save logic with POST request found."
else
    echo "❌ AC-3: Save API call not found."
    exit 1
fi

echo "Task 6 Harness check completed successfully."
