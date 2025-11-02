#!/bin/bash
# Update visual regression baselines for CI (Linux) environment

set -e

echo "🔄 Updating visual regression baselines for Linux CI environment..."

# Create the snapshots directory if it doesn't exist
mkdir -p src/__screenshots__/visual.spec.ts-snapshots

# Run visual tests in update mode to generate new baselines
echo "📸 Generating new baseline screenshots..."
npx playwright test --update-snapshots --grep "@visual.*@smoke|@smoke.*@visual"

# Check if new baselines were created
if ls src/__screenshots__/visual.spec.ts-snapshots/*-chromium-linux.png 1> /dev/null 2>&1; then
    echo "✅ Linux baselines created successfully:"
    ls -la src/__screenshots__/visual.spec.ts-snapshots/*-chromium-linux.png
else
    echo "⚠️  No Linux baselines were created. Checking for existing baselines..."
    ls -la src/__screenshots__/visual.spec.ts-snapshots/
fi

echo "🏁 Visual baseline update complete!"