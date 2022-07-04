import { App } from 'aws-cdk-lib';
import 'source-map-support/register';
import { getAppConfig } from './lib/getAppConfig';
import { validateAwsProfile } from './lib/validateAwsProfile';

async function buildInfrastructure(): Promise<void> {
  const app = new App();

  try {
    const {
      project,
      stage,
      env,
      isStagingEnv,
      profile
    } = await getAppConfig();

    await validateAwsProfile(profile);

    const stackProps = {
      terminationProtection: isStagingEnv,
      project,
      stage,
      isStagingEnv,
      env
    };

    new MainStack(app, `${project}-main-stack-${stage}`, {
      ...stackProps,
      stack: 'main'
    });

    app.synth();
  } catch (error) {
    const { name, message } = error as Error;
    console.error(`${name}: ${message}`);
  }
}

buildInfrastructure();
