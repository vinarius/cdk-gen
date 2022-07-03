interface StageDefinition {
  branch: string;
  alias: string;
  env: {
    account: string;
    region: string;
  };
  description?: string;
  deployMfa: boolean;
}

export interface ApplicationDefinition extends StageDefinition {
  project: string;
  stage: string;
  isStagingEnv: boolean;
  profile: string;
}

export const project = 'todo';
export const repo = 'todo';

export const stages: StageDefinition[] = [
  {
    branch: 'todo',
    alias: 'todo',
    env: {
      account: 'todo',
      region: 'todo'
    },
    deployMfa: true, // TODO:
  }
];
