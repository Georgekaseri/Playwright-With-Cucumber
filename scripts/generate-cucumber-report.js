// eslint-disable-next-line @typescript-eslint/no-require-imports
const report = require("multiple-cucumber-html-reporter");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("path");

report.generate({
  jsonDir: path.resolve("reports"),
  reportPath: path.resolve("reports/cucumber-html"),
  pageTitle: "BDD Report",
  reportName: "Cucumber BDD - OrangeHRM",
  displayDuration: true,
  metadata: {
    browser: { name: "chromium", version: "latest" },
    platform: {
      name: process.env.CI ? "GitHub Actions" : "local",
      version: "",
    },
  },
});
console.log(
  "Cucumber HTML report generated at reports/cucumber-html/index.html"
);
