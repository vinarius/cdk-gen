/* eslint-disable @typescript-eslint/no-explicit-any */
import { WriteRequest } from '@aws-sdk/client-dynamodb';
import {
  BatchWriteCommandOutput,
  DynamoDBDocument,
  GetCommand, ScanCommandOutput,
  UpdateCommand, UpdateCommandOutput
} from '@aws-sdk/lib-dynamodb';
export interface DynamoScanItemsResponse {
  [key: string]: any;
}

export interface BatchPutWriteResponse {
  success: boolean;
  processedItemsCount: number;
  unprocessedItemsCount: number;
  unprocessedItems: { [key: string]: any; }[];
}

export async function batchWrite(
  client: DynamoDBDocument,
  tableName: string,
  dynamoItems: { [key: string]: any; }[]
): Promise<BatchPutWriteResponse> {
  const batchesOutput: BatchWriteCommandOutput[] = [];
  let batch = [];
  let attempts = 0;
  let pendingItems: any = [...dynamoItems];
  let remainingItemsCount = pendingItems.length;
  const response = {
    success: true,
    processedItemsCount: 0,
    unprocessedItemsCount: 0,
    unprocessedItems: []
  };

  do {
    for (const item of pendingItems) {
      response.processedItemsCount++;

      if (batch.length < 25) {
        batch.push({
          PutRequest: {
            Item: item
          }
        });

        remainingItemsCount--;
      }

      if (batch.length === 25) {
        const batchWrite = await client.batchWrite({
          RequestItems: {
            [tableName]: batch
          }
        });

        batchesOutput.push(batchWrite);
        batch = [];
      }
    }

    if (batch.length > 0) {
      const batchWrite = await client.batchWrite({
        RequestItems: {
          [tableName]: batch
        }
      }).catch(error => {
        throw new Error(error.message);
      });

      batchesOutput.push(batchWrite);
      batch = [];
    }

    if (batchesOutput.some(batchOutput => Object.keys(batchOutput?.UnprocessedItems as any).length ?? 0 > 0)) {
      attempts++;

      const unprocessedItems = batchesOutput.flatMap(batchOutput => batchOutput?.UnprocessedItems?.[tableName].map((table: WriteRequest) => table.PutRequest?.Item));

      pendingItems = [...unprocessedItems];
      remainingItemsCount = pendingItems.length;
      response.processedItemsCount -= unprocessedItems.length;
    }
  } while (remainingItemsCount > 0 && attempts < 10);

  if (remainingItemsCount > 0) {
    response.success = false;
    response.processedItemsCount -= pendingItems.length;
    response.unprocessedItemsCount = pendingItems.length;
    response.unprocessedItems = pendingItems;
  }

  return response;
}

/**
 * Get item(s) from a DynamoDB table.
 * 
 * @param {DynamoDBDocument} client - The DynamoDB client
 * @param {string} tableName - The DynamoDB table name
 * @param {Object} params - The keys to include in the query
 * @param {string} attribute - The DynamoDB attribute you'd like returned
 * @returns {DynamoDBItem}[]
 */
export const getItem = async (
  client: DynamoDBDocument,
  tableName: string,
  params: object,
  attribute: string
) => {
  return await client.send(
    new GetCommand({
      TableName: tableName,
      Key: params,
      ProjectionExpression: attribute
    })
  );
};

export async function scan(
  client: DynamoDBDocument,
  tableName: string
): Promise<DynamoScanItemsResponse[]> {
  let nextToken;
  const totalData: DynamoScanItemsResponse[] = [];

  do {
    const response: ScanCommandOutput = await client.scan({
      TableName: tableName,
      ExclusiveStartKey: nextToken
    });

    totalData.push(...response.Items as DynamoScanItemsResponse[]);
    nextToken = response.LastEvaluatedKey;
  } while (nextToken);

  return totalData;
}

interface DynamoKey {
  partitionKey: { [key: string]: any; };
  sortKey?: { [key: string]: any; };
}

export async function incrementItemVersion(
  client: DynamoDBDocument,
  tableName: string,
  key: DynamoKey,
  incrementValue: number = 1
): Promise<UpdateCommandOutput | void> {
  const { partitionKey, sortKey = {} } = key;
  const partitionKeyName = Object.keys(partitionKey)[0];
  const partitionKeyValue = Object.values(partitionKey)[0];
  const sortKeyName = Object.keys(sortKey)[0];
  const sortKeyValue = Object.values(sortKey)[0];
  let KeyConditionExpression = `${partitionKeyName} = :${partitionKeyName}`;

  if (sortKey) KeyConditionExpression += ` AND ${sortKeyName} = :${sortKeyName}`;

  const queryResponse = await client.query({
    TableName: tableName,
    KeyConditionExpression,
    ExpressionAttributeValues: {
      [`:${partitionKeyName}`]: partitionKeyValue,
      ...sortKey && { [`:${sortKeyName}`]: sortKeyValue }
    }
  });

  if (!queryResponse) return;

  return await client.send(new UpdateCommand({
    TableName: tableName,
    Key: {
      [partitionKeyName]: partitionKeyValue,
      ...sortKey && { [sortKeyName as string]: sortKeyValue }
    },
    UpdateExpression: 'set latest = latest + :increment',
    ExpressionAttributeValues: {
      ':increment': incrementValue
    },
    ReturnValues: 'UPDATED_NEW'
  }));
}
