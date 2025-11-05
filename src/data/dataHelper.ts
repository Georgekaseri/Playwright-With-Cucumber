import * as users from "./users.json";
import * as environments from "./environments.json";
import { generateBookingData, bookingTemplates } from "./bookingData";

type BookingTemplate = keyof typeof bookingTemplates;
type UserRole = keyof typeof users;
type User = (typeof users)[UserRole];

export class DataHelper {
  private static environment = process.env.NODE_ENV || "dev";

  /**
   * Get user data by role
   */
  static getUserByRole(role: UserRole): User {
    const user = users[role];
    if (!user) {
      throw new Error(`User with role '${String(role)}' not found`);
    }
    return user;
  }

  /**
   * Get random user from specific roles
   */
  static getRandomUserFromRoles(roles: UserRole[]): User {
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    return this.getUserByRole(randomRole);
  }

  /**
   * Get all users with specific permission
   */
  static getUsersWithPermission(permission: string): User[] {
    return Object.values(users).filter(
      (user: any) =>
        user && user.permissions && user.permissions.includes(permission)
    );
  }

  /**
   * Get environment configuration
   */
  static getEnvironmentConfig() {
    return (
      environments[this.environment as keyof typeof environments] ||
      environments.dev
    );
  }

  /**
   * Get timeout for specific operation type
   */
  static getTimeout(type: "short" | "medium" | "long"): number {
    const envConfig = this.getEnvironmentConfig();
    return envConfig.timeouts[type];
  }

  /**
   * Check if feature is enabled in current environment
   */
  static isFeatureEnabled(feature: string): boolean {
    const envConfig = this.getEnvironmentConfig();
    const featureValue =
      envConfig.features[feature as keyof typeof envConfig.features];
    return Boolean(featureValue);
  }

  /**
   * Generate booking data with template
   */
  static generateBooking(template: BookingTemplate = "standard") {
    return generateBookingData(template);
  }

  /**
   * Generate multiple bookings for parallel testing
   */
  static generateMultipleBookings(
    count: number,
    template: BookingTemplate = "standard"
  ) {
    return Array.from({ length: count }, () => this.generateBooking(template));
  }

  /**
   * Get test data cleanup setting
   */
  static shouldResetDataAfterTest(): boolean {
    const envConfig = this.getEnvironmentConfig();
    return envConfig.testData.resetDataAfterTest;
  }

  /**
   * Get data usage setting (real vs mock)
   */
  static shouldUseRealData(): boolean {
    const envConfig = this.getEnvironmentConfig();
    return envConfig.testData.useRealData;
  }

  /**
   * Generate unique test identifier for parallel execution
   */
  static generateTestId(prefix = "test"): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Get parallel execution safe user (with unique identifiers)
   */
  static getParallelSafeUser(role: UserRole): User & { testId: string } {
    const baseUser = this.getUserByRole(role);
    const testId = this.generateTestId();

    return {
      ...baseUser,
      testId,
      // Add test ID to username for parallel execution
      username: `${baseUser.username}_${testId.slice(-6)}`,
    };
  }
}

export default DataHelper;
