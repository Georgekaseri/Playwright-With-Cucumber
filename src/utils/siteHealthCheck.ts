import { request } from "@playwright/test";

export async function checkSiteHealth(baseUrl: string): Promise<boolean> {
  try {
    console.log(`🔍 Checking site health: ${baseUrl}`);

    const requestContext = await request.newContext();
    const response = await requestContext.get(
      `${baseUrl}/web/index.php/auth/login`,
      {
        timeout: 30000,
      },
    );

    const isHealthy = response.ok() && response.status() === 200;
    console.log(
      `${isHealthy ? "✅" : "❌"} Site health check: ${response.status()}`,
    );

    await requestContext.dispose();
    return isHealthy;
  } catch (error) {
    console.log(`❌ Site health check failed: ${error}`);
    return false;
  }
}

export function skipIfSiteDown(siteHealthy: boolean, testName: string) {
  if (!siteHealthy) {
    console.log(`⏭️  Skipping ${testName} - External site unavailable`);
    return true;
  }
  return false;
}
