// eslint-disable-next-line @typescript-eslint/no-require-imports
const report = require("multiple-cucumber-html-reporter");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("path");

report.generate({
  jsonDir: path.resolve("reports/json"),
  reportPath: path.resolve("reports/cucumber-html"),
  pageTitle: "Day 10 Executive BDD Report",
  reportName: "Cucumber BDD Executive Report - Senior SDET Framework",
  displayDuration: true,
  displayReportTime: true,
  metadata: {
    browser: { name: "chromium", version: "latest" },
    device: "Desktop",
    platform: {
      name: process.env.CI ? "GitHub Actions (Ubuntu)" : "Local Development",
      version: process.env.CI ? "ubuntu-latest" : process.platform,
    },
    app: {
      name: "OrangeHRM Test Automation",
      version: "Day 10 - Enterprise Framework",
    },
  },
  customData: {
    title: "Test Execution Summary",
    data: [
      { label: "Project", value: "Playwright + Cucumber Enterprise Framework" },
      { label: "Release", value: "Day 10 - Reporting & Notifications" },
      { label: "Cycle", value: "Senior SDET Bootcamp" },
      { label: "Environment", value: process.env.NODE_ENV || "dev" },
    ],
  },
});
console.log(
  "✅ Executive Cucumber HTML report generated at reports/cucumber-html/index.html"
);
