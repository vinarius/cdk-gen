import { StackProps } from 'aws-cdk-lib';

export interface AppStackProps extends StackProps {
  project: string;
  stage: string;
  stack: string;
  isStagingEnv: boolean;
  env: {
    account: string;
    region: string;
  }
}
