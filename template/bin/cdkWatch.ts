import { getAppConfig } from '../lib/getAppConfig';
import { spawn } from '../lib/spawn';

async function cdkWatch(): Promise<void> {
  try {
    const { profile } = await getAppConfig();

    spawn(`npm run cdk -- watch --profile ${profile}`);
  } catch (error) {
    error instanceof Error ? console.error(`${error.name ?? 'Error'}: ${error.message}`) : console.error(error);

    process.exit(1);
  }
}

cdkWatch();