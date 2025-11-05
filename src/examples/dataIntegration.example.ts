// Example: Integrating DataHelper with existing tests
// This example shows how to use the new data management system

import { test, expect } from "@playwright/test";
import DataHelper from "../data/dataHelper";

test.describe("Data Management Integration Examples", () => {
  test("Login with role-based user data", async ({ page }) => {
    // Get admin user for this test
    const adminUser = DataHelper.getUserByRole("admin");

    await page.goto("/login");
    await page.fill('[name="username"]', adminUser.username);
    await page.fill('[name="password"]', adminUser.password);
    await page.click('[type="submit"]');

    // Use environment-specific timeout
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible({
      timeout: DataHelper.getTimeout("medium"),
    });
  });

  test("Parallel safe user creation", async ({ page }) => {
    // Get parallel-safe user (unique identifiers for parallel execution)
    const parallelUser = DataHelper.getParallelSafeUser("essUser");

    console.log(`Test ID: ${parallelUser.testId}`);
    console.log(`Unique username: ${parallelUser.username}`);

    // This user is safe for parallel execution
    await page.goto("/register");
    await page.fill('[name="username"]', parallelUser.username);
    await page.fill('[name="password"]', parallelUser.password);
    // ... rest of registration
  });

  test("Environment-specific feature testing", async ({ page }) => {
    const isVisualTestingEnabled = DataHelper.isFeatureEnabled("visualTesting");

    await page.goto("/dashboard");

    if (isVisualTestingEnabled) {
      // Only run visual tests in environments where it's enabled
      await expect(page).toHaveScreenshot("dashboard.png");
    }

    // Always check functionality
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
  });

  test("Dynamic booking data generation", async ({ page }) => {
    // Generate different types of booking data
    const standardBooking = DataHelper.generateBooking("standard");
    const premiumBooking = DataHelper.generateBooking("premium");

    console.log("Standard booking:", standardBooking);
    console.log("Premium booking:", premiumBooking);

    // Use in API tests
    const response = await page.request.post("/api/bookings", {
      data: standardBooking,
    });

    expect(response.ok()).toBeTruthy();
  });

  test("Multiple bookings for stress testing", async ({ page }) => {
    // Generate multiple bookings for parallel testing
    const bookings = DataHelper.generateMultipleBookings(5, "budget");

    for (const booking of bookings) {
      const response = await page.request.post("/api/bookings", {
        data: booking,
      });
      expect(response.ok()).toBeTruthy();
    }
  });

  test("Permission-based user filtering", async ({ page }) => {
    // Get all users who can approve requests
    const approvers = DataHelper.getUsersWithPermission("approve");

    expect(approvers.length).toBeGreaterThan(0);

    // Use first approver for test
    const approver = approvers[0];
    await page.goto("/login");
    await page.fill('[name="username"]', approver.username);
    await page.fill('[name="password"]', approver.password);
    // ... continue with approval workflow
  });

  test("Data cleanup based on environment", async ({ page }) => {
    const shouldCleanup = DataHelper.shouldResetDataAfterTest();

    // Create test data
    const testBooking = DataHelper.generateBooking();
    const response = await page.request.post("/api/bookings", {
      data: testBooking,
    });
    const bookingData = await response.json();

    // Cleanup logic based on environment
    if (shouldCleanup && bookingData.bookingid) {
      // Clean up in dev/test environments
      await page.request.delete(`/api/bookings/${bookingData.bookingid}`);
    }
    // In production environments, data persists
  });
});

// Example for Cucumber step definitions integration
export class DataStepHelpers {
  static getStepUser(roleName: string) {
    // Map Cucumber step language to our user roles
    const roleMap: Record<string, keyof typeof import("../data/users.json")> = {
      admin: "admin",
      employee: "essUser",
      manager: "manager",
      "hr user": "hrUser",
    };

    const role = roleMap[roleName.toLowerCase()];
    if (!role) {
      throw new Error(`Unknown role in step: ${roleName}`);
    }

    return DataHelper.getUserByRole(role);
  }

  static getStepBooking(bookingType: string) {
    // Map Cucumber step language to our booking templates
    const templateMap: Record<
      string,
      keyof typeof import("../data/bookingData").bookingTemplates
    > = {
      standard: "standard",
      premium: "premium",
      budget: "budget",
      "long stay": "longStay",
    };

    const template = templateMap[bookingType.toLowerCase()];
    if (!template) {
      throw new Error(`Unknown booking type in step: ${bookingType}`);
    }

    return DataHelper.generateBooking(template);
  }
}
