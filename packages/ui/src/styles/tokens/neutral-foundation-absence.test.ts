import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import {
  DEPRECATED_PALETTE_TOKEN_PREFIXES,
  DEPRECATED_PALETTE_TOKENS,
  INTERACTION_SEMANTIC_ROLES,
} from './palette-inventory'

const tokensDir = join(dirname(fileURLToPath(import.meta.url)), '.')

function readTokenSources(): string {
  return [
    'palette-light.css',
    'palette-dark.css',
    'semantic-light.css',
    'semantic-dark.css',
    '../globals.css',
  ]
    .map((file) => readFileSync(join(tokensDir, file), 'utf8'))
    .join('\n')
}

describe('neutral foundation reset — absence of deprecated tokens', () => {
  const paletteLight = readFileSync(join(tokensDir, 'palette-light.css'), 'utf8')
  const paletteDark = readFileSync(join(tokensDir, 'palette-dark.css'), 'utf8')
  const combined = readTokenSources()

  it('does not declare removed palette primitives in light or dark', () => {
    for (const token of DEPRECATED_PALETTE_TOKENS) {
      expect(paletteLight, `${token} in palette-light.css`).not.toMatch(
        new RegExp(`${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:`),
      )
      expect(paletteDark, `${token} in palette-dark.css`).not.toMatch(
        new RegExp(`${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:`),
      )
    }
  })

  it('does not declare parent-aware field-bg-on-* palette tokens', () => {
    for (const prefix of DEPRECATED_PALETTE_TOKEN_PREFIXES) {
      expect(paletteLight).not.toMatch(
        new RegExp(`${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
      )
      expect(paletteDark).not.toMatch(
        new RegExp(`${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
      )
    }
  })

  it('does not reference deprecated palette tokens in token files or globals.css', () => {
    for (const token of DEPRECATED_PALETTE_TOKENS) {
      expect(combined, `reference to ${token}`).not.toContain(`var(${token})`)
    }
    for (const prefix of DEPRECATED_PALETTE_TOKEN_PREFIXES) {
      expect(combined, `reference to ${prefix}*`).not.toMatch(
        new RegExp(`var\\(${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
      )
    }
  })

  it('does not scope field-control fills under container surface utilities in globals.css', () => {
    const globals = readFileSync(join(tokensDir, '../globals.css'), 'utf8')
    expect(globals).not.toMatch(/\.bg-card[\s\S]*--field-control-bg:/)
    expect(globals).not.toMatch(/\.bg-surface-subtle[\s\S]*--field-control-bg:/)
    expect(globals).not.toMatch(/\.bg-surface-muted[\s\S]*--field-control-bg:/)
    expect(globals).not.toMatch(/\.bg-surface-strong[\s\S]*--field-control-bg:/)
  })

  it('composes interaction recipes at Layer 2 without palette interaction paints', () => {
    const semanticLight = readFileSync(join(tokensDir, 'semantic-light.css'), 'utf8')
    const semanticDark = readFileSync(join(tokensDir, 'semantic-dark.css'), 'utf8')

    for (const role of INTERACTION_SEMANTIC_ROLES) {
      expect(semanticLight, `${role} in semantic-light.css`).toContain(`${role}:`)
      expect(semanticDark, `${role} in semantic-dark.css`).toContain(`${role}:`)
    }

    expect(semanticLight).not.toMatch(/var\(--palette-control-hover-bg\)/)
    expect(semanticDark).not.toMatch(/var\(--palette-row-hover-bg\)/)
  })
})
