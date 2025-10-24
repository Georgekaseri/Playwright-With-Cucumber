import { Then } from '@cucumber/cucumber';
import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';
import { PWWorld } from '../support/world';

Then('the page should have no serious accessibility issues', async function (this: PWWorld) {
  const results = await new AxeBuilder({ page: this.page! }).analyze();
  const serious = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
  if (serious.length) {
    console.log('A11y violations:', serious.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })));
  }
  expect(serious.length, `Serious/Critical a11y issues found: ${serious.length}`).toBe(0);
});
