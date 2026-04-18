#!/bin/bash

echo "Checking Task 3 (Iteration 2) Acceptance Criteria..."

# AC-1 & AC-2: Title Extraction Logic Check
if grep -q "pageTitle.value = firstLine.replace" "tiny-wiki/client/src/components/WikiReader.vue"; then
    echo "✅ AC-1/2: Title extraction logic found in WikiReader.vue"
else
    echo "❌ AC-1/2: Title extraction logic missing in WikiReader.vue"
    exit 1
fi

# AC-2: Split Logic Check
if grep -q "lines.slice(1).join" "tiny-wiki/client/src/components/WikiReader.vue"; then
    echo "✅ AC-2: Content splitting logic found in WikiReader.vue"
else
    echo "❌ AC-2: Content splitting logic missing"
    exit 1
fi

# AC-3: UI Element Check
if grep -q "class=\"page-title\"" "tiny-wiki/client/src/components/WikiReader.vue"; then
    echo "✅ AC-3: Page title element found in template"
else
    echo "❌ AC-3: Page title element missing in template"
    exit 1
fi

echo "Task 3 (Iteration 2) Harness check completed successfully."
