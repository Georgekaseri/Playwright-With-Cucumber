import { Page, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

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

  // Log summary
  console.log(`Accessibility scan completed for ${context}`);
  if (results.violations.length === 0) {
    console.log(`✅ No accessibility violations found in ${context}`);
  } else {
    console.log(
      `⚠️ ${results.violations.length} accessibility issues found in ${context}`,
    );
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

  // Log summary
  console.log(`Accessibility scan completed for ${context} (informational)`);
  if (results.violations.length === 0) {
    console.log(`✅ No accessibility violations found in ${context}`);
  } else {
    console.log(
      `📊 ${results.violations.length} accessibility issues found in ${context} (for tracking)`,
    );
  }

  console.log(`Accessibility audit complete for ${context} - no test failures`);
  return results;
}
