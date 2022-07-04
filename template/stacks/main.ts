import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AppStackProps } from '../models/cloudResources';
import { NodejsFunction, Runtime } from 'aws-cdk-lib/aws-lambda-nodejs';
import { resolve } from 'path';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';

export class MainStack extends Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    const {
      project,
      stage,
      stack,
      isStagingEnv
    } = props;

    new NodejsFunction(scope, `${project}-${stack}-example-${stage}`, {
      environment: {
        LOGGING_LEVEL: stage === 'prod' ? 'warn' : 'debug'
      },
      runtime: Runtime.NODEJS_16_X,
      functionName: `${project}-${stack}-example-${stage}`,
      entry: resolve(__dirname, '..', 'src', stack, `example.ts`),
      bundling: {
        minify: true
      },
      logRetention: isStagingEnv ? RetentionDays.INFINITE : RetentionDays.THREE_DAYS,
      projectRoot: resolve(__dirname, '..')
    })
  }
}