import { getAppConfig } from '../lib/getAppConfig';
import { spawn } from '../lib/spawn';

export async function hotswap(): Promise<void> {
  try {
    const { profile } = await getAppConfig();

    const stackName: string = process.env.STACK || '--all';
    spawn(`npm run cdk -- deploy ${stackName} --hotswap --require-approval never --profile ${profile} --outputs-file ./dist/cdk-outputs.json`);
  } catch (error) {
    error instanceof Error ? console.error(`${error.name ?? 'Error'}: ${error.message}`) : console.error(error);

    process.exit(1);
  }
}

hotswap();