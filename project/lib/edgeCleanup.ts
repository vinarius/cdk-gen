import { existsSync, readFileSync, writeFileSync } from 'fs';
import { fromRoot } from './fromRoot';

export function queueEdgeLambdaCleanup(functionName: string): void {
  const cleanupQueuePath = fromRoot(['dist', 'edgeCleanupQueue.json']);

  if (!existsSync(cleanupQueuePath)) {
    writeFileSync(cleanupQueuePath, JSON.stringify({
      edgeLambdaNames: []
    }));
  }

  const { edgeLambdaNames } = JSON.parse(readFileSync(cleanupQueuePath).toString());

  edgeLambdaNames.push(functionName);

  writeFileSync(cleanupQueuePath, JSON.stringify({
    edgeLambdaNames
  }));
}