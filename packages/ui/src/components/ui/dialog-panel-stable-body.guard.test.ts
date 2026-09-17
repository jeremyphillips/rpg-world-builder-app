import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const repoRoot = join(fileURLToPath(new URL('.', import.meta.url)), '../../../../..')

/** Production call sites allowed to use Modal.Body stableBody — review inset when adding entries. */
const STABLE_BODY_ALLOWLIST = new Set([
  'apps/dashboard/src/features/content/components/table-builder/table-builder-modal.tsx',
  'apps/dashboard/src/lib/create-flow/create-modal-shell.tsx',
])

function collectSourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist' || entry === '.git') continue
      collectSourceFiles(fullPath, acc)
      continue
    }
    if (/\.(tsx|ts)$/.test(entry)) acc.push(fullPath)
  }
  return acc
}

function findStableBodyCallSites(): string[] {
  const roots = [join(repoRoot, 'apps/dashboard/src'), join(repoRoot, 'apps/bench/src')]

  const matches: string[] = []

  for (const root of roots) {
    for (const file of collectSourceFiles(root)) {
      const source = readFileSync(file, 'utf8')
      if (!source.includes('stableBody')) continue
      if (!source.includes('<Modal.Body') || !source.includes('stableBody')) continue
      matches.push(relative(repoRoot, file))
    }
  }

  return [...new Set(matches)].sort()
}

describe('stableBody production allowlist', () => {
  it('requires every stableBody consumer to be reviewed for inset ownership', () => {
    const callSites = findStableBodyCallSites()
    const productionSites = callSites.filter(
      (path) => !path.includes('.stories.') && !path.includes('.test.'),
    )

    expect(productionSites).toEqual([...STABLE_BODY_ALLOWLIST].sort())
  })
})
