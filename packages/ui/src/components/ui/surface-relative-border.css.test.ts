import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const uiDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(uiDir, '../../../../..')

/** Files that still bake a root border token, with the reason each stays. */
const BORDER_TOKEN_ALLOWLIST: Record<string, string> = {
  'compact-label.css':
    'Unselected chips paint --background, so a root-baked border matches that fill.',
  'button.css': 'Split and expanded var(--border) are control seams, not surface planes.',
  'boolean-field.css': 'Boolean hover uses the choice-control recipe.',
  'media-crop-editor.css': 'Crop guides do not establish a semantic plane.',
  'media-emblem-editor.css': 'The emblem viewport does not establish a semantic plane.',
}

const BAKED_BORDER_TOKEN = /var\(--border(?:-subtle|-default|-strong)?\)/

const DASHBOARD_CSS = [
  'apps/dashboard/src/features/content/lib/entity/row-list/dash-entity-row-list.css',
  'apps/dashboard/src/features/content/lib/entity/surfaces/cards/content/dash-entity-card.css',
] as const

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

function leafDeclarations(css: string): string[] {
  const declarations: string[] = []
  let source = stripComments(css)
  while (true) {
    const match = /\{([^{}]*)\}/.exec(source)
    if (!match || match.index === undefined) break
    declarations.push(match[1] ?? '')
    source = source.slice(0, match.index) + source.slice(match.index + match[0].length)
  }
  return declarations
}

function componentStylesheets(): { name: string; css: string }[] {
  const uiSheets = readdirSync(uiDir)
    .filter((name) => name.endsWith('.css'))
    .map((name) => ({ name, css: readFileSync(join(uiDir, name), 'utf8') }))
  const dashboardSheets = DASHBOARD_CSS.map((relativePath) => ({
    name: relativePath,
    css: readFileSync(join(repoRoot, relativePath), 'utf8'),
  }))
  return [...uiSheets, ...dashboardSheets]
}

describe('surface-relative border gate', () => {
  const sheets = componentStylesheets()

  it('records a one-line reason for each allowlisted stylesheet', () => {
    for (const [name, reason] of Object.entries(BORDER_TOKEN_ALLOWLIST)) {
      expect(reason.trim().length).toBeGreaterThan(0)
      expect(sheets.some((sheet) => sheet.name === name)).toBe(true)
    }
  })

  it('does not rebind --surface-current in the same rule as a baked border token', () => {
    const failures: string[] = []
    for (const sheet of sheets) {
      for (const declaration of leafDeclarations(sheet.css)) {
        if (declaration.includes('--surface-current') && declaration.includes('var(--border')) {
          failures.push(sheet.name)
        }
      }
    }
    expect(failures).toEqual([])
  })

  it('keeps baked border tokens out of component rules outside the allowlist', () => {
    const failures = sheets
      .filter((sheet) => !BORDER_TOKEN_ALLOWLIST[sheet.name])
      .filter((sheet) => BAKED_BORDER_TOKEN.test(stripComments(sheet.css)))
      .map((sheet) => sheet.name)
    expect(failures).toEqual([])
  })
})
