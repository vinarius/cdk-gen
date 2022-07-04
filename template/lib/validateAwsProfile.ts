import { GetCallerIdentityCommand, STSClient } from '@aws-sdk/client-sts';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { retryOptions } from './retryOptions';

export async function validateAwsProfile(profile: string): Promise<void> {
  const { IS_JEST } = process.env;

  try {
    const stsClient = new STSClient({
      ...retryOptions,
      credentials: fromIni({ profile })
    });

    await stsClient.send(new GetCallerIdentityCommand({})).catch((error: TypeError) => {
      if (error.name === 'InvalidClientTokenId') {
        const invalidProfileError = new Error(`Profile ${profile} credentials are expired. Renew your MFA credentials using STS GetSessionToken or run the awsToken.ts script.\n`);
        invalidProfileError.name = 'InvalidClientTokenId';
        throw invalidProfileError;
      } else {
        /**
         * If an invalid profile alias is specified, the following error is thrown:
         * CredentialsProviderError: Profile {profile} could not be found or parsed in shared credentials file.
         */
        throw error;
      }
    });
  } catch (error) {
    const { name, message } = error as Error;
    error instanceof Error ? console.error(`${error.name ?? 'Error'}: ${error.message}`) : console.error(error);

    process.exit(1);
  }
}