import { Page, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createHtmlReport } from "axe-html-reporter";

export async function runLenientAccessibilityScan(
  page: Page,
  context = "page",
) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();

  console.log(`Accessibility scan completed for ${context}`);

  if (results.violations.length) {
    console.log(
      `${results.violations.length} accessibility issues found in ${context}`,
    );

    const critical = results.violations.filter((v) => v.impact === "critical");
    const serious = results.violations.filter((v) => v.impact === "serious");

    if (critical.length) {
      console.log(`Critical (${critical.length}):`);
      critical.forEach((v) => console.log(`  - ${v.id}: ${v.description}`));
    }

    if (serious.length) {
      console.log(`Serious (${serious.length}):`);
      serious.forEach((v) => console.log(`  - ${v.id}: ${v.description}`));
    }
  } else {
    console.log(`No accessibility violations in ${context}`);
  }

  try {
    createHtmlReport({
      results,
      options: { projectKey: "OrangeHRM" },
      outputDir: "reports/a11y",
      reportFileName: `${context.replace(/\s+/g, "_")}-a11y-report.html`,
    });
    console.log(
      `Accessibility report saved: reports/a11y/${context.replace(/\s+/g, "_")}-a11y-report.html`,
    );
  } catch (error) {
    console.log(`Could not generate HTML report: ${error}`);
  }

  // Only fail on critical issues
  const criticalOnly = results.violations.filter(
    (v) => v.impact === "critical",
  );
  expect(
    criticalOnly.length,
    `${criticalOnly.length} critical accessibility issues detected in ${context}`,
  ).toBe(0);

  return results;
}

export async function runInformationalAccessibilityScan(
  page: Page,
  context = "page",
) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();

  console.log(`Accessibility scan completed for ${context} (informational)`);

  if (results.violations.length) {
    console.log(
      `${results.violations.length} accessibility issues found in ${context} (for tracking)`,
    );

    const critical = results.violations.filter((v) => v.impact === "critical");
    const serious = results.violations.filter((v) => v.impact === "serious");

    if (critical.length) {
      console.log(`Critical (${critical.length}) - would fail in strict mode:`);
      critical.forEach((v) => console.log(`  - ${v.id}: ${v.description}`));
    }

    if (serious.length) {
      console.log(`Serious (${serious.length}) - informational:`);
      serious.forEach((v) => console.log(`  - ${v.id}: ${v.description}`));
    }
  } else {
    console.log(`No accessibility violations in ${context}`);
  }

  try {
    createHtmlReport({
      results,
      options: { projectKey: "OrangeHRM" },
      outputDir: "reports/a11y",
      reportFileName: `${context.replace(/\s+/g, "_")}-a11y-report.html`,
    });
    console.log(
      `Accessibility report saved: reports/a11y/${context.replace(/\s+/g, "_")}-a11y-report.html`,
    );
  } catch (error) {
    console.log(`Could not generate HTML report: ${error}`);
  }

  console.log(`Accessibility audit complete for ${context} - no test failures`);
  return results;
}
