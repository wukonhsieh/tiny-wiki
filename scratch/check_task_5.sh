#!/bin/bash

echo "Checking Task 5 Acceptance Criteria..."

# AC-1: Dependency Check
if [ -d "tiny-wiki/client/node_modules/markdown-it" ] && [ -d "tiny-wiki/client/node_modules/highlight.js" ]; then
    echo "✅ AC-1: Dependencies markdown-it and highlight.js are installed."
else
    echo "❌ AC-1: Dependencies missing."
    exit 1
fi

# AC-2: Component Check (Reader & Highlight)
if [ -f "tiny-wiki/client/src/components/WikiReader.vue" ]; then
    if grep -q "MarkdownIt" "tiny-wiki/client/src/components/WikiReader.vue" && grep -q "hljs" "tiny-wiki/client/src/components/WikiReader.vue"; then
        echo "✅ AC-2: WikiReader.vue exists and uses markdown-it + highlight.js."
    else
        echo "❌ AC-2: Initialization of rendering libraries not found in component."
        exit 1
    fi
else
    echo "❌ AC-2: WikiReader.vue missing."
    exit 1
fi

# AC-3: Integration Check
if grep -q "<WikiReader" "tiny-wiki/client/src/App.vue"; then
    echo "✅ AC-3: WikiReader is integrated into App.vue."
else
    echo "❌ AC-3: WikiReader not found in App.vue."
    exit 1
fi

echo "Task 5 Harness check completed successfully."
