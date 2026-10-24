import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const SKIP_DIR_NAMES = new Set(['node_modules', 'dist', '__tests__'])

export function collectSourceTreeFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      if (SKIP_DIR_NAMES.has(entry)) continue
      collectSourceTreeFiles(fullPath, acc)
      continue
    }
    if (!/\.(ts|tsx)$/.test(entry)) continue
    if (/\.(test|stories)\./.test(entry)) continue
    acc.push(fullPath)
  }
  return acc
}
