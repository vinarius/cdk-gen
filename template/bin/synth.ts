import { getAppConfig } from '../lib/getAppConfig';
import { spawn } from '../lib/spawn';

export async function synth(): Promise<void> {
  try {
    const { alias, branch, profile } = await getAppConfig();

    console.log(`\n>>> Synthesizing '${branch}' branch for deployment to ${alias} account`);

    spawn(`npm run cdk -- synth --profile ${profile}`);
    console.log('>>> Synthesis complete');
  } catch (error) {
    error instanceof Error ? console.error(`${error.name ?? 'Error'}: ${error.message}`) : console.error(error);

    process.exit(1);
  }
}

synth();