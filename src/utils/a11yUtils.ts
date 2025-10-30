import { Page, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { createHtmlReport } from "axe-html-reporter";

/**
 * Basic a11y scan with strict checking
 */
export async function runAccessibilityScan(page: Page, context = "page") {
  const results = await new AxeBuilder({ page }).analyze();

  if (results.violations.length) {
    console.log(
      `⚠️  ${results.violations.length} accessibility issues found in ${context}`
    );
    for (const v of results.violations) {
      console.log(`- ${v.id}: ${v.description} [impact: ${v.impact}]`);
    }
  } else {
    console.log(`✅ No accessibility violations in ${context}`);
  }

  // Generate report
  createHtmlReport({
    results,
    options: { projectKey: "OrangeHRM" },
    outputDir: "reports/a11y",
    reportFileName: `${context.replace(/\s+/g, "_")}-a11y-report.html`,
  });
  console.log(
    `📄 Accessibility report saved: reports/a11y/${context}-a11y-report.html`
  );

  // Fail on critical/serious issues
  const critical = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious"
  );
  expect(
    critical.length,
    `${critical.length} serious/critical a11y issues detected`
  ).toBe(0);

  return results;
}

/**
 * Run accessibility scan with lenient requirements (for external applications)
 * Only fails on critical issues, not serious ones
 */
export async function runLenientAccessibilityScan(
  page: Page,
  context = "page"
) {
  // Run Axe scan
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();

  console.log(`🔍 Accessibility scan completed for ${context}`);

  // Log detailed results
  if (results.violations.length) {
    console.log(
      `⚠️  ${results.violations.length} accessibility issues found in ${context}`
    );

    // Group by impact level
    const critical = results.violations.filter((v) => v.impact === "critical");
    const serious = results.violations.filter((v) => v.impact === "serious");
    const moderate = results.violations.filter((v) => v.impact === "moderate");
    const minor = results.violations.filter((v) => v.impact === "minor");

    if (critical.length) {
      console.log(`🚨 Critical (${critical.length}):`);
      critical.forEach((v) => console.log(`  - ${v.id}: ${v.description}`));
    }

    if (serious.length) {
      console.log(`⚠️  Serious (${serious.length}):`);
      serious.forEach((v) => console.log(`  - ${v.id}: ${v.description}`));
    }

    if (moderate.length) {
      console.log(`📋 Moderate (${moderate.length}):`);
      moderate.forEach((v) => console.log(`  - ${v.id}: ${v.description}`));
    }

    if (minor.length) {
      console.log(`📝 Minor (${minor.length}):`);
      minor.forEach((v) => console.log(`  - ${v.id}: ${v.description}`));
    }
  } else {
    console.log(`✅ No accessibility violations in ${context}`);
  }

  // Generate HTML report
  try {
    createHtmlReport({
      results,
      options: { projectKey: "OrangeHRM" },
      outputDir: "reports/a11y",
      reportFileName: `${context.replace(/\s+/g, "_")}-a11y-report.html`,
    });
    console.log(
      `📄 Accessibility report saved: reports/a11y/${context.replace(/\s+/g, "_")}-a11y-report.html`
    );
  } catch (error) {
    console.log(`⚠️  Could not generate HTML report: ${error}`);
  }

  // Only fail on critical issues
  const criticalOnly = results.violations.filter(
    (v) => v.impact === "critical"
  );
  expect(
    criticalOnly.length,
    `${criticalOnly.length} critical a11y issues detected in ${context}`
  ).toBe(0);

  return results;
}

/**
 * Run accessibility scan for informational purposes only (doesn't fail tests)
 * Useful for external sites where we want to track issues but not block CI/CD
 */
export async function runInformationalAccessibilityScan(
  page: Page,
  context = "page"
) {
  // Run Axe scan
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();

  console.log(`🔍 Accessibility scan completed for ${context} (informational)`);

  // Log detailed results
  if (results.violations.length) {
    console.log(
      `📊 ${results.violations.length} accessibility issues found in ${context} (for tracking)`
    );

    // Group by impact level
    const critical = results.violations.filter((v) => v.impact === "critical");
    const serious = results.violations.filter((v) => v.impact === "serious");
    const moderate = results.violations.filter((v) => v.impact === "moderate");
    const minor = results.violations.filter((v) => v.impact === "minor");

    if (critical.length) {
      console.log(
        `🚨 Critical (${critical.length}) - would fail in strict mode:`
      );
      critical.forEach((v) => console.log(`  - ${v.id}: ${v.description}`));
    }

    if (serious.length) {
      console.log(`⚠️  Serious (${serious.length}) - informational:`);
      serious.forEach((v) => console.log(`  - ${v.id}: ${v.description}`));
    }

    if (moderate.length) {
      console.log(`📋 Moderate (${moderate.length}) - informational:`);
      moderate.forEach((v) => console.log(`  - ${v.id}: ${v.description}`));
    }

    if (minor.length) {
      console.log(`📝 Minor (${minor.length}) - informational:`);
      minor.forEach((v) => console.log(`  - ${v.id}: ${v.description}`));
    }
  } else {
    console.log(`✅ No accessibility violations in ${context}`);
  }

  // Generate HTML report
  try {
    createHtmlReport({
      results,
      options: { projectKey: "OrangeHRM" },
      outputDir: "reports/a11y",
      reportFileName: `${context.replace(/\s+/g, "_")}-a11y-report.html`,
    });
    console.log(
      `📄 Accessibility report saved: reports/a11y/${context.replace(/\s+/g, "_")}-a11y-report.html`
    );
  } catch (error) {
    console.log(`⚠️  Could not generate HTML report: ${error}`);
  }

  // Don't fail the test - just log results for tracking
  console.log(
    `📈 Accessibility audit complete for ${context} - no test failures`
  );
  return results;
}
