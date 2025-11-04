import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config(); // load .env if present

type EnvName = "dev" | "qa" | "prod";

interface EnvironmentConfig {
  baseURL: string;
  username: string;
  password: string;
  environment: string;
  azure: {
    keyVaultEnabled: boolean;
    keyVaultUri: string;
  };
}

interface Config extends EnvironmentConfig {
  env: EnvName;
  isCI: boolean;
  azure: EnvironmentConfig["azure"] & {
    clientId?: string;
    tenantId?: string;
    clientSecret?: string;
  };
}

const env: EnvName = (process.env.NODE_ENV as EnvName) || "dev";

// Load environment-specific configuration
const filePath = path.resolve(__dirname, `./environments/${env}.json`);
if (!fs.existsSync(filePath)) {
  throw new Error(
    `Error: Environment config file not found for ${env}: ${filePath}`,
  );
}

const raw = fs.readFileSync(filePath, "utf-8");
const envConfig: EnvironmentConfig = JSON.parse(raw);

// Build final configuration with environment variable overrides
export const CONFIG: Config = {
  baseURL: process.env.ORANGEHRM_BASE_URL || envConfig.baseURL,
  username: process.env.ORANGEHRM_USERNAME || envConfig.username,
  password: process.env.ORANGEHRM_PASSWORD || envConfig.password,
  environment: envConfig.environment,
  env,
  isCI: !!process.env.CI,
  azure: {
    keyVaultEnabled: envConfig.azure.keyVaultEnabled,
    keyVaultUri: process.env.AZURE_KEYVAULT_URI || envConfig.azure.keyVaultUri,
    clientId: process.env.AZURE_CLIENT_ID,
    tenantId: process.env.AZURE_TENANT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
  },
};

// Validate required configuration
const validateConfig = () => {
  if (!CONFIG.baseURL) {
    throw new Error("Error: Base URL is required but not configured");
  }

  if (CONFIG.azure.keyVaultEnabled) {
    if (!CONFIG.azure.keyVaultUri) {
      throw new Error(
        "Error: Azure Key Vault URI is required when Key Vault is enabled",
      );
    }
    if (
      CONFIG.isCI &&
      (!CONFIG.azure.clientId ||
        !CONFIG.azure.tenantId ||
        !CONFIG.azure.clientSecret)
    ) {
      console.warn(
        "Warning: Azure Key Vault credentials missing in CI environment",
      );
    }
  }

  // Don't log sensitive information in production
  if (CONFIG.env !== "prod" && !CONFIG.isCI) {
    console.log(`Loaded configuration for [${CONFIG.env}] environment`);
    console.log(
      `Azure Key Vault: ${CONFIG.azure.keyVaultEnabled ? "Enabled" : "Disabled"}`,
    );
  } else {
    console.log(`Loaded configuration for [${CONFIG.env}] environment`);
  }
};

validateConfig();

// Legacy export for backward compatibility
export const TEST_ENV = {
  baseURL: CONFIG.baseURL,
  username: CONFIG.username,
  password: CONFIG.password,
};
