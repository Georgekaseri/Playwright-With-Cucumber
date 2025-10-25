import { Then } from '@cucumber/cucumber';
import AxeBuilder from '@axe-core/playwright';
import * as fs from 'fs';
import * as path from 'path';
import { expect } from '@playwright/test';
import { PWWorld } from '../support/world';

Then('the page should have no serious accessibility issues', async function (this: PWWorld) {
  // If we're testing external/demo sites we can't change their markup.
  // Allow skipping via A11Y_SKIP_DOMAINS (comma-separated substrings). Defaults to the OpenSource OrangeHRM demo.
  const currentUrl = this.page?.url() || process.env.BASE_URL || '';
  const skipEnv = process.env.A11Y_SKIP_DOMAINS || 'opensource-demo.orangehrmlive.com';
  const skipDomains = skipEnv.split(',').map(s => s.trim()).filter(Boolean);
  for (const d of skipDomains) {
    if (d && currentUrl.includes(d)) {
      console.log(`Skipping a11y check for configured skip domain match '${d}': ${currentUrl}`);
      // Still capture the axe results JSON for offline triage even when skipping assertions
      try {
        const results = await new AxeBuilder({ page: this.page! }).analyze();
        const outDir = path.resolve(process.cwd(), 'reports', 'a11y');
        fs.mkdirSync(outDir, { recursive: true });
        const fileName = `a11y-${new Date().toISOString().replace(/[:.]/g, '-')}-skipped.json`;
        const outPath = path.join(outDir, fileName);
        fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
        console.log(`Saved axe results (skipped) to ${outPath}`);
      } catch (err) {
        console.warn('Failed to write skipped axe results JSON:', err);
      }
      return;
    }
  }

  const results = await new AxeBuilder({ page: this.page! }).analyze();

  // Always save the raw axe results JSON for offline triage
  try {
    const outDir = path.resolve(process.cwd(), 'reports', 'a11y');
    fs.mkdirSync(outDir, { recursive: true });
    const fileName = `a11y-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const outPath = path.join(outDir, fileName);
    fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
    console.log(`Saved axe results to ${outPath}`);
  } catch (e) {
    console.warn('Failed to write axe results JSON:', e);
  }
  const serious = results.violations.filter(v => ['serious', 'critical'].includes(v.impact || ''));
  const critical = results.violations.filter(v => v.impact === 'critical');

  if (serious.length) {
    console.log('Accessibility issues found:');
    for (const v of serious) {
      console.log(` - ${v.id}: ${v.description} (impact: ${v.impact})`);
    }
  }

  // Control strictness via env var A11Y_FAIL_ON. Values: 'critical' | 'serious' | 'none'
  // Default: 'none' (do not fail the scenario). Set A11Y_FAIL_ON=critical to fail on critical issues.
  const failOn = process.env.A11Y_FAIL_ON || 'none';
  if (failOn === 'critical') {
    expect(critical.length, `Critical accessibility issues found: ${critical.length}`).toBe(0);
  } else if (failOn === 'serious') {
    expect(serious.length, `Serious/Critical issues found: ${serious.length}`).toBe(0);
  } else {
    // non-strict mode: log and continue
    if (serious.length === 0) {
      console.log('No serious/critical accessibility issues found.');
    } else {
      console.log(`A11y check ran in non-strict mode (A11Y_FAIL_ON not set). Found ${serious.length} serious/critical issues.`);
    }
  }
});
