export const environments = {
  dev: 'development',
  stg: 'staging',
  prd: 'production',
} as const;

export type EnvironmentKeys = keyof typeof environments;
export type Environments = (typeof environments)[EnvironmentKeys];
