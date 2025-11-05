import { test, expect } from "@playwright/test";
import DataHelper from "../data/dataHelper";

test.describe("Data Management System Validation", () => {
  test("Should access user data by role", async () => {
    const adminUser = DataHelper.getUserByRole("admin");
    expect(adminUser.username).toBe("Admin");
    expect(adminUser.role).toBe("admin");
    expect(adminUser.permissions).toContain("all");

    const essUser = DataHelper.getUserByRole("essUser");
    expect(essUser.username).toBe("luke.doe");
    expect(essUser.role).toBe("employee");
    expect(essUser.permissions).toContain("profile");
  });

  test("Should generate parallel-safe users", async () => {
    const user1 = DataHelper.getParallelSafeUser("essUser");
    const user2 = DataHelper.getParallelSafeUser("essUser");

    // Should have unique test IDs
    expect(user1.testId).not.toBe(user2.testId);

    // Should have unique usernames
    expect(user1.username).not.toBe(user2.username);

    // Should maintain base properties
    expect(user1.role).toBe("employee");
    expect(user2.role).toBe("employee");
  });

  test("Should filter users by permission", async () => {
    const approvers = DataHelper.getUsersWithPermission("approve");
    expect(approvers.length).toBeGreaterThan(0);

    // All returned users should have approve permission
    approvers.forEach((user) => {
      expect(user.permissions).toContain("approve");
    });
  });

  test("Should generate booking data from templates", async () => {
    const standardBooking = DataHelper.generateBooking("standard");
    expect(standardBooking.totalprice).toBe(111);
    expect(standardBooking.additionalneeds).toBe("Breakfast");

    const premiumBooking = DataHelper.generateBooking("premium");
    expect(premiumBooking.totalprice).toBe(500);
    expect(premiumBooking.additionalneeds).toBe("Spa, Breakfast, Dinner");

    // Check dynamic date generation
    const today = new Date();
    const checkinDate = new Date(standardBooking.bookingdates.checkin);
    expect(checkinDate > today).toBeTruthy();
  });

  test("Should generate multiple unique bookings", async () => {
    const bookings = DataHelper.generateMultipleBookings(3, "budget");
    expect(bookings).toHaveLength(3);

    // Each booking should have unique firstname
    const firstnames = bookings.map((b) => b.firstname);
    const uniqueFirstnames = [...new Set(firstnames)];
    expect(uniqueFirstnames).toHaveLength(3);
  });

  test("Should handle environment configuration", async () => {
    const envConfig = DataHelper.getEnvironmentConfig();
    expect(envConfig).toHaveProperty("name");
    expect(envConfig).toHaveProperty("features");
    expect(envConfig).toHaveProperty("timeouts");

    // Should get timeouts
    const shortTimeout = DataHelper.getTimeout("short");
    const mediumTimeout = DataHelper.getTimeout("medium");
    const longTimeout = DataHelper.getTimeout("long");

    expect(typeof shortTimeout).toBe("number");
    expect(typeof mediumTimeout).toBe("number");
    expect(typeof longTimeout).toBe("number");
    expect(shortTimeout < mediumTimeout).toBeTruthy();
    expect(mediumTimeout < longTimeout).toBeTruthy();
  });

  test("Should check feature flags", async () => {
    const visualTestingEnabled = DataHelper.isFeatureEnabled("visualTesting");
    const debugModeEnabled = DataHelper.isFeatureEnabled("debugMode");

    expect(typeof visualTestingEnabled).toBe("boolean");
    expect(typeof debugModeEnabled).toBe("boolean");
  });

  test("Should generate unique test IDs", async () => {
    const id1 = DataHelper.generateTestId();
    const id2 = DataHelper.generateTestId("custom");

    expect(id1).toMatch(/^test_\d+_[a-z0-9]+$/);
    expect(id2).toMatch(/^custom_\d+_[a-z0-9]+$/);
    expect(id1).not.toBe(id2);
  });

  test("Should handle data cleanup settings", async () => {
    const shouldReset = DataHelper.shouldResetDataAfterTest();
    const shouldUseReal = DataHelper.shouldUseRealData();

    expect(typeof shouldReset).toBe("boolean");
    expect(typeof shouldUseReal).toBe("boolean");
  });
});
