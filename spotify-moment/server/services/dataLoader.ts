import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

function resolveDataDir(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    join(here, '../data'),
    join(here, '../../data'),
    join(process.cwd(), 'data'),
    join(process.cwd(), 'spotify-moment/server/data'),
  ];

  for (const dir of candidates) {
    if (existsSync(join(dir, 'tracks.json'))) return dir;
  }

  throw new Error(`tracks.json not found (cwd=${process.cwd()})`);
}

const DATA_DIR = resolveDataDir();

export function loadJson<T>(filename: string): T {
  const path = join(DATA_DIR, filename);
  return JSON.parse(readFileSync(path, 'utf-8')) as T;
}
