import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const SCAN_ROOTS = ['packages/ui/src', 'apps/dashboard/src', 'apps/bench/src'] as const
const SKIP_DIRS = new Set(['node_modules', 'dist', 'storybook-static', 'coverage'])
const SOURCE_FILE = /\.(css|ts|tsx)$/
const SKIP_FILE = /\.(test|stories)\./

const DECLARATION = /--rpg-content-top-inset\s*:\s*([^;}\]]*)/g

export type ContentTopInsetSelfReference = {
  filePath: string
  line: number
  value: string
}

/** Drop block comments and full-line // comments so a mention is not a declaration. */
export function stripContentTopInsetScanComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
}

export function findContentTopInsetSelfReferences(source: string): string[] {
  const stripped = stripContentTopInsetScanComments(source)
  const hits: string[] = []
  for (const match of stripped.matchAll(DECLARATION)) {
    const value = match[1] ?? ''
    if (value.includes('var(--rpg-content-top-inset')) hits.push(value.trim())
  }
  return hits
}

function walk(dir: string, acc: string[]) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      if (SKIP_DIRS.has(entry)) continue
      walk(fullPath, acc)
      continue
    }
    if (!SOURCE_FILE.test(entry) || SKIP_FILE.test(entry)) continue
    acc.push(fullPath)
  }
}

export function collectContentTopInsetSelfReferences(
  repoRoot: string,
): ContentTopInsetSelfReference[] {
  const hits: ContentTopInsetSelfReference[] = []
  for (const root of SCAN_ROOTS) {
    const files: string[] = []
    walk(join(repoRoot, root), files)
    for (const filePath of files) {
      const source = readFileSync(filePath, 'utf8')
      const stripped = stripContentTopInsetScanComments(source)
      for (const match of stripped.matchAll(DECLARATION)) {
        const value = match[1] ?? ''
        if (!value.includes('var(--rpg-content-top-inset')) continue
        const line = stripped.slice(0, match.index ?? 0).split('\n').length
        hits.push({
          filePath: relative(repoRoot, filePath),
          line,
          value: value.trim(),
        })
      }
    }
  }
  return hits
}
