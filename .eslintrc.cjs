module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "playwright"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:playwright/recommended",
    "prettier",
  ],
  env: { node: true, es2022: true },
  ignorePatterns: ["dist", "playwright-report", "test-results"],
  rules: {
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "error", // Make this an error to catch it
    "playwright/expect-expect": "off", // Disabled - we use assertions in page object methods
    "playwright/no-networkidle": "error", // Make networkidle usage an error
    "playwright/no-standalone-expect": "error", // Make standalone expect an error
  },
};
