# GitHub Repository Secrets Configuration

## Required Repository Secrets

Configure these secrets in your GitHub repository: Settings → Secrets and variables → Actions

### Azure Key Vault Configuration

```bash
# Azure Service Principal for Key Vault access
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
AZURE_TENANT_ID=your-azure-tenant-id

# Azure Key Vault Details
AZURE_KEYVAULT_URL=https://your-keyvault.vault.azure.net/
```

### Environment Variables by Environment

#### Development Environment

```bash
DEV_ORANGEHRM_BASE_URL=https://opensource-demo.orangehrmlive.com
DEV_ORANGEHRM_USERNAME=Admin
DEV_ORANGEHRM_PASSWORD=admin123
DEV_API_BASE_URL=https://api.dev.example.com
DEV_API_KEY=dev-api-key-123
DEV_DB_CONNECTION_STRING=dev-database-connection
```

#### QA Environment

```bash
QA_ORANGEHRM_BASE_URL=https://qa.orangehrmlive.com
QA_ORANGEHRM_USERNAME=QAAdmin
QA_ORANGEHRM_PASSWORD=qa-password-123
QA_API_BASE_URL=https://api.qa.example.com
QA_API_KEY=qa-api-key-456
QA_DB_CONNECTION_STRING=qa-database-connection
```

#### Production Environment

```bash
PROD_ORANGEHRM_BASE_URL=https://prod.orangehrmlive.com
PROD_ORANGEHRM_USERNAME=ProdAdmin
PROD_ORANGEHRM_PASSWORD=secure-prod-password
PROD_API_BASE_URL=https://api.prod.example.com
PROD_API_KEY=prod-api-key-789
PROD_DB_CONNECTION_STRING=prod-database-connection
```

### GitHub Actions Environment Secrets

#### Performance Monitoring

```bash
LIGHTHOUSE_API_KEY=lighthouse-ci-api-key
PERF_BUDGET_FCP=2000
PERF_BUDGET_LCP=4000
PERF_BUDGET_CLS=0.1
```

#### Notification & Reporting

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/...
EMAIL_NOTIFICATION_LIST=team@company.com,qa@company.com
```

## Azure Key Vault Setup

### 1. Create Azure Key Vault

```bash
# Create resource group
az group create --name rg-playwright-secrets --location eastus

# Create Key Vault
az keyvault create \
  --name kv-playwright-tests \
  --resource-group rg-playwright-secrets \
  --location eastus
```

### 2. Create Service Principal

```bash
# Create service principal
az ad sp create-for-rbac \
  --name "playwright-github-actions" \
  --role "Key Vault Secrets User" \
  --scopes /subscriptions/{subscription-id}/resourceGroups/rg-playwright-secrets/providers/Microsoft.KeyVault/vaults/kv-playwright-tests
```

### 3. Store Secrets in Key Vault

```bash
# Development secrets
az keyvault secret set --vault-name kv-playwright-tests --name "dev-orangehrm-username" --value "Admin"
az keyvault secret set --vault-name kv-playwright-tests --name "dev-orangehrm-password" --value "admin123"
az keyvault secret set --vault-name kv-playwright-tests --name "dev-api-key" --value "dev-api-key-123"

# QA secrets
az keyvault secret set --vault-name kv-playwright-tests --name "qa-orangehrm-username" --value "QAAdmin"
az keyvault secret set --vault-name kv-playwright-tests --name "qa-orangehrm-password" --value "qa-password-123"
az keyvault secret set --vault-name kv-playwright-tests --name "qa-api-key" --value "qa-api-key-456"

# Production secrets
az keyvault secret set --vault-name kv-playwright-tests --name "prod-orangehrm-username" --value "ProdAdmin"
az keyvault secret set --vault-name kv-playwright-tests --name "prod-orangehrm-password" --value "secure-prod-password"
az keyvault secret set --vault-name kv-playwright-tests --name "prod-api-key" --value "prod-api-key-789"
```

## Configuration Usage

### In GitHub Actions

```yaml
- name: Fetch Secrets from Azure Key Vault
  run: npm run secrets:fetch:${{ matrix.env }}
  env:
    AZURE_CLIENT_ID: ${{ secrets.AZURE_CLIENT_ID }}
    AZURE_CLIENT_SECRET: ${{ secrets.AZURE_CLIENT_SECRET }}
    AZURE_TENANT_ID: ${{ secrets.AZURE_TENANT_ID }}
    AZURE_KEYVAULT_URL: ${{ secrets.AZURE_KEYVAULT_URL }}

- name: Run Tests with Environment Config
  run: npm run test:${{ matrix.env }}
  env:
    NODE_ENV: ${{ matrix.env }}
```

### Local Development

```bash
# Set environment and fetch secrets
export NODE_ENV=dev
npm run secrets:fetch:dev

# Run tests with dev config
npm run test:dev
```

## Security Best Practices

### 1. Secret Rotation

- Rotate secrets every 90 days
- Use Azure Key Vault secret versioning
- Update GitHub repository secrets accordingly

### 2. Access Control

- Limit Key Vault access to necessary service principals
- Use GitHub environment protection rules
- Require approval for production deployments

### 3. Monitoring

- Enable Azure Key Vault logging
- Monitor secret access patterns
- Set up alerts for unusual access

### 4. Environment Isolation

- Use separate Key Vaults for different environments
- Never share production secrets with non-production environments
- Use different service principals per environment

## Troubleshooting

### Common Issues

1. **Azure Authentication Failed**
   - Verify service principal credentials
   - Check Key Vault access policies
   - Ensure correct tenant ID

2. **Secret Not Found**
   - Verify secret name in Key Vault
   - Check environment prefix in secret name
   - Ensure proper access permissions

3. **GitHub Actions Failing**
   - Verify all repository secrets are configured
   - Check environment variable names
   - Ensure Azure CLI is properly authenticated
