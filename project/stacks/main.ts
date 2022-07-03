import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AppStackProps } from '../models/cloudResources';
import { Queue } from 'aws-cdk-lib/aws-sqs';

export class ActivitiesStack extends Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    const {
      project,
      stage,
      stack
    } = props;

    // const queue = new Queue(this, `${project}-${stack}-queue-${stage}`);
  }
}