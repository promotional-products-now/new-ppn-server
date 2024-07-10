import { execSync } from 'child_process';

export function fetchSecrets(): Record<string, string> {
  try {
    const secrets = execSync(
      `doppler secrets download --no-file --format json`,
    ).toString('utf8');

    return JSON.parse(secrets);
  } catch (error) {
    process.exit(1);
  }
}
