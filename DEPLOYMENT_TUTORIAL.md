# 🎓 Hands-On Deployment Tutorial

## 🛠️ **Setup Instructions (Do These First)**

### 1. **Set Up GitHub Environments**

Go to: `https://github.com/Georgekaseri/Playwright-With-Cucumber/settings/environments`

**Create two environments:**

#### **Staging Environment:**

```
Name: staging
Protection rules:
- No restrictions (auto-deploy)
- Deployment branches: main branch only
```

#### **Production Environment:**

```
Name: production
Protection rules:
- Required reviewers: Add yourself (Georgekaseri)
- Wait timer: 0 minutes
- Deployment branches: Protected branches and tags only
```

---

## 🚀 **Practice Exercise 1: Staging-First Deployment**

### **Step 1: Make a change**

```bash
# In your terminal
cd /Users/george/Documents/Playwright-Cucumber

# Create a test change
echo "# Deployment Test $(date)" >> DEPLOYMENT_TEST.md
git add DEPLOYMENT_TEST.md
git commit -m "test: staging deployment workflow"
```

### **Step 2: Push to trigger staging**

```bash
git push origin main
```

### **Step 3: Watch the workflow**

1. Go to: `https://github.com/Georgekaseri/Playwright-With-Cucumber/actions`
2. You should see "Continuous Deployment" running
3. Watch these stages:
   - ✅ Build Application
   - ✅ Security Scan
   - ✅ Deploy to Staging
   - ⏸️ Deploy to Production (waiting)

### **What happens:**

- Your CD workflow automatically deploys to staging
- Runs health checks and smoke tests
- Stops before production (no tag created yet)

---

## 🏷️ **Practice Exercise 2: Tag-Based Release**

### **Step 1: Test staging**

After staging deploys, verify it worked:

```bash
# Check your staging environment
echo "✅ Staging looks good, ready for production"
```

### **Step 2: Create a release tag**

```bash
# Create your first release
git tag v1.0.0
git push origin v1.0.0
```

### **Step 3: Watch production approval**

1. Go to GitHub Actions
2. You'll see "Deploy to Production" waiting for approval
3. **Click "Review deployments"**
4. **Check "production"**
5. **Click "Approve and deploy"**

### **What happens:**

- Creates a GitHub release automatically
- Deploys to production after your approval
- Runs post-deployment verification
- Notifies you of completion

---

## 🔒 **Practice Exercise 3: Manual Production Approval**

### **Step 1: Create another change**

```bash
echo "# Another test $(date)" >> DEPLOYMENT_TEST.md
git add DEPLOYMENT_TEST.md
git commit -m "feat: add new test scenario"
git push origin main  # This only deploys to staging
```

### **Step 2: Create release**

```bash
git tag v1.0.1
git push origin v1.0.1
```

### **Step 3: Practice approval process**

1. **DON'T approve immediately**
2. Go to staging environment (if you had one set up)
3. Test manually
4. Check logs in GitHub Actions
5. **Only then approve production**

### **Approval checklist:**

- [ ] Staging tests passed?
- [ ] No errors in logs?
- [ ] Performance looks good?
- [ ] Ready for users?

---

## 🚨 **Practice Exercise 4: Emergency Override**

### **Step 1: Trigger emergency deploy**

1. Go to: `https://github.com/Georgekaseri/Playwright-With-Cucumber/actions`
2. Click "Continuous Deployment" workflow
3. Click "Run workflow" button
4. Fill in:
   - Environment: `production`
   - Force deploy: `✅ true`
   - (This option bypasses normal staging process)

### **Step 2: Add emergency reason**

In a real emergency, you'd specify:

```
Reason: "Critical security patch for authentication bypass"
```

### **When to use:**

- 🚨 Security vulnerabilities
- 🚨 Data corruption bugs
- 🚨 Service outages
- 🚨 Compliance issues

**⚠️ Never use for:**

- Regular features
- Minor bugs
- Performance improvements
- Non-critical updates

---

## ✅ **Practice Exercise 5: Post-Deploy Verification**

Your workflow already includes post-deployment checks. Let's enhance them:

### **Step 1: Add health check script**

```bash
# Create a health check script
cat > scripts/health-check.js << 'EOF'
const https = require('https');

function healthCheck(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ ${url} is healthy`);
        resolve(true);
      } else {
        console.log(`❌ ${url} returned ${res.statusCode}`);
        reject(false);
      }
    }).on('error', (err) => {
      console.log(`❌ ${url} error: ${err.message}`);
      reject(false);
    });
  });
}

// Add your actual endpoints here
const endpoints = [
  'https://httpbin.org/status/200',  // Example endpoint
  'https://httpbin.org/json',       // Another example
];

async function runHealthChecks() {
  console.log('🔍 Running post-deployment health checks...');

  try {
    for (const endpoint of endpoints) {
      await healthCheck(endpoint);
    }
    console.log('✅ All health checks passed!');
    process.exit(0);
  } catch (error) {
    console.log('❌ Health check failed!');
    process.exit(1);
  }
}

runHealthChecks();
EOF

# Make it executable
chmod +x scripts/health-check.js
```

### **Step 2: Add to package.json**

```bash
# Add health check script
npm pkg set scripts.health:check="node scripts/health-check.js"
```

### **Step 3: Test it locally**

```bash
npm run health:check
```

---

## 🎯 **Real-World Workflow Practice**

### **Complete Release Process:**

```bash
# 1. Feature development
git checkout -b feature/login-improvements
echo "# Login improvements" >> src/tests/login.spec.ts
git add . && git commit -m "feat: improve login test coverage"

# 2. Create PR and merge
git push origin feature/login-improvements
# Create PR in GitHub, get review, merge to main

# 3. Automatic staging deploy happens

# 4. Test staging manually
# Visit your staging environment, run tests

# 5. Create production release
git checkout main && git pull
git tag v1.1.0
git push origin v1.1.0

# 6. Approve production deployment
# Go to GitHub Actions, review and approve

# 7. Monitor production
# Check logs, run health checks, monitor for issues
```

---

## 📊 **Monitoring Your Deployments**

### **Key URLs to bookmark:**

1. **Actions**: `https://github.com/Georgekaseri/Playwright-With-Cucumber/actions`
2. **Environments**: `https://github.com/Georgekaseri/Playwright-With-Cucumber/deployments`
3. **Releases**: `https://github.com/Georgekaseri/Playwright-With-Cucumber/releases`

### **What to watch:**

- ✅ **Green builds** = Safe to deploy
- ⏱️ **Pending approval** = Your decision needed
- ❌ **Failed builds** = Don't deploy, investigate
- 🔄 **In progress** = Wait for completion

---

## 🚀 **Next Steps**

1. **Set up GitHub environments** (staging + production)
2. **Try the exercises** in order
3. **Create your first real release** (v1.0.0)
4. **Practice the approval process**
5. **Set up health checks** for your actual application

Would you like me to help you set up any specific part, or do you want to start with Exercise 1?
