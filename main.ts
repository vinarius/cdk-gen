import { cpSync } from 'fs';

async function main(): Promise<void> {
  cpSync(
    'template',
    process.argv[2] ?? process.cwd(),
    { recursive: true }
  );
}

main();