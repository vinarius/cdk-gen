import { cpSync } from 'fs';
import { resolve } from 'path';

export function main(): void {
  cpSync(
    resolve(__dirname, 'template'),
    process.argv[2] ?? process.cwd(),
    { recursive: true }
  );
}

main();