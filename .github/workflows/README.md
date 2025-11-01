# GitHub Workflows Overview

## Active Workflows

### 1. `ci-pr-smoke.yml` - PR Smoke Tests

**Trigger**: Pull requests to `main`
**Purpose**: Fast validation for PRs
**Tests**:

- Lint & Format checks
- UI smoke (@smoke)
- API smoke (@api && @smoke)
- BDD smoke (@smoke)
- A11y smoke (@a11y && @smoke)
- Visual smoke (@visual && @smoke)
  **Timeout**: 25 minutes
  **Features**: Concurrency control, PR comments, artifact uploads

### 2. `ci-main-full.yml` - Full Matrix Tests

**Trigger**: Push to `main`
**Purpose**: Comprehensive testing after merge
**Tests**:

- UI Matrix: 3 browsers × 2 shards = 6 parallel jobs
- BDD full (@regression)
- API full (@api)
- A11y full (@a11y)
- Visual full (@visual)
  **Timeout**: 35 minutes per job
  **Features**: Browser matrix, test sharding, job dependencies

### 3. `main.yml` - Legacy CI (Basic)

**Trigger**: Push to `main` only
**Purpose**: Basic validation (can be retired when matrix is stable)
**Tests**: API + UI @smoke
**Status**: Can be removed once matrix workflows are proven stable

## Inactive Files

### `ci.yml.backup`

- Backup of previous CI configuration
- Can be removed after validation

## Workflow Strategy

- **PRs**: Fast smoke tests only (25min max)
- **Main**: Full comprehensive matrix testing
- **Separation**: Clear separation prevents conflicts and resource waste
Sat Nov  1 14:21:41 GMT 2025: Ready for PR review
