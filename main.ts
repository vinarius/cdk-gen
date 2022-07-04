import { cpSync, readdirSync } from 'fs';

export function main(): void {
  console.log(readdirSync(__dirname));
  cpSync(
    'template',
    process.argv[2] ?? process.cwd(),
    { recursive: true }
  );
}

main();