# Environment Configuration Template

# Use this structure for managing different environments

# .github/environments/staging.yml

name: staging
url: https://staging.yourapp.com
protection_rules:
required_reviewers: - staging-reviewers-team
wait_timer: 5 # minutes
variables:
ENVIRONMENT: staging
DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}
API_BASE_URL: https://api-staging.yourapp.com
secrets:

- STAGING_DATABASE_URL
- STAGING_API_KEY
- STAGING_OAUTH_CLIENT_SECRET

---

# .github/environments/production.yml

name: production
url: https://yourapp.com
protection_rules:
required_reviewers: - production-reviewers-team - security-team
wait_timer: 30 # minutes
prevent_self_review: true
variables:
ENVIRONMENT: production
DATABASE_URL: ${{ secrets.PRODUCTION_DATABASE_URL }}
API_BASE_URL: https://api.yourapp.com
secrets:

- PRODUCTION_DATABASE_URL
- PRODUCTION_API_KEY
- PRODUCTION_OAUTH_CLIENT_SECRET

---

# Best Practices for Environment Management:

## 1. Environment Protection Rules

# ✅ Require manual approval for production

# ✅ Set wait timers for staged rollouts

# ✅ Prevent self-review for critical environments

# ✅ Limit deployment branches (main, release/\*)

## 2. Secret Management

# ✅ Use environment-specific secrets

# ✅ Rotate secrets regularly

# ✅ Never log secret values

# ✅ Use OIDC for cloud provider authentication

## 3. Environment Variables

# ✅ Set clear naming conventions (ENV_NAME_VARIABLE)

# ✅ Document all required variables

# ✅ Use validation in deployment scripts

# ✅ Provide sensible defaults where possible

## 4. Deployment Strategies

# ✅ Blue-green deployments

# ✅ Canary releases

# ✅ Rolling updates

# ✅ Feature flags for controlled rollouts
