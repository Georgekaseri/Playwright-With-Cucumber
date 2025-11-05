/**
 * Test Sharding Utility for Advanced Parallel Execution
 * Enables intelligent test distribution across multiple CI runners
 */

export class TestSharding {
  /**
   * Calculate optimal shard distribution based on test characteristics
   */
  static calculateShardDistribution(testFiles: string[], totalShards: number) {
    const shards: string[][] = Array.from({ length: totalShards }, () => []);

    // Group tests by estimated execution time (based on file patterns)
    const testGroups = this.categorizeTestsByComplexity(testFiles);

    // Distribute tests evenly across shards
    let currentShard = 0;

    // First, distribute heavy tests
    testGroups.heavy.forEach((test) => {
      shards[currentShard].push(test);
      currentShard = (currentShard + 1) % totalShards;
    });

    // Then medium tests
    testGroups.medium.forEach((test) => {
      shards[currentShard].push(test);
      currentShard = (currentShard + 1) % totalShards;
    });

    // Finally light tests
    testGroups.light.forEach((test) => {
      shards[currentShard].push(test);
      currentShard = (currentShard + 1) % totalShards;
    });

    return shards;
  }

  /**
   * Categorize tests by estimated complexity/execution time
   */
  private static categorizeTestsByComplexity(testFiles: string[]) {
    const groups = {
      heavy: [] as string[],
      medium: [] as string[],
      light: [] as string[],
    };

    testFiles.forEach((file) => {
      // Heavy tests: integration, performance, visual
      if (
        file.includes("integration") ||
        file.includes("performance") ||
        file.includes("visual") ||
        file.includes("e2e")
      ) {
        groups.heavy.push(file);
      }
      // Medium tests: API tests, form interactions
      else if (
        file.includes("api") ||
        file.includes("booking") ||
        file.includes("login")
      ) {
        groups.medium.push(file);
      }
      // Light tests: unit-like tests, utilities
      else {
        groups.light.push(file);
      }
    });

    return groups;
  }

  /**
   * Get tests for current shard
   */
  static getTestsForShard(
    testFiles: string[],
    currentShard: number,
    totalShards: number,
  ): string[] {
    if (totalShards === 1) return testFiles;

    const shards = this.calculateShardDistribution(testFiles, totalShards);
    return shards[currentShard - 1] || [];
  }

  /**
   * Generate shard configuration for CI
   */
  static generateShardConfig(totalShards: number) {
    return Array.from({ length: totalShards }, (_, index) => ({
      shard: index + 1,
      total: totalShards,
      name: `shard-${index + 1}-of-${totalShards}`,
    }));
  }

  /**
   * Calculate optimal number of shards based on test count and runner capacity
   */
  static calculateOptimalShards(
    testCount: number,
    maxRunnersAvailable: number = 4,
  ): number {
    // Rough estimation: aim for 10-20 tests per shard for good parallelization
    const testsPerShard = 15;
    const calculatedShards = Math.ceil(testCount / testsPerShard);

    // Don't exceed available runners
    return Math.min(calculatedShards, maxRunnersAvailable);
  }

  /**
   * Get shard statistics for monitoring
   */
  static getShardStatistics(shards: string[][]) {
    return {
      totalShards: shards.length,
      testsPerShard: shards.map((shard) => shard.length),
      totalTests: shards.reduce((sum, shard) => sum + shard.length, 0),
      avgTestsPerShard: Math.round(
        shards.reduce((sum, shard) => sum + shard.length, 0) / shards.length,
      ),
      balanceScore: this.calculateBalanceScore(shards),
    };
  }

  /**
   * Calculate how well-balanced the shard distribution is (0-1, higher is better)
   */
  private static calculateBalanceScore(shards: string[][]): number {
    const testCounts = shards.map((shard) => shard.length);
    const average =
      testCounts.reduce((sum, count) => sum + count, 0) / testCounts.length;
    const variance =
      testCounts.reduce((sum, count) => sum + Math.pow(count - average, 2), 0) /
      testCounts.length;
    const standardDeviation = Math.sqrt(variance);

    // Balance score: inverse of coefficient of variation, normalized to 0-1
    const coefficientOfVariation =
      average > 0 ? standardDeviation / average : 0;
    return Math.max(0, 1 - coefficientOfVariation);
  }
}

export default TestSharding;
