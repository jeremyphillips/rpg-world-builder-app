import { createElement } from 'react'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { validateSemanticControlCssCompleteness } from '@rpg/ui/test-utils'

import {
  ENTITY_SURFACE_DEFAULT_EDGES,
  resolveEntitySurfaceEdges,
} from '../../../../anatomy/entity-surface-edges.lib'
import type { EntityAnatomyTrailing } from '../../../../anatomy/entity-anatomy-trailing.types'
import { entityCardBodyClassName } from '../entity-card-body-class-name.lib'
import { entityCardFrameClassName } from '../entity-card-frame.lib'

const button = () => createElement('button', { type: 'button' })
const utilityTrailing: EntityAnatomyTrailing = { kind: 'utility', content: button() }
const actionTrailing: EntityAnatomyTrailing = { kind: 'action', content: button() }
const groupTrailing: EntityAnatomyTrailing = {
  kind: 'group',
  primary: button(),
  secondary: { kind: 'price', label: '15 GP' },
}

const dashEntityCardCssPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../dash-entity-card.css',
)

const dashEntitySurfaceCssPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../dash-entity-surface.css',
)

describe('entity card surface contract', () => {
  it('keeps perimeter and content inset as separate owners', () => {
    const frame = entityCardFrameClassName({
      density: 'compact',
      edges: ENTITY_SURFACE_DEFAULT_EDGES,
      leadingUtilityCount: 0,
    })

    expect(frame).not.toMatch(/\bpy-\d/)
    expect(frame).not.toMatch(/\bp[xytblr]-\d/)
    expect(frame).toContain('dash-entity-card')
    expect(frame).toContain('dash-entity-surface--compact')
    expect(frame).not.toContain('dash-entity-card--compact')
    expect(frame).not.toMatch(/pl-\[var\(--entity-surface-inline-start\)\]/)
    expect(frame).not.toMatch(/\[--entity-surface-inset:/)
  })

  it('does not reference removed catalog row surface tokens', () => {
    const frame = entityCardFrameClassName({
      density: 'compact',
      edges: ENTITY_SURFACE_DEFAULT_EDGES,
      leadingUtilityCount: 0,
    })
    expect(frame).not.toContain('bg-catalog-picker-row-surface')
    expect(frame).not.toContain('surface=')
  })

  it('registers dash-entity-card semantic CSS completely', () => {
    const failures = validateSemanticControlCssCompleteness({
      filePath: dashEntityCardCssPath,
      classPrefix: 'dash',
      dimensions: [
        {
          modifierPrefix: 'dash-entity-card__content',
          requiredProperties: ['padding-inline-start', 'padding-inline-end', 'padding-block'],
        },
      ],
    })
    expect(failures).toEqual([])
  })

  it('shares wash chrome and keeps tone on each modifier', () => {
    const css = readFileSync(dashEntityCardCssPath, 'utf8')
    const grouped = css.match(
      /\.dash-entity-card__body--disclosure-wash,\s*\.dash-entity-card__body--catalog-wash \{([^}]+)\}/,
    )
    const disclosure = css.match(/\.dash-entity-card__body--disclosure-wash \{([^}]+)\}/g)
    const catalog = css.match(/\.dash-entity-card__body--catalog-wash \{([^}]+)\}/g)

    expect(grouped?.[1]).toContain('border-top-width: 1px')
    expect(grouped?.[1]).toContain('border-top-style: solid')
    expect(grouped?.[1]).toContain('padding-block: calc(var(--spacing) * 3)')
    expect(grouped?.[1]).not.toContain('background-color')
    expect(grouped?.[1]).not.toContain('border-color')

    const disclosureTone = disclosure?.find((rule) => rule.includes('background-color'))
    const catalogTone = catalog?.find((rule) => rule.includes('background-color'))
    expect(disclosureTone).toContain('background-color: var(--background)')
    expect(disclosureTone).toContain('--surface-current: var(--background)')
    expect(disclosureTone).not.toContain('border-top-width')
    expect(disclosureTone).not.toContain('padding-block')
    expect(catalogTone).toContain('background-color: var(--surface-subtle)')
    expect(catalogTone).toContain('--surface-current: var(--surface-subtle)')
    expect(catalogTone).not.toContain('border-top-width')
    expect(catalogTone).not.toContain('padding-block')

    expect(css.indexOf(grouped?.[0] ?? '')).toBeLessThan(css.indexOf(disclosureTone ?? ''))
    expect(css.indexOf(disclosureTone ?? '')).toBeLessThan(css.indexOf(catalogTone ?? ''))
    expect(css).not.toContain('dash-entity-card__body--wash')
    expect(css).not.toContain('!important')
  })

  it('fills the available header region for full-width entity anatomy', () => {
    const css = readFileSync(dashEntityCardCssPath, 'utf8')
    expect(css).toContain('.dash-entity-card__content')
    expect(css).toContain('width: 100%')
    expect(css).toContain('padding-block: var(--ui-card-inset-block)')
    expect(css).toContain('.dash-entity-card__body')
  })

  it('registers dash-entity-surface semantic CSS completely', () => {
    const failures = validateSemanticControlCssCompleteness({
      filePath: dashEntitySurfaceCssPath,
      classPrefix: 'dash',
      dimensions: [
        {
          modifierPrefix: 'dash-entity-surface--compact',
          requiredProperties: [
            '--entity-surface-inset',
            '--entity-surface-utility-inset',
            '--entity-leading-content-gap',
          ],
        },
        {
          modifierPrefix: 'dash-entity-surface--comfortable',
          requiredProperties: [
            '--entity-surface-inset',
            '--entity-surface-utility-inset',
            '--entity-leading-content-gap',
          ],
        },
        {
          modifierPrefix: 'dash-entity-surface--leading-0',
          requiredProperties: ['--entity-content-offset'],
        },
        {
          modifierPrefix: 'dash-entity-surface--leading-1',
          requiredProperties: ['--entity-content-offset'],
        },
        {
          modifierPrefix: 'dash-entity-surface--leading-2',
          requiredProperties: ['--entity-content-offset'],
        },
      ],
    })
    expect(failures).toEqual([])
  })
})

describe('edge-aware surface inset', () => {
  it('tightens the header end inset for utility and chevron trailing', () => {
    expect(
      resolveEntitySurfaceEdges({ leadingUtilityCount: 0, trailing: utilityTrailing }),
    ).toEqual({ start: 'default', end: 'utility' })
    expect(
      resolveEntitySurfaceEdges({
        leadingUtilityCount: 1,
        trailing: { kind: 'indicator', variant: 'chevron' },
      }),
    ).toEqual({ start: 'utility', end: 'utility' })

    const edges = resolveEntitySurfaceEdges({ leadingUtilityCount: 0, trailing: utilityTrailing })
    expect(
      entityCardFrameClassName({ density: 'compact', edges, leadingUtilityCount: 0 }),
    ).toContain('dash-entity-surface--end-utility')
  })

  it('keeps the default end inset for action, group, and quantity trailing', () => {
    for (const trailing of [
      actionTrailing,
      groupTrailing,
      { kind: 'indicator', variant: 'quantity', quantity: 2 } as const,
      undefined,
    ]) {
      const edges = resolveEntitySurfaceEdges({ leadingUtilityCount: 0, trailing })
      expect(edges.end).toBe('default')
      expect(
        entityCardFrameClassName({ density: 'compact', edges, leadingUtilityCount: 0 }),
      ).toContain('dash-entity-surface--end-default')
    }
  })

  it('keeps body wash on dash-entity-card__body', () => {
    for (const wash of ['disclosure', 'catalog'] as const) {
      const className = entityCardBodyClassName(wash)
      expect(className).toContain('dash-entity-card__body')
      expect(className).not.toContain('pr-[var(--entity-body-inline-end)]')
    }
  })
})
