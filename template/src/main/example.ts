import { APIGatewayProxyEvent } from 'aws-lambda';
import { LoggerFactory } from '../../../lib/loggerFactory';

const logger = LoggerFactory.getLogger();

const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<void> => {
  logger.debug('lambdaHandler executed');
};

export const handler = async (event: APIGatewayProxyEvent) => await handlerWrapper(event, lambdaHandler);
