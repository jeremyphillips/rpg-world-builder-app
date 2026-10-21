import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { findTextStyleStackViolations, readSource } from './text-style-stack-ratchet.lib'

const REPO_ROOT = fileURLToPath(new URL('../../../../../', import.meta.url))

const SCAN_ROOTS = [
  'apps/dashboard/src',
  'apps/public/src',
  'apps/bench/src',
  'packages/ui/src',
  'packages/campaign-invite/src',
].map((segment) => join(REPO_ROOT, segment))

/** Bare caption size utilities in dashboard variant modules — use `text-style-*` composites. */
const FORBIDDEN_VARIANTS_TEXT_XS = /\btext-xs\b/

function collect(directory: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = join(directory, entry.name)
    if (entry.isDirectory()) {
      collect(absolutePath, acc)
      continue
    }
    if (entry.name.endsWith('.variants.ts')) acc.push(absolutePath)
    else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) acc.push(absolutePath)
  }
  return acc
}

describe('text-style stack ratchet', () => {
  it('keeps migrated copy on text-style composites instead of retired stacks', () => {
    const hits: { file: string; reason: string }[] = []
    for (const root of SCAN_ROOTS) {
      for (const file of collect(root)) {
        const source = readSource(file)
        hits.push(...findTextStyleStackViolations(source, file))
      }
    }
    expect(hits).toEqual([])
  })

  it('forbids bare text-xs in dashboard *.variants.ts modules', () => {
    const dashboardSrc = join(REPO_ROOT, 'apps/dashboard/src')
    const hits: string[] = []
    for (const file of collect(dashboardSrc)) {
      if (!file.endsWith('.variants.ts')) continue
      const source = readSource(file)
      if (FORBIDDEN_VARIANTS_TEXT_XS.test(source) && !source.includes('text-xs-meta')) {
        hits.push(file)
      }
    }
    expect(hits).toEqual([])
  })
})
