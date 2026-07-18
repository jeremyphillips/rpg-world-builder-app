import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { FIELD_CONTROL_SEMANTIC_ROLES, INTERACTION_SEMANTIC_ROLES } from './palette-inventory'

const tokensDir = join(dirname(fileURLToPath(import.meta.url)), '.')

/** Theme-invariant layout tokens live only in semantic-light.css. */
const LAYOUT_SEMANTIC_ROLES = new Set(['--radius', '--radius-card'])

/** Component recipes and Layer 2 compositions may use color-mix — excluded from palette-only mapping checks. */
const RECIPE_SEMANTIC_ROLES = new Set([
  '--catalog-picker-row-surface',
  '--surface-raised-shadow',
  ...INTERACTION_SEMANTIC_ROLES,
])

function extractSemanticRoleVars(css: string): Set<string> {
  return new Set([...css.matchAll(/^\s*(--(?!palette-)[\w-]+)\s*:/gm)].map((match) => match[1]!))
}

function colorSemanticRoles(css: string): string[] {
  return [...extractSemanticRoleVars(css)].filter((role) => !LAYOUT_SEMANTIC_ROLES.has(role)).sort()
}

function extractRoleValue(css: string, role: string): string | undefined {
  const match = css.match(
    new RegExp(`${role.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:\\s*([^;]+);`),
  )
  return match?.[1]?.trim()
}

function mappingRoles(css: string): string[] {
  return colorSemanticRoles(css).filter((role) => !RECIPE_SEMANTIC_ROLES.has(role))
}

describe('semantic token parity', () => {
  const lightCss = readFileSync(join(tokensDir, 'semantic-light.css'), 'utf8')
  const darkCss = readFileSync(join(tokensDir, 'semantic-dark.css'), 'utf8')

  it('declares the same semantic role names in light and dark', () => {
    expect(colorSemanticRoles(lightCss)).toEqual(colorSemanticRoles(darkCss))
  })

  it('declares required field-control roles in both themes', () => {
    const lightRoles = extractSemanticRoleVars(lightCss)
    const darkRoles = extractSemanticRoleVars(darkCss)

    for (const role of FIELD_CONTROL_SEMANTIC_ROLES) {
      expect(lightRoles.has(role), `missing in semantic-light.css: ${role}`).toBe(true)
      expect(darkRoles.has(role), `missing in semantic-dark.css: ${role}`).toBe(true)
    }
  })

  it('maps semantic color roles without raw color literals or recipe references', () => {
    const rawColorPattern = /:\s*(oklch|#[0-9a-f]{3,8}|rgb)/i
    expect(rawColorPattern.test(lightCss)).toBe(false)
    expect(rawColorPattern.test(darkCss)).toBe(false)

    const validRefPattern = /^var\(--[\w-]+\)$/

    for (const role of mappingRoles(lightCss)) {
      const value = extractRoleValue(lightCss, role)
      expect(value, `${role} has no value`).toBeTruthy()
      expect(
        validRefPattern.test(value!),
        `${role} must reference var(--palette-*) or var(--<layer-2-role>), got ${value}`,
      ).toBe(true)
      expect(value).not.toMatch(/catalog-picker-row-surface|surface-raised-shadow/)
    }
  })
})
