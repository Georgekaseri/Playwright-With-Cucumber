#!/bin/bash
# Script to update visual regression test baselines
# Usage: ./scripts/update-visual-baselines.sh

echo "🔄 Updating visual regression test baselines..."

# Run visual tests with update flag
npm run test:update-visual

echo "📸 Visual baselines updated successfully!"
echo "⚠️  Remember to commit the updated screenshots:"
echo "   git add src/__screenshots__/"
echo "   git commit -m 'chore: update visual regression baselines'"

# Show git status to see what changed
git status src/__screenshots__/