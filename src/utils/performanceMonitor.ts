/**
 * Performance Monitor for Parallel Test Execution
 * Tracks worker utilization, memory usage, and execution metrics
 */

interface TestMetric {
  testName: string;
  duration: number;
  status: "passed" | "failed" | "skipped";
  timestamp: number;
  workerId: string;
  memoryUsage: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
}

export class PerformanceMonitor {
  private static startTime: number = Date.now();
  private static metrics: TestMetric[] = [];

  /**
   * Initialize performance monitoring
   */
  static initialize() {
    this.startTime = Date.now();
    this.metrics = [];

    // Track test start time for global teardown
    process.env.TEST_START_TIME = String(this.startTime);

    if (process.env.TRACK_PERFORMANCE === "true") {
      console.log("Performance monitoring initialized");
      this.logSystemInfo();
    }
  }

  /**
   * Log system information for performance analysis
   */
  private static logSystemInfo() {
    const os = require("os");

    console.log("System Information:");
    console.log(`CPU Cores: ${os.cpus().length}`);
    console.log(`Total Memory: ${Math.round(os.totalmem() / 1024 ** 3)}GB`);
    console.log(`Free Memory: ${Math.round(os.freemem() / 1024 ** 3)}GB`);
    console.log(`Platform: ${os.platform()}`);
    console.log(`Architecture: ${os.arch()}`);
  }

  /**
   * Record test execution metrics
   */
  static recordTestMetrics(
    testName: string,
    duration: number,
    status: "passed" | "failed" | "skipped",
  ) {
    if (process.env.TRACK_PERFORMANCE !== "true") return;

    const metric = {
      testName,
      duration,
      status,
      timestamp: Date.now(),
      workerId: process.env.PLAYWRIGHT_WORKER_INDEX || "unknown",
      memoryUsage: this.getMemoryUsage(),
    };

    this.metrics.push(metric);
  }

  /**
   * Get current memory usage
   */
  private static getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / (1024 * 1024)), // MB
      heapUsed: Math.round(usage.heapUsed / (1024 * 1024)), // MB
      heapTotal: Math.round(usage.heapTotal / (1024 * 1024)), // MB
      external: Math.round(usage.external / (1024 * 1024)), // MB
    };
  }

  /**
   * Calculate worker utilization statistics
   */
  static calculateWorkerStats() {
    if (this.metrics.length === 0) return null;

    const workerGroups = this.metrics.reduce(
      (groups, metric) => {
        const workerId = metric.workerId;
        if (!groups[workerId]) {
          groups[workerId] = [];
        }
        groups[workerId].push(metric);
        return groups;
      },
      {} as Record<string, TestMetric[]>,
    );

    const workerStats = Object.entries(workerGroups).map(
      ([workerId, metrics]) => {
        const totalDuration = metrics.reduce(
          (sum: number, m: TestMetric) => sum + m.duration,
          0,
        );
        const avgDuration = totalDuration / metrics.length;
        const testCount = metrics.length;
        const passedCount = metrics.filter(
          (m: TestMetric) => m.status === "passed",
        ).length;
        const failedCount = metrics.filter(
          (m: TestMetric) => m.status === "failed",
        ).length;

        return {
          workerId,
          testCount,
          totalDuration,
          avgDuration: Math.round(avgDuration),
          passedCount,
          failedCount,
          successRate: Math.round((passedCount / testCount) * 100),
          avgMemoryUsage: this.calculateAvgMemoryUsage(metrics),
        };
      },
    );

    return {
      totalWorkers: workerStats.length,
      totalTests: this.metrics.length,
      workers: workerStats,
      overallStats: this.calculateOverallStats(workerStats),
    };
  }

  /**
   * Calculate average memory usage for a set of metrics
   */
  private static calculateAvgMemoryUsage(metrics: TestMetric[]) {
    const memoryMetrics = metrics.map((m) => m.memoryUsage);
    const avgRss =
      memoryMetrics.reduce((sum, m) => sum + m.rss, 0) / memoryMetrics.length;
    const avgHeap =
      memoryMetrics.reduce((sum, m) => sum + m.heapUsed, 0) /
      memoryMetrics.length;

    return {
      rss: Math.round(avgRss),
      heapUsed: Math.round(avgHeap),
    };
  }

  /**
   * Calculate overall performance statistics
   */
  private static calculateOverallStats(workerStats: any[]) {
    const totalTests = workerStats.reduce((sum, w) => sum + w.testCount, 0);
    const totalDuration = workerStats.reduce(
      (sum, w) => sum + w.totalDuration,
      0,
    );
    const totalPassed = workerStats.reduce((sum, w) => sum + w.passedCount, 0);
    const totalFailed = workerStats.reduce((sum, w) => sum + w.failedCount, 0);

    // Calculate load balance (how evenly distributed tests are across workers)
    const testCounts = workerStats.map((w) => w.testCount);
    const avgTestsPerWorker = totalTests / workerStats.length;
    const loadVariance =
      testCounts.reduce(
        (sum, count) => sum + Math.pow(count - avgTestsPerWorker, 2),
        0,
      ) / testCounts.length;
    const loadBalance = Math.max(
      0,
      1 - Math.sqrt(loadVariance) / avgTestsPerWorker,
    );

    return {
      totalTests,
      totalDuration,
      avgTestDuration: Math.round(totalDuration / totalTests),
      overallSuccessRate: Math.round((totalPassed / totalTests) * 100),
      loadBalance: Math.round(loadBalance * 100), // Percentage
      parallelEfficiency: this.calculateParallelEfficiency(workerStats),
    };
  }

  /**
   * Calculate parallel execution efficiency
   */
  private static calculateParallelEfficiency(workerStats: any[]): number {
    if (workerStats.length <= 1) return 100;

    const totalDuration = workerStats.reduce(
      (sum, w) => sum + w.totalDuration,
      0,
    );
    const maxWorkerDuration = Math.max(
      ...workerStats.map((w) => w.totalDuration),
    );
    const idealParallelTime = totalDuration / workerStats.length;

    // Efficiency: how close we are to ideal parallel execution
    const efficiency = (idealParallelTime / maxWorkerDuration) * 100;
    return Math.round(Math.min(100, Math.max(0, efficiency)));
  }

  /**
   * Generate performance report
   */
  static generateReport(): string {
    if (process.env.TRACK_PERFORMANCE !== "true") {
      return "Performance tracking is disabled. Set TRACK_PERFORMANCE=true to enable.";
    }

    const stats = this.calculateWorkerStats();
    if (!stats) return "No performance data available.";

    const totalExecutionTime = Date.now() - this.startTime;

    let report = "\n=== Parallel Execution Performance Report ===\n";
    report += `Total Execution Time: ${totalExecutionTime}ms (${Math.round(totalExecutionTime / 1000)}s)\n`;
    report += `Workers Used: ${stats.totalWorkers}\n`;
    report += `Total Tests: ${stats.totalTests}\n`;
    report += `Overall Success Rate: ${stats.overallStats.overallSuccessRate}%\n`;
    report += `Load Balance: ${stats.overallStats.loadBalance}%\n`;
    report += `Parallel Efficiency: ${stats.overallStats.parallelEfficiency}%\n\n`;

    report += "=== Worker Statistics ===\n";
    stats.workers.forEach((worker) => {
      report += `Worker ${worker.workerId}:\n`;
      report += `  Tests: ${worker.testCount}\n`;
      report += `  Duration: ${worker.totalDuration}ms\n`;
      report += `  Avg per test: ${worker.avgDuration}ms\n`;
      report += `  Success rate: ${worker.successRate}%\n`;
      report += `  Avg memory: ${worker.avgMemoryUsage.rss}MB RSS, ${worker.avgMemoryUsage.heapUsed}MB Heap\n\n`;
    });

    return report;
  }

  /**
   * Save performance report to file
   */
  static async saveReport(filename: string = "performance-report.txt") {
    if (process.env.TRACK_PERFORMANCE !== "true") return;

    const fs = require("fs").promises;
    const path = require("path");

    const report = this.generateReport();
    const reportPath = path.join(process.cwd(), "test-results", filename);

    try {
      await fs.writeFile(reportPath, report, "utf8");
      console.log(`Performance report saved to: ${reportPath}`);
    } catch (error) {
      console.warn("Failed to save performance report:", error);
    }
  }
}

export default PerformanceMonitor;
