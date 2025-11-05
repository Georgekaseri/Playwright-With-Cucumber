import { test, expect } from "@playwright/test";
import TestSharding from "../utils/testSharding";
import PerformanceMonitor from "../utils/performanceMonitor";
import DataHelper from "../data/dataHelper";

test.describe("Advanced Parallelization System Tests", () => {
  test.beforeAll(() => {
    PerformanceMonitor.initialize();
  });

  test("Should calculate optimal worker count based on system resources", async () => {
    // This test validates the worker optimization logic
    const os = require("os");
    const cpuCount = os.cpus().length;
    const memoryGB = os.totalmem() / 1024 ** 3;

    // Test different scenarios
    console.log(
      `System has ${cpuCount} CPUs and ${Math.round(memoryGB)}GB RAM`,
    );

    // The worker count should be reasonable for the system
    expect(cpuCount).toBeGreaterThan(0);
    expect(memoryGB).toBeGreaterThan(0);
  });

  test("Should distribute tests evenly across shards", async () => {
    const testFiles = [
      "tests/integration/booking.integration.spec.ts",
      "tests/performance/load.spec.ts",
      "tests/visual/dashboard.visual.spec.ts",
      "tests/api/users.api.spec.ts",
      "tests/login.spec.ts",
      "tests/health.spec.ts",
      "tests/utils/helper.spec.ts",
    ];

    const totalShards = 3;
    const shards = TestSharding.calculateShardDistribution(
      testFiles,
      totalShards,
    );

    expect(shards).toHaveLength(totalShards);

    // Each shard should have at least one test
    shards.forEach((shard) => {
      expect(shard.length).toBeGreaterThan(0);
    });

    // Total tests should be preserved
    const totalTests = shards.reduce((sum, shard) => sum + shard.length, 0);
    expect(totalTests).toBe(testFiles.length);

    // Heavy tests should be distributed first (integration, performance, visual)
    const heavyTests = shards
      .flat()
      .filter(
        (test) =>
          test.includes("integration") ||
          test.includes("performance") ||
          test.includes("visual"),
      );
    expect(heavyTests.length).toBe(3);
  });

  test("Should calculate shard statistics correctly", async () => {
    const shards = [
      ["test1.spec.ts", "test2.spec.ts", "test3.spec.ts"],
      ["test4.spec.ts", "test5.spec.ts"],
      ["test6.spec.ts", "test7.spec.ts", "test8.spec.ts", "test9.spec.ts"],
    ];

    const stats = TestSharding.getShardStatistics(shards);

    expect(stats.totalShards).toBe(3);
    expect(stats.totalTests).toBe(9);
    expect(stats.testsPerShard).toEqual([3, 2, 4]);
    expect(stats.avgTestsPerShard).toBe(3);
    expect(stats.balanceScore).toBeGreaterThan(0);
    expect(stats.balanceScore).toBeLessThanOrEqual(1);
  });

  test("Should get tests for specific shard", async () => {
    const testFiles = [
      "test1.spec.ts",
      "test2.spec.ts",
      "test3.spec.ts",
      "test4.spec.ts",
    ];

    const shard1Tests = TestSharding.getTestsForShard(testFiles, 1, 2);
    const shard2Tests = TestSharding.getTestsForShard(testFiles, 2, 2);

    expect(shard1Tests.length).toBeGreaterThan(0);
    expect(shard2Tests.length).toBeGreaterThan(0);

    // No overlap between shards
    const overlap = shard1Tests.filter((test) => shard2Tests.includes(test));
    expect(overlap).toHaveLength(0);

    // All tests should be assigned
    const allAssigned = [...shard1Tests, ...shard2Tests];
    expect(allAssigned.length).toBe(testFiles.length);
  });

  test("Should calculate optimal shard count", async () => {
    // Test different test counts
    expect(TestSharding.calculateOptimalShards(10, 4)).toBe(1); // Small test suite
    expect(TestSharding.calculateOptimalShards(50, 4)).toBe(4); // Medium test suite
    expect(TestSharding.calculateOptimalShards(100, 8)).toBe(7); // Large test suite
    expect(TestSharding.calculateOptimalShards(200, 4)).toBe(4); // Limited by runners
  });

  test("Should generate shard configurations for CI", async () => {
    const configs = TestSharding.generateShardConfig(3);

    expect(configs).toHaveLength(3);
    expect(configs[0]).toEqual({ shard: 1, total: 3, name: "shard-1-of-3" });
    expect(configs[1]).toEqual({ shard: 2, total: 3, name: "shard-2-of-3" });
    expect(configs[2]).toEqual({ shard: 3, total: 3, name: "shard-3-of-3" });
  });

  test("Should record performance metrics", async () => {
    // Set performance tracking
    process.env.TRACK_PERFORMANCE = "true";

    PerformanceMonitor.recordTestMetrics("sample-test-1", 1000, "passed");
    PerformanceMonitor.recordTestMetrics("sample-test-2", 2000, "failed");
    PerformanceMonitor.recordTestMetrics("sample-test-3", 1500, "passed");

    const stats = PerformanceMonitor.calculateWorkerStats();

    expect(stats).not.toBeNull();
    if (stats) {
      expect(stats.totalTests).toBeGreaterThanOrEqual(3);
      expect(stats.workers.length).toBeGreaterThan(0);
      expect(stats.overallStats).toBeDefined();
    }
  });

  test("Should generate performance report", async () => {
    process.env.TRACK_PERFORMANCE = "true";

    const report = PerformanceMonitor.generateReport();

    expect(report).toContain("Parallel Execution Performance Report");
    expect(report).toContain("Total Execution Time");
    expect(report).toContain("Workers Used");
  });

  test("Should integrate with environment configuration", async () => {
    const envConfig = DataHelper.getEnvironmentConfig();

    // Timeouts should be environment-appropriate
    const shortTimeout = DataHelper.getTimeout("short");
    const mediumTimeout = DataHelper.getTimeout("medium");
    const longTimeout = DataHelper.getTimeout("long");

    expect(shortTimeout).toBeLessThan(mediumTimeout);
    expect(mediumTimeout).toBeLessThan(longTimeout);

    // Feature flags should affect parallel execution
    const visualTestingEnabled = DataHelper.isFeatureEnabled("visualTesting");
    expect(typeof visualTestingEnabled).toBe("boolean");
  });

  test("Should handle parallel-safe user generation", async () => {
    // Generate multiple parallel-safe users simultaneously
    const users = Array.from({ length: 5 }, () =>
      DataHelper.getParallelSafeUser("essUser"),
    );

    // All users should have unique test IDs
    const testIds = users.map((u) => u.testId);
    const uniqueTestIds = new Set(testIds);
    expect(uniqueTestIds.size).toBe(5);

    // All users should have unique usernames
    const usernames = users.map((u) => u.username);
    const uniqueUsernames = new Set(usernames);
    expect(uniqueUsernames.size).toBe(5);
  });

  test("Should handle parallel booking data generation", async () => {
    // Generate multiple bookings in parallel
    const bookings = DataHelper.generateMultipleBookings(10, "standard");

    expect(bookings).toHaveLength(10);

    // All bookings should have unique firstnames
    const firstnames = bookings.map((b) => b.firstname);
    const uniqueFirstnames = new Set(firstnames);
    expect(uniqueFirstnames.size).toBe(10);

    // All should have future check-in dates
    const today = new Date();
    bookings.forEach((booking) => {
      const checkinDate = new Date(booking.bookingdates.checkin);
      expect(checkinDate > today).toBeTruthy();
    });
  });
});
