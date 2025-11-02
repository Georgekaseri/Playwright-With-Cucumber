# 🎭 Playwright + Cucumber Test Automation Framework

A comprehensive end-to-end testing framework combining **Playwright** for browser automation and **Cucumber** for behavior-driven development (BDD), featuring advanced testing patterns and robust CI/CD capabilities.

## 🚀 What We Built

This repository showcases a production-ready test automation framework with:

### 🎯 **Core Framework**
- **Playwright** for cross-browser automation (Chromium, Firefox, WebKit)
- **Cucumber.js** for BDD with Gherkin syntax
- **TypeScript** for type safety and better developer experience
- **Page Object Model (POM)** for maintainable test architecture

### 🧪 **Testing Types & Patterns**
- **🔍 API Testing** - RESTful API validation with custom booking client
- **🎨 Visual Regression Testing** - Screenshot comparison for UI consistency
- **♿ Accessibility Testing** - WCAG compliance with axe-core integration
- **⚡ Performance Testing** - Page load metrics and optimization validation
- **🏥 Health Check Testing** - System monitoring and uptime validation
- **🔗 Integration Testing** - API + UI workflow validation

### 🏗️ **Advanced Architecture**
- **Environment-based Configuration** - Flexible test environment management
- **Custom Utilities** - Reusable API clients and accessibility scanners
- **Comprehensive Reporting** - JSON reports with visual artifacts
- **Mock Integration** - Conditional mocking for flexible testing
- **Tag-based Execution** - Granular test selection with @smoke, @regression, @api tags

### 🔧 **Developer Experience**
- **ESLint** + **Prettier** for code quality and consistency
- **Cross-platform Support** - Works on macOS, Linux, and Windows
- **Multiple Execution Modes** - Headed, headless, debug, and UI modes
- **Comprehensive npm Scripts** - Easy-to-use commands for all test scenarios

## 📁 Project Structure

```
📦 Playwright-Cucumber/
├── 🎭 src/
│   ├── 📄 pages/              # Page Object Models
│   │   ├── login.page.ts      # Login page interactions
│   │   └── dashboard.page.ts  # Dashboard page interactions
│   ├── 🧪 tests/              # Playwright Tests
│   │   ├── login.spec.ts      # Core login functionality
│   │   ├── health.spec.ts     # System health checks
│   │   ├── performance.spec.ts # Performance monitoring
│   │   ├── visual.spec.ts     # Visual regression tests
│   │   ├── login.a11y.spec.ts # Accessibility compliance
│   │   ├── api/               # API-specific tests
│   │   │   └── booking.spec.ts
│   │   └── integration/       # Integration test suites
│   │       └── booking.integration.spec.ts
│   ├── 🥒 bdd/                # Cucumber BDD Implementation
│   │   ├── features/          # Gherkin feature files
│   │   │   ├── login.feature  # Login scenarios
│   │   │   ├── visual.feature # Visual testing scenarios
│   │   │   └── api-booking.feature # API testing scenarios
│   │   ├── steps/             # Step definitions
│   │   │   ├── login.steps.ts
│   │   │   ├── visual.steps.ts
│   │   │   └── api-booking.steps.ts
│   │   └── support/           # BDD support files
│   │       ├── hooks.ts       # Test lifecycle hooks
│   │       └── world.ts       # Shared test context
│   ├── 🌐 api/                # API Clients & Utilities
│   │   └── bookingClient.ts   # RESTful API client
│   ├── ⚙️ config/             # Configuration Management
│   │   └── test-env.ts        # Environment-specific settings
│   └── 🛠️ utils/              # Utility Functions
│       ├── apiUtils.ts        # API helper functions
│       └── a11yUtils.ts       # Accessibility testing utilities
├── 📊 reports/                # Test Reports & Artifacts
├── 📸 artifacts/              # Screenshots & Videos
├── 🔧 scripts/               # Build & Utility Scripts
└── ⚙️ Configuration Files
    ├── playwright.config.ts   # Playwright configuration
    ├── cucumber.config.js     # Cucumber configuration
    ├── .eslintrc.cjs          # ESLint rules
    └── package.json           # Dependencies & scripts
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/Georgekaseri/Playwright-With-Cucumber.git
cd Playwright-Cucumber

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Environment Configuration

Create a `.env` file with your test environment settings:

```env
# Application Under Test
ORANGEHRM_BASE_URL=https://opensource-demo.orangehrmlive.com
ORANGEHRM_USERNAME=Admin
ORANGEHRM_PASSWORD=admin123

# Test Configuration
TEST_ENV=development
HEADLESS=true
```

## 🎯 Running Tests

### 🔥 **Quick Test Commands**

```bash
# Run all tests
npm test

# Run specific test types
npm run test:api              # API tests only
npm run test:visual           # Visual regression tests
npm run test:a11y             # Accessibility tests
npm run test:performance      # Performance tests
npm run test:integration      # Integration tests

# Run with different modes
npm run test:headed           # With browser UI
npm run test:debug            # Debug mode
npm run test:ui               # Playwright UI mode
```

### 🥒 **BDD/Cucumber Tests**

```bash
# Run BDD scenarios
npm run bdd                   # All scenarios
npm run bdd:smoke             # Smoke test scenarios
npm run bdd:regression        # Regression test scenarios
npm run bdd:negative          # Negative test scenarios
npm run bdd:headed            # With browser UI

# Visual regression with BDD
npm run bdd:visual            # Visual tests via BDD
npm run bdd:visual:update     # Update visual baselines
```

### 🏷️ **Tag-based Execution**

```bash
# Run tests by tags
npx playwright test --grep "@smoke"        # Smoke tests
npx playwright test --grep "@api"          # API tests
npx playwright test --grep "@regression"   # Regression tests
npx playwright test --grep "@a11y"         # Accessibility tests
npx playwright test --grep "@visual"       # Visual tests
npx playwright test --grep "@performance"  # Performance tests
```

### 🔧 **Specialized Testing**

```bash
# Health checks
npm run test:health:quick     # Quick health check
npm run test:health:full      # Comprehensive health check

# Environment-specific tests
npm run test:staging          # Staging environment
npm run test:production       # Production monitoring

# Integration testing
npm run test:integration      # Real API + UI integration
npm run test:integration:mock # Mock mode integration

# Update visual baselines
npm run test:update-visual    # Update screenshot baselines
```

## 🧪 Test Types Deep Dive

### 🔍 **API Testing**
- **RESTful API validation** with custom booking client
- **HTTP status code verification**
- **JSON response validation**
- **API + UI integration workflows**

```typescript
// Example: API booking creation
const booking = await createBookingViaAPI();
expect(booking.bookingid).toBeGreaterThan(0);
```

### 🎨 **Visual Regression Testing**
- **Cross-browser screenshot comparison**
- **Responsive design validation**
- **Animation freeze for consistent captures**
- **Automatic baseline management**

```typescript
// Example: Visual comparison
await expect(page).toHaveScreenshot('dashboard.png');
```

### ♿ **Accessibility Testing**
- **WCAG 2.1 AA compliance**
- **Axe-core integration**
- **Keyboard navigation testing**
- **Screen reader compatibility**

```typescript
// Example: Accessibility scan
await runAccessibilityScan(page, 'Login Page');
```

### ⚡ **Performance Testing**
- **Page load time monitoring**
- **Core Web Vitals tracking**
- **Performance budget enforcement**
- **CI-friendly thresholds**

```typescript
// Example: Performance monitoring
const loadTime = Date.now() - startTime;
expect(loadTime).toBeLessThan(5000);
```

### 🔗 **Integration Testing**
- **End-to-end user workflows**
- **API + UI data consistency**
- **Cross-system validation**
- **Mock integration support**

## 🛠️ Development & Maintenance

### 📝 **Code Quality**

```bash
# Linting
npm run lint                  # Check code quality
npm run lint:fix              # Auto-fix issues
npm run lint:ci               # CI-friendly linting

# Formatting
npm run format                # Format all files
npm run format:check          # Check formatting
```

### 📊 **Reporting**

```bash
# Generate reports
npm run bdd:report            # Cucumber HTML report
npx playwright show-report    # Playwright HTML report
```

### 🔧 **Debugging**

```bash
# Debug modes
npm run test:debug            # Step-through debugging
npm run test:ui               # Visual test runner
npm run bdd:headed            # BDD with browser UI
```

## 🏆 Key Features Implemented

### ✨ **Advanced Testing Patterns**
- **✅ Page Object Model** - Maintainable page abstractions
- **✅ Custom Utilities** - Reusable API and accessibility helpers
- **✅ Environment Management** - Flexible configuration system
- **✅ Mock Integration** - Conditional testing modes
- **✅ Tag-based Execution** - Granular test selection

### 🎯 **Comprehensive Test Coverage**
- **✅ Functional Testing** - Core application workflows
- **✅ API Testing** - RESTful service validation
- **✅ Visual Testing** - UI consistency verification
- **✅ Accessibility Testing** - WCAG compliance
- **✅ Performance Testing** - Load time monitoring
- **✅ Integration Testing** - End-to-end workflows

### 🔧 **Developer Experience**
- **✅ TypeScript Support** - Type safety and IntelliSense
- **✅ Multiple Execution Modes** - Headed, headless, debug, UI
- **✅ Comprehensive Scripts** - Easy-to-use npm commands
- **✅ Code Quality Tools** - ESLint + Prettier integration
- **✅ Rich Reporting** - HTML reports with screenshots/videos

### 🎭 **BDD Implementation**
- **✅ Gherkin Features** - Business-readable test scenarios
- **✅ Step Definitions** - Reusable test building blocks
- **✅ Custom World** - Shared test context and utilities
- **✅ Lifecycle Hooks** - Setup and teardown automation

## 🌟 What Makes This Framework Special

1. **🎯 Production-Ready** - Enterprise-grade patterns and practices
2. **🔄 Flexible Architecture** - Easy to extend and maintain
3. **🌐 Cross-Platform** - Works across different operating systems
4. **📊 Rich Reporting** - Comprehensive test results and artifacts
5. **♿ Accessibility-First** - Built-in WCAG compliance testing
6. **⚡ Performance-Aware** - Continuous performance monitoring
7. **🤖 CI/CD Ready** - Optimized for continuous integration
8. **📚 Well-Documented** - Clear examples and comprehensive guides

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Playwright Team** - For the amazing browser automation framework
- **Cucumber.js** - For bringing BDD to JavaScript/TypeScript
- **OrangeHRM** - For providing the demo application for testing
- **Axe-core** - For accessibility testing capabilities

---

**Built with ❤️ using Playwright + Cucumber + TypeScript**
