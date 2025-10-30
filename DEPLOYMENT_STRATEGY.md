# Git Workflow & Deployment Strategy

## **Branch Structure**

```
main (production)     ← Production deployments
├── staging           ← Staging/UAT deployments  
├── develop           ← Integration branch
└── feature/*         ← Feature development
```

## **Development Workflow**

### **1. Feature Development**
```bash
# Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/day06-performance

# Work on your feature...
git add .
git commit -m "feat: add performance testing"
git push -u origin feature/day06-performance
```

### **2. Code Review & Integration**
```bash
# Create PR: feature/day06-performance → develop
# After approval and merge:
git checkout develop
git pull origin develop
git branch -d feature/day06-performance  # Clean up local branch
```

### **3. Staging Deployment**
```bash
# Merge develop → staging for UAT
git checkout staging
git pull origin staging
git merge develop
git push origin staging
# This triggers staging deployment automatically
```

### **4. Production Deployment**
```bash
# After staging validation, merge staging → main
git checkout main
git pull origin main
git merge staging
git push origin main
# This triggers production deployment automatically
```

## **Deployment Triggers**

### **Automatic Deployments**
- **Push to `staging`** → Deploys to staging environment
- **Push to `main`** → Deploys to production environment

### **Manual Deployments**
```bash
# Manual staging deployment
gh workflow run deploy.yml -f environment=staging

# Manual production deployment  
gh workflow run deploy.yml -f environment=production

# Skip tests for hotfixes
gh workflow run deploy.yml -f environment=production -f skip_tests=true
```

## **Environment Configuration**

### **Test Environments**
- `npm run test:staging` - Run tests against staging
- `npm run test:production` - Run tests against production  
- `npm run test:health:quick` - Post-deployment health checks

### **Build Environments**
- `npm run build:staging` - Build for staging
- `npm run build:production` - Build for production

## **Branch Protection Rules** (Recommended)

### **Main Branch** (Production)
- ✅ Require pull request reviews (2 reviewers)
- ✅ Require status checks (CI must pass)
- ✅ Require branches to be up to date
- ✅ Restrict pushes to main branch
- ✅ Require administrators to follow rules

### **Staging Branch**
- ✅ Require pull request reviews (1 reviewer)
- ✅ Require status checks (CI must pass)
- ✅ Allow force pushes for hotfixes

### **Develop Branch**
- ✅ Require status checks (CI must pass)
- ✅ Delete head branches after merge

## **Deployment Checklist**

### **Pre-Deployment**
- [ ] All tests passing on feature branch
- [ ] Code reviewed and approved
- [ ] Feature branch merged to develop
- [ ] Integration tests passing on develop

### **Staging Deployment**
- [ ] Merge develop → staging
- [ ] Staging deployment successful
- [ ] UAT/Manual testing completed
- [ ] Performance tests passing
- [ ] Accessibility tests passing

### **Production Deployment**
- [ ] Staging validation complete
- [ ] Merge staging → main
- [ ] Production deployment successful
- [ ] Health checks passing
- [ ] Monitoring alerts configured
- [ ] Team notified of deployment

## **Rollback Strategy**

### **Quick Rollback**
```bash
# If production has issues, quickly rollback
git checkout main
git revert HEAD  # Revert last commit
git push origin main
# This triggers automatic rollback deployment
```

### **Hotfix Workflow**
```bash
# For urgent production fixes
git checkout main
git checkout -b hotfix/critical-bug-fix
# Make minimal fix...
git commit -m "hotfix: critical bug fix"
git push -u origin hotfix/critical-bug-fix

# Fast-track PR: hotfix → main (skip develop)
# Deploy with skip tests if needed:
gh workflow run deploy.yml -f environment=production -f skip_tests=true
```

## **Monitoring & Notifications**

### **Deployment Status**
- GitHub Actions status badges
- Slack/Teams notifications
- Email alerts for failed deployments

### **Health Monitoring**
- Post-deployment health checks
- Performance regression detection
- Accessibility compliance monitoring
- API endpoint availability checks

---

## **Quick Reference Commands**

```bash
# Current workflow
git checkout feature/day05-accessibility  # Your current branch
git add .
git commit -m "day05: accessibility improvements"
git push origin feature/day05-accessibility

# Next steps
git checkout main
git pull origin main
git checkout -b develop        # Create develop branch
git push -u origin develop

git checkout -b staging        # Create staging branch  
git push -u origin staging
```