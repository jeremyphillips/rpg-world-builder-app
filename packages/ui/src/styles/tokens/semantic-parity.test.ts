import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const tokensDir = join(dirname(fileURLToPath(import.meta.url)), '.')

/** Theme-invariant layout tokens live only in semantic-light.css. */
const LAYOUT_SEMANTIC_ROLES = new Set(['--radius', '--radius-card'])

function extractSemanticRoleVars(css: string): Set<string> {
  return new Set([...css.matchAll(/^\s*(--(?!palette-)[\w-]+)\s*:/gm)].map((match) => match[1]!))
}

function colorSemanticRoles(css: string): string[] {
  return [...extractSemanticRoleVars(css)].filter((role) => !LAYOUT_SEMANTIC_ROLES.has(role)).sort()
}

describe('semantic token parity', () => {
  const lightCss = readFileSync(join(tokensDir, 'semantic-light.css'), 'utf8')
  const darkCss = readFileSync(join(tokensDir, 'semantic-dark.css'), 'utf8')

  it('declares the same semantic role names in light and dark', () => {
    expect(colorSemanticRoles(lightCss)).toEqual(colorSemanticRoles(darkCss))
  })

  it('maps semantic roles to palette primitives only (no raw color literals)', () => {
    const rawColorPattern = /:\s*(oklch|#[0-9a-f]{3,8}|rgb)/i
    expect(rawColorPattern.test(lightCss)).toBe(false)
    expect(rawColorPattern.test(darkCss)).toBe(false)
  })
})
