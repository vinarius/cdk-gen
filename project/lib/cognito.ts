import {
  CognitoIdentityProviderClient,
  ListUserPoolsCommand, ListUserPoolsCommandOutput,
  UserPoolDescriptionType
} from '@aws-sdk/client-cognito-identity-provider';

export async function listUserPools(
  client: CognitoIdentityProviderClient
): Promise<UserPoolDescriptionType[]> {
  const totalUserPools: UserPoolDescriptionType[] = [];
  let nextToken;

  do {
    const output: ListUserPoolsCommandOutput = await client.send(new ListUserPoolsCommand({
      // 60 is the aws max
      MaxResults: 60,
      NextToken: nextToken
    }));

    totalUserPools.push(...output.UserPools as UserPoolDescriptionType[]);
    nextToken = output.NextToken;
  } while (nextToken);

  return totalUserPools;
}