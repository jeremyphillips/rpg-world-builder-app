import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const REPO_ROOT = fileURLToPath(new URL('../../../..', import.meta.url))
const TAILWIND_THEME_CSS = join(REPO_ROOT, 'packages/ui/src/styles/tokens/tailwind-theme.css')

const SCAN_ROOTS = ['apps', 'packages'].map((segment) => join(REPO_ROOT, segment))
const SKIP_DIRECTORIES = new Set([
  'node_modules',
  'dist',
  '.next',
  'coverage',
  '.turbo',
  'storybook-static',
])
const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.css', '.md']

const NUMBERED_HEADING = /--text-heading-[1-5]\b/
const HEADING_3_MD = '--text-heading-' + '3-md'
const OVERSIZED_STEP = /(?:--|\b)text-[5-9]xl\b/
const RETIRED_META_SIZE = new RegExp('text-' + '(?:2xs|xs|sm)' + '-' + 'meta' + '\\b')
const RETIRED_FINE_2XS = new RegExp('--text-fine-' + '2xs\\b|text-fine-' + '2xs\\b')

const REQUIRED_THEME_TOKENS = [
  '--text-md:',
  '--text-fine-xs:',
  '--text-fine-xs--line-height:',
  '--text-fine-sm:',
  '--text-fine-sm--line-height:',
  '--text-fine-md:',
  '--text-eyebrow-xs:',
  '--text-eyebrow-sm:',
  '--text-eyebrow-md:',
  '--text-badge-sm:',
  '--text-badge-md:',
  '--text-chip-sm:',
  '--text-chip-md:',
  '--text-chip-lg:',
  '--text-table-body:',
  '--text-table-stat:',
  '--text-control-action-xs:',
]

function collect(directory: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (SKIP_DIRECTORIES.has(entry.name)) continue
    const absolutePath = join(directory, entry.name)
    if (entry.isDirectory()) {
      collect(absolutePath, acc)
      continue
    }
    if (SOURCE_EXTENSIONS.some((extension) => entry.name.endsWith(extension))) {
      acc.push(absolutePath)
    }
  }
  return acc
}

function violationsIn(source: string): string[] {
  const hits: string[] = []
  if (NUMBERED_HEADING.test(source)) hits.push('numbered heading token')
  if (source.includes(HEADING_3_MD)) hits.push('heading-3-md token')
  if (OVERSIZED_STEP.test(source)) hits.push('text-5xl+ step')
  if (RETIRED_META_SIZE.test(source)) hits.push('retired meta font size')
  if (RETIRED_FINE_2XS.test(source)) hits.push('retired fine 2xs token')
  return hits
}

describe('curated type scale ratchet', () => {
  it('rejects numbered heading tokens and steps above text-4xl', () => {
    const hits: string[] = []
    for (const root of SCAN_ROOTS) {
      for (const file of collect(root)) {
        if (file.endsWith('type-scale-ratchet.test.ts')) continue
        const reasons = violationsIn(readFileSync(file, 'utf8'))
        if (reasons.length > 0) {
          hits.push(`${relative(REPO_ROOT, file)}: ${reasons.join(', ')}`)
        }
      }
    }
    expect(hits).toEqual([])
  })

  it('keeps class-backed font sizes in @theme after the scale reset', () => {
    const theme = readFileSync(TAILWIND_THEME_CSS, 'utf8')
    const resetAt = theme.indexOf('--text-*: initial')
    expect(resetAt).toBeGreaterThan(-1)
    const afterReset = theme.slice(resetAt)
    const missing = REQUIRED_THEME_TOKENS.filter((token) => !afterReset.includes(token))
    expect(missing).toEqual([])
  })
})
