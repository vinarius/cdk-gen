import { getAppConfig } from '../lib/getAppConfig';
import { spawn } from '../lib/spawn';

export async function deploy(): Promise<void> {
  const { IS_CODEBUILD, STACK } = process.env;

  try {
    console.time('deploy');
    const { alias, branch, profile } = await getAppConfig();
    const includeProfile = IS_CODEBUILD ? '' : `--profile ${profile}`;

    console.log(`\n>>> Synthesizing '${branch}' branch for deployment to ${alias} account`);

    const stackName: string = STACK || '--all';
    spawn(`npm run cdk -- deploy ${stackName} --require-approval never ${includeProfile} --outputs-file ./dist/cdk-outputs.json`);
    console.timeEnd('deploy');
  } catch (error) {
    error instanceof Error ? console.error(`${error.name ?? 'Error'}: ${error.message}`) : console.error(error);

    process.exit(1);
  }
}

deploy();