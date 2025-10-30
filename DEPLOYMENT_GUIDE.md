# 🎯 Complete Deployment Strategy Guide

## 1. 🚀 Staging-First Deployment

### Setup Staging Environment

```yaml
# In .github/workflows/cd.yml
deploy-staging:
  name: Deploy to Staging
  runs-on: ubuntu-latest
  needs: [build, security-scan]
  environment: staging # GitHub Environment
  timeout-minutes: 20
  if: github.ref == 'refs/heads/main' # Only deploy main branch

  steps:
    - name: Download build artifact
      uses: actions/download-artifact@v4
      with:
        name: test-suite-${{ needs.build.outputs.version }}

    - name: Deploy to staging
      run: |
        echo "🚀 Deploying to staging environment"
        # Example deployment commands:
        # - Deploy to staging server
        # - Update staging database
        # - Restart staging services

    - name: Wait for deployment
      run: sleep 30 # Wait for services to start

    - name: Health check staging
      run: |
        # Check if staging is responding
        curl -f https://staging.yourapp.com/health || exit 1
        echo "✅ Staging is healthy"

    - name: Run smoke tests on staging
      run: |
        # Test critical paths on staging
        export TEST_ENV=staging
        npm run test:staging:smoke
```

### **Commands you can use:**

```bash
# Deploy only to staging (safe testing)
git push origin main  # Triggers staging deploy automatically

# Check staging deployment
curl https://staging.yourapp.com/health
```

---

## 2. 🔒 Manual Production Approval

### **What it is:**

Require human approval before production deployment.

### **How to set up in GitHub:**

1. **Go to Repository Settings → Environments**
2. **Create "production" environment**
3. **Add protection rules:**
   - Required reviewers (yourself + team members)
   - Wait timer (optional)
   - Deployment branches (only main/tags)

### **In your workflow:**

```yaml
deploy-production:
  name: Deploy to Production
  runs-on: ubuntu-latest
  needs: [build, deploy-staging]
  environment: production # This triggers approval requirement
  timeout-minutes: 30
  if: startsWith(github.ref, 'refs/tags/v') # Only for version tags

  steps:
    - name: Manual approval checkpoint
      run: |
        echo "⏳ Waiting for manual approval..."
        echo "🔍 Review staging environment before approving"
        echo "📋 Checklist:"
        echo "  - Staging tests passed?"
        echo "  - Performance acceptable?"
        echo "  - No critical bugs found?"
```

### **Approval Process:**

```bash
# 1. Code gets deployed to staging automatically
# 2. You test staging manually
# 3. GitHub sends notification for production approval
# 4. You review and click "Approve" in GitHub Actions
# 5. Production deployment continues
```

---

## 3. 🏷️ Tag-Based Releases

### **What it is:**

Use Git tags to mark release versions and trigger production deployments.

### **Workflow configuration:**

```yaml
on:
  push:
    tags: ["v*"] # Trigger on version tags like v1.0.0

deploy-production:
  if: startsWith(github.ref, 'refs/tags/v') # Only deploy tagged versions
```

### **How to create releases:**

```bash
# 1. Finish your feature work
git add .
git commit -m "feat: add new test scenarios"
git push origin main  # This deploys to staging

# 2. Test staging thoroughly
# 3. Create a release tag
git tag v1.2.3
git push origin v1.2.3  # This triggers production deployment

# 4. Create release notes (optional)
git tag -a v1.2.3 -m "Release v1.2.3: Added login automation tests"
```

### **Semantic Versioning:**

```bash
v1.0.0  # Major release (breaking changes)
v1.1.0  # Minor release (new features)
v1.1.1  # Patch release (bug fixes)
```

---

## 4. ✅ Post-Deploy Verification

### **What it is:**

Automated checks after deployment to ensure everything works.

### **Implementation:**

```yaml
- name: Post-deployment verification
  run: |
    echo "🔍 Running post-deployment checks"

    # 1. Health checks
    curl -f https://yourapp.com/health || exit 1

    # 2. Critical API endpoints
    curl -f https://yourapp.com/api/status || exit 1

    # 3. Database connectivity
    # npm run test:db:connection

    # 4. Run critical path tests
    export TEST_ENV=production
    npm run test:production:critical

    # 5. Performance baseline
    # npm run test:performance:baseline

    echo "✅ All post-deployment checks passed"

- name: Rollback on failure
  if: failure()
  run: |
    echo "❌ Post-deployment verification failed"
    echo "🔄 Initiating automatic rollback"
    # Add rollback logic here
```

### **Test Commands:**

```bash
# Critical path tests (fast, essential features)
npm run test:production:critical

# Health monitoring
curl https://yourapp.com/health

# Performance check
npm run test:performance:baseline
```

---

## 5. 🚨 Emergency Override Option

### **What it is:**

Skip normal approval process for critical hotfixes.

### **Implementation:**

```yaml
on:
  workflow_dispatch: # Manual trigger
    inputs:
      environment:
        description: "Deployment environment"
        required: true
        default: "staging"
        type: choice
        options:
          - staging
          - production
      force_deploy:
        description: "Emergency deploy (skip staging)"
        required: false
        type: boolean
        default: false
      reason:
        description: "Reason for emergency deployment"
        required: true
        type: string

jobs:
  emergency-deploy:
    if: github.event.inputs.force_deploy == 'true'
    steps:
      - name: Emergency deployment warning
        run: |
          echo "🚨 EMERGENCY DEPLOYMENT INITIATED"
          echo "Reason: ${{ github.event.inputs.reason }}"
          echo "⚠️  Skipping normal safety checks"

      - name: Deploy directly to production
        run: |
          # Emergency deployment logic
          echo "🚀 Emergency deploy to production"

      - name: Notify team
        run: |
          # Send Slack/email notification
          echo "📢 Emergency deployment completed"
          echo "🔍 Monitor production closely"
```

### **How to use emergency deploy:**

1. **Go to GitHub Actions → Workflow → Run workflow**
2. **Select:**
   - Environment: `production`
   - Force deploy: `true`
   - Reason: `"Critical security fix for CVE-2024-xxxx"`
3. **Click "Run workflow"**

---

## 🎯 **Complete Workflow Example**

Let me show you how all these work together:

```yaml
name: Complete CD Pipeline

on:
  push:
    branches: [main] # Staging deployment
    tags: ["v*"] # Production deployment
  workflow_dispatch: # Emergency override
    inputs:
      force_deploy:
        type: boolean

jobs:
  # Always run these first
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build and test
        run: npm ci && npm test

  # Automatic staging deployment
  staging:
    needs: build-and-test
    environment: staging
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to staging
        run: echo "Deploy to staging"
      - name: Test staging
        run: npm run test:staging

  # Manual production deployment (requires approval)
  production:
    needs: [build-and-test, staging]
    environment: production # Requires manual approval
    if: startsWith(github.ref, 'refs/tags/v') || github.event.inputs.force_deploy == 'true'
    steps:
      - name: Deploy to production
        run: echo "Deploy to production"
      - name: Verify production
        run: npm run test:production:critical
```

## 🎓 **Practice Exercise**

Try this step-by-step:

1. **Test staging deploy:**

   ```bash
   git checkout -b feature/test-deploy
   echo "// Test change" >> README.md
   git add . && git commit -m "test: staging deploy"
   git push origin feature/test-deploy
   # Create PR, merge to main → triggers staging
   ```

2. **Create a release:**

   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   # Go to GitHub Actions → See production approval request
   ```

3. **Emergency deploy:**
   - Go to GitHub Actions → Run workflow
   - Test emergency override option

Would you like me to help you set up any specific part of this deployment pipeline?
