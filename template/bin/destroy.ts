import { CloudFormationClient, DeleteStackCommand, ListStacksCommand, ListStacksCommandOutput, StackSummary } from '@aws-sdk/client-cloudformation';
import {
  CloudWatchLogsClient,
  DeleteLogGroupCommand,
  DescribeLogGroupsCommand,
  DescribeLogGroupsCommandOutput,
  LogGroup
} from '@aws-sdk/client-cloudwatch-logs';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { existsSync, readFileSync } from 'fs';
import { fromRoot } from '../lib/fromRoot';
import { getAppConfig } from '../lib/getAppConfig';
import { retryOptions } from '../lib/retryOptions';
import { validateAwsProfile } from '../lib/validateAwsProfile';

async function destroy(): Promise<void> {
  const cloudWatchLogsClient = new CloudWatchLogsClient({ ...retryOptions });
  const sqsClient = new SQSClient({ ...retryOptions });
  const cloudformationClient = new CloudFormationClient({ ...retryOptions });

  try {
    const {
      alias,
      branch,
      profile,
      stage,
      env,
      isStagingEnv,
      edgeCleanupQueueName
    } = await getAppConfig();

    if (isStagingEnv || stage === 'dev')
      throw new Error(`Unable to destroy stacks on branch ${branch} for environment ${stage}. Please check your git branch.`);

    await validateAwsProfile(profile);

    process.env.AWS_PROFILE = profile;
    process.env.AWS_REGION = env.region;

    console.log('>>> Cleaning up log groups');

    const totalLogGroupNames: string[] = [];
    let nextToken;

    do {
      const describeLogGroupsOutput: DescribeLogGroupsCommandOutput = await cloudWatchLogsClient.send(new DescribeLogGroupsCommand({ nextToken }));

      totalLogGroupNames.push(
        ...(describeLogGroupsOutput.logGroups as LogGroup[] ?? [])
          .map(group => group.logGroupName as string)
          .filter(logGroupName => logGroupName.includes(stage))
      );

      nextToken = describeLogGroupsOutput.nextToken;
    } while (nextToken);

    for (const logGroupName of totalLogGroupNames) {
      await cloudWatchLogsClient.send(new DeleteLogGroupCommand({ logGroupName }));
    }

    console.log('>>> Log groups cleaned successfully.');

    console.log(`\n>>> Destroying '${branch}' branch stacks from the ${alias} account`);
    console.log(`>>> Using profile ${profile}\n`);

    /**
     * list stacks
     * filter by stage name
     * delete each stack in this stage and await all
     */

    const stacks: string[] = [];
    nextToken = undefined;

    do {
      const listStacksOutput: ListStacksCommandOutput = await cloudformationClient.send(
        new ListStacksCommand({
          NextToken: nextToken
        })
      );

      nextToken = listStacksOutput.NextToken;
      const filteredStacks = listStacksOutput.StackSummaries!
        .map((stack: StackSummary) => stack.StackName as string)
        .filter((stackName: string) => stackName.includes(stage));

      stacks.push(...filteredStacks);
    } while (nextToken);

    const deleteStackPromises = stacks.map(StackName => cloudformationClient.send(new DeleteStackCommand({ StackName })));
    await Promise.all(deleteStackPromises);

    const cleanupQueuePath = fromRoot(['dist', 'edgeCleanupQueue.json']);
    const { edgeLambdaNames } = existsSync(cleanupQueuePath) ?
      JSON.parse(readFileSync(cleanupQueuePath).toString()) :
      { edgeLambdaNames: [] };

    if (edgeLambdaNames.length) {
      await sqsClient.send(
        new SendMessageCommand({
          QueueUrl: `https://sqs.${env.region}.amazonaws.com/${env.account}/${edgeCleanupQueueName}`,
          MessageBody: JSON.stringify({
            edgeLambdaNames
          })
        })
      );
    }

    console.log('>>> Destroy complete.');
  } catch (error) {
    error instanceof Error ? console.error(`${error.name ?? 'Error'}: ${error.message}`) : console.error(error);

    process.exit(1);
  }
}

destroy();