import { cpSync, readdirSync } from 'fs';

export function main(): void {
  console.log('__dirname:', __dirname);
  console.log('process.cwd():', process.cwd());
  console.log('readdirSync(__dirname):', readdirSync(__dirname));

  cpSync(
    './template',
    process.argv[2] ?? process.cwd(),
    { recursive: true }
  );
}

main();