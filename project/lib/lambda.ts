/* eslint-disable @typescript-eslint/no-explicit-any */
import { AWSLambda as Sentry } from '@sentry/serverless';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { DateTime } from 'luxon';
import { LoggerFactory } from '../lib/loggerFactory';
import { throwNotAuthorizedError } from './errors';

export interface CognitoAuthorizerClaims {
  sub: string;                    //  'cd547cc6-6a29-469d-b9cc-58ddedf39395',
  email_verified: string;         //  'true',
  iss: string;                    //  'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_uJ7HBCvL4',
  'cognito:username': string;     //  'cd547cc6-6a29-469d-b9cc-58ddedf39395',
  origin_jti: string;             //  '9f9bd4da-2609-4a6b-affa-8b8595a7ad2c',
  aud: string;                    //  'ruelffup97egjm887cpfghal8',
  event_id: string;               //  'bff63a0b-311a-414c-b581-069e6ad65e9e',
  token_use: string;              //  'id',
  auth_time: string;              //  '1651585910',
  exp: string;                    //  'Wed May 04 13:51:50 UTC 2022',
  iat: string;                    //  'Tue May 03 13:51:50 UTC 2022',
  jti: string;                    //  '90516f15-4ce6-4b5e-ad70-f655d3271816',
  email: string;                  //  'mark@itserv.io'
}

export const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS'
};

const {
  stage = '',
  sentryLogPercentage = 0.0
} = process.env;

if (
  stage === 'prod' ||
  stage === 'qa' ||
  stage === 'dev'
) {
  Sentry.init({
    dsn: 'https://888f4f0b2d604a8ca56c5f13d1d46ae1@o1190173.ingest.sentry.io/6485309',
    environment: stage,
    tracesSampleRate: +sentryLogPercentage
  });
}

const logger = LoggerFactory.getLogger();

export async function handlerWrapper(
  event: any,
  handler: any,
  context?: any
): Promise<any> {
  try {
    logger.debug('Event:', JSON.stringify(event));
    const response = await handler(event, context) ?? {};
    logger.debug('Response:', response);

    const customSuccess = response.success;
    const customBody = response.customBody;
    const customHeaders = response.customHeaders ?? {};
    const multiValueHeaders = response.multiValueHeaders ?? {};

    delete response.success;
    delete response.customBody;
    delete response.customHeaders;
    delete response.multiValueHeaders;

    return {
      statusCode: 200,
      headers: {
        ...headers,
        ...customHeaders
      },
      multiValueHeaders,
      body: customBody ?? JSON.stringify({
        success: customSuccess ?? true,
        ...(Object.keys(response).length > 0 || Array.isArray(response)) && { payload: response }
      })
    };
  } catch (caughtError: any) {
    logger.warn(caughtError);

    const reason = caughtError.name ?? caughtError.reason ?? 'Unknown';

    if (!caughtError.isIntentionalError) {
      const sentryError = new Error(caughtError);
      sentryError.name = reason;
      Sentry.captureException(sentryError);
    }

    return {
      statusCode: caughtError.statusCode ?? caughtError.$metadata?.httpStatusCode ?? 500,
      headers,
      body: JSON.stringify({
        reason,
        error: caughtError.Error?.Message ?? caughtError.message ?? caughtError.error ?? caughtError.validationErrors ?? 'Unknown error',
        success: false
      })
    };
  }
}

export function getUserPropsFromIdToken(apiGatewayEvent: APIGatewayProxyEvent): { userName: string; email: string } {
  const {
    auth_time,
    email,
    'cognito:username': userName
  } = apiGatewayEvent.requestContext.authorizer?.claims as CognitoAuthorizerClaims;
  const isExpired = DateTime.utc() > DateTime.fromSeconds(+auth_time).plus({ days: 1 });

  if (isExpired) throwNotAuthorizedError('Token has expired. Refresh required.');

  return {
    userName,
    email
  };
}