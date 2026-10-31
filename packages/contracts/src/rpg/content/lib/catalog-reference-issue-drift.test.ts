/**
 * Hard-fail scan for catalog-reference wire codes and resolution predicates.
 * The guard cannot prove that every future reference field was registered.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const REPO_ROOT = join(import.meta.dirname, '../../../../../../')

const SCAN_ROOTS = ['packages/contracts/src', 'apps/api/src', 'apps/dashboard/src']

const CODE_OWNER = 'packages/contracts/src/rpg/content/lib/catalog-reference-issues.ts'

const WIRE_CODES = [
  'unknown_spell',
  'spell_not_referenceable',
  'spell_catalog_unavailable',
  'unknown_skill',
  'skill_not_referenceable',
  'skill_not_campaign_eligible',
  'skill_catalog_unavailable',
  'unknown_equipment',
  'equipment_catalog_unavailable',
] as const

const PREDICATE_CALL_EXCEPTIONS = new Set([
  'packages/contracts/src/rpg/content/lib/content-resolution-policy.ts',
  'packages/contracts/src/rpg/runtime/campaign/content-resolution-policy.ts',
  'packages/contracts/src/rpg/runtime/campaign/content-purpose-selectors.ts',
  'packages/contracts/src/rpg/content/lib/catalog-reference-issues.ts',
  'apps/dashboard/src/features/content/lib/form-options/content-form-options.ts',
  'apps/dashboard/src/features/content/lib/form-options/content-reference-catalog.lib.ts',
  'apps/dashboard/src/features/content/locations/lib/hierarchy/location-parent-replacement.ts',
])

const KIND_SUFFIX =
  /(['"`])([a-z0-9_]+(?:_not_referenceable|_not_campaign_eligible|_catalog_unavailable))\1/g
const PREDICATE_CALL = /isContent(?:Referenceable|CampaignEligible)\s*\(/g

function collectSourceFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    if (statSync(fullPath).isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist') continue
      files.push(...collectSourceFiles(fullPath))
      continue
    }
    if (!/\.tsx?$/.test(entry)) continue
    if (/\.(?:test|stories)\.tsx?$/.test(entry)) continue
    if (entry.endsWith('.d.ts')) continue
    files.push(fullPath)
  }
  return files
}

function stripComments(source: string): string {
  let out = ''
  let i = 0
  let quote: "'" | '"' | '`' | null = null
  while (i < source.length) {
    const char = source[i]!
    const next = source[i + 1]
    if (quote) {
      out += char
      if (char === '\\') {
        out += next ?? ''
        i += 2
        continue
      }
      if (char === quote) quote = null
      i += 1
      continue
    }
    if (char === "'" || char === '"' || char === '`') {
      quote = char
      out += char
      i += 1
      continue
    }
    if (char === '/' && next === '/') {
      i += 2
      while (i < source.length && source[i] !== '\n') i += 1
      continue
    }
    if (char === '/' && next === '*') {
      i += 2
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) i += 1
      i += 2
      continue
    }
    out += char
    i += 1
  }
  return out
}

function quotedCodes(source: string): string[] {
  const found = new Set<string>()
  for (const code of WIRE_CODES) {
    if (
      source.includes(`'${code}'`) ||
      source.includes(`"${code}"`) ||
      source.includes(`\`${code}\``)
    ) {
      found.add(code)
    }
  }
  for (const match of source.matchAll(KIND_SUFFIX)) {
    const code = match[2]
    if (code) found.add(code)
  }
  return [...found]
}

describe('catalog reference issue drift', () => {
  const files = SCAN_ROOTS.flatMap((root) => collectSourceFiles(join(REPO_ROOT, root)))

  it('keeps catalog-reference wire codes in the shared table', () => {
    const offenders: string[] = []
    for (const file of files) {
      const repoPath = relative(REPO_ROOT, file)
      if (repoPath === CODE_OWNER) continue
      const codes = quotedCodes(stripComments(readFileSync(file, 'utf8')))
      if (codes.length > 0) offenders.push(`${repoPath}: ${codes.join(', ')}`)
    }
    expect(offenders).toEqual([])
  })

  it('keeps resolution-predicate calls on the exception list', () => {
    const offenders: string[] = []
    for (const file of files) {
      const repoPath = relative(REPO_ROOT, file)
      if (PREDICATE_CALL_EXCEPTIONS.has(repoPath)) continue
      const source = stripComments(readFileSync(file, 'utf8'))
      if (PREDICATE_CALL.test(source)) offenders.push(repoPath)
      PREDICATE_CALL.lastIndex = 0
    }
    expect(offenders).toEqual([])
  })
})
