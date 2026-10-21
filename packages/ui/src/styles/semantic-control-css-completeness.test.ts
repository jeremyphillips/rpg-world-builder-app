import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  SEMANTIC_CONTROL_CSS_REGISTRY,
  validateSemanticControlCssCompleteness,
  type SemanticControlCssRegistryEntry,
} from './semantic-control-css-completeness.lib'

describe('semantic control CSS completeness', () => {
  it('validates every registered component sheet', () => {
    const failures = SEMANTIC_CONTROL_CSS_REGISTRY.flatMap((entry) =>
      validateSemanticControlCssCompleteness(entry),
    )
    expect(failures).toEqual([])
  })

  it('exempts dash custom properties and still requires shared geometry', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'semantic-css-'))
    const filePath = path.join(dir, 'dash-card.css')
    writeFileSync(
      filePath,
      `
        .dash-card--info { color: var(--foreground); --dash-card-bg: var(--card); }
        .dash-card--info { color: var(--foreground); }
      `,
    )

    const entry: SemanticControlCssRegistryEntry = {
      filePath,
      dimensions: [{ modifierPrefix: 'dash-card--info', requiredProperties: ['color'] }],
    }

    expect(validateSemanticControlCssCompleteness({ ...entry, classPrefix: 'dash' })).toEqual([])
    expect(
      validateSemanticControlCssCompleteness({ ...entry, classPrefix: 'ui' }).length,
    ).toBeGreaterThan(0)
  })

  it('reads a nested modifier written as &.ui-card--static', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'semantic-css-'))
    const filePath = path.join(dir, 'card.css')
    writeFileSync(
      filePath,
      `
        .ui-card {
          &.ui-card--static { transition-property: color; }
        }
      `,
    )

    expect(
      validateSemanticControlCssCompleteness({
        filePath,
        dimensions: [
          { modifierPrefix: 'ui-card--static', requiredProperties: ['transition-property'] },
        ],
      }),
    ).toEqual([])
  })
})
