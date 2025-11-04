import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

const uri = process.env.AZURE_KEYVAULT_URI;

if (!uri) {
  console.error("Error: AZURE_KEYVAULT_URI environment variable is required");
  process.exit(1);
}

const credential = new DefaultAzureCredential();
const client = new SecretClient(uri, credential);

async function fetchSecrets() {
  try {
    console.log(`Fetching secrets from Azure Key Vault: ${uri}`);

    const secretNames = [
      "ORANGEHRM-BASE-URL",
      "ORANGEHRM-USERNAME",
      "ORANGEHRM-PASSWORD",
    ];

    const secrets = {};

    for (const secretName of secretNames) {
      try {
        const secret = await client.getSecret(secretName);
        const envVarName = secretName.replace(/-/g, "_");
        secrets[envVarName] = secret.value;
        console.log(`Retrieved secret: ${secretName}`);
      } catch (error) {
        console.warn(
          `Warning: Failed to retrieve secret ${secretName}:`,
          error.message,
        );
      }
    }

    // Output environment variables for GitHub Actions
    if (process.env.GITHUB_ACTIONS) {
      Object.entries(secrets).forEach(([key, value]) => {
        console.log(`::add-mask::${value}`);
        console.log(`::set-output name=${key}::${value}`);
      });
    } else {
      // Local development - output to console (masked)
      console.log("\nRetrieved secrets (values masked):");
      Object.entries(secrets).forEach(([key, value]) => {
        console.log(`${key}=${value ? "***" : "Not found"}`);
      });
    }

    return secrets;
  } catch (error) {
    console.error(
      "Error: Failed to fetch secrets from Azure Key Vault:",
      error.message,
    );

    if (error.code === "ENOTFOUND") {
      console.error(
        "Tip: Check your AZURE_KEYVAULT_URI and network connectivity",
      );
    } else if (error.code === "AuthenticationFailed") {
      console.error(
        "Tip: Check your Azure credentials (AZURE_CLIENT_ID, AZURE_TENANT_ID, AZURE_CLIENT_SECRET)",
      );
    }

    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  fetchSecrets().catch(console.error);
}

export { fetchSecrets };
