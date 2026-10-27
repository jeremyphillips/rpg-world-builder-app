import { readFileSync, realpathSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const stylesDir = join(dirname(fileURLToPath(import.meta.url)), '.')
const globalsPath = join(stylesDir, 'globals.css')

type TailwindNode = {
  compile: (
    css: string,
    options: { base: string; from?: string; onDependency: (path: string) => void },
  ) => Promise<{ build: (candidates: string[]) => string }>
}

function loadTailwindNode(): TailwindNode {
  const fromUi = createRequire(import.meta.url)
  const viteEntry = realpathSync(fromUi.resolve('@tailwindcss/vite'))
  const vitePackage = join(dirname(viteEntry), '..', 'package.json')
  return createRequire(vitePackage)('@tailwindcss/node') as TailwindNode
}

/** Focused probe set from decompose_globals.css Pass 1 equivalence checklist. */
const CANDIDATE_UTILITIES = [
  'text-xs',
  'text-md',
  'text-badge-sm',
  'text-table-body',
  'text-table-stat',
  'text-style-body',
  'text-style-supporting',
  'text-style-caption',
  'text-style-field-label-md',
  'heading-style-dialog-title',
  'heading-style-page',
  'prose',
  'prose-sm',
  'prose-md',
  'border-input',
  'bg-input',
  'bg-field-container',
  'border-choice-control',
  'w-sidebar',
  'z-toast',
  'size-image-preview',
  'size-hero-emblem',
  'max-w-hero-emblem',
  'size-control-action-compact',
  'text-control-action-xs',
  'animate-accordion-down',
  'animate-attention-ring',
  'scrollbar-slim',
  'bg-message-bubble-self',
  'bg-status-icon-idle',
  'shadow-surface-raised',
  'max-w-page-narrow',
] as const

describe('globals.css compile ratchet', () => {
  it('builds always-on CSS from the entry graph', async () => {
    const tailwind = loadTailwindNode()
    const source = readFileSync(globalsPath, 'utf8')
    const compiler = await tailwind.compile(source, {
      base: stylesDir,
      from: globalsPath,
      onDependency() {},
    })
    const built = compiler.build([])
    expect(built.length).toBeGreaterThan(1000)
    expect(built).toContain('@layer theme')
    expect(built).toContain('--text-md:')
  })

  it('emits the focused custom utility probe set for dashboard/public candidates', async () => {
    const tailwind = loadTailwindNode()
    const source = readFileSync(globalsPath, 'utf8')
    const compiler = await tailwind.compile(source, {
      base: stylesDir,
      from: globalsPath,
      onDependency() {},
    })
    const built = compiler.build([...CANDIDATE_UTILITIES])
    const missing = CANDIDATE_UTILITIES.filter((name) => !built.includes(`.${name}`))
    expect(missing, `missing utility rules: ${missing.join(', ')}`).toEqual([])
  })
})
