import { describe, expect, it } from 'vitest'

import type { ArrayItemShellRenderProps } from '../../config/array/array-item-shell-render.types'
import { resolveArrayFieldRendererChrome } from './resolve-array-field-renderer-chrome.lib'

const nestedGrantArray = {
  kind: 'array' as const,
  name: 'grants',
  heading: { label: 'Grants' },
  item: {
    collapsible: true,
    renderShell: (_props: ArrayItemShellRenderProps) => null,
  },
  fields: [
    { type: 'text' as const, name: 'spellTitle', label: 'Spell', required: true },
    { type: 'text' as const, name: 'spellAbility', label: 'Spellcasting ability' },
  ],
}

describe('resolveArrayFieldRendererChrome', () => {
  it('keeps collapse wiring for renderShell arrays inside nested sections', () => {
    const chrome = resolveArrayFieldRendererChrome({
      config: nestedGrantArray,
      parentDensity: 'comfortable',
      depth: 2,
      inRhythmStack: undefined,
      fieldsLength: 2,
    })

    expect(chrome.variant).toBe('detailed')
    expect(chrome.collapsible).toBe(true)
  })

  it('enables collapse for compact arrays when collapsible is true', () => {
    const chrome = resolveArrayFieldRendererChrome({
      config: {
        kind: 'array',
        name: 'examples',
        heading: { label: 'Examples' },
        item: { collapsible: true, variant: 'compact' },
        fields: [{ type: 'text', name: 'value', label: 'Value' }],
      },
      parentDensity: 'comfortable',
      depth: 0,
      inRhythmStack: undefined,
      fieldsLength: 1,
    })

    expect(chrome.collapsible).toBe(true)
  })

  it('uses parent density for legend when the array omits density', () => {
    const chrome = resolveArrayFieldRendererChrome({
      config: nestedGrantArray,
      parentDensity: 'comfortable',
      depth: 0,
      inRhythmStack: undefined,
      fieldsLength: 1,
    })

    expect(chrome.legendFieldSize).toBe('md')
    expect(chrome.legendRhythm).toBe('comfortable')
    expect(chrome.itemBodyStackClasses).toContain('gap-4')
  })

  it('uses explicit array density for legend and item bodies', () => {
    const chrome = resolveArrayFieldRendererChrome({
      config: { ...nestedGrantArray, density: 'compact' },
      parentDensity: 'comfortable',
      depth: 0,
      inRhythmStack: undefined,
      fieldsLength: 1,
    })

    expect(chrome.legendFieldSize).toBe('sm')
    expect(chrome.legendRhythm).toBe('compact')
  })

  it('does not enable collapse for compact nested arrays without renderShell', () => {
    const chrome = resolveArrayFieldRendererChrome({
      config: {
        kind: 'array',
        name: 'tags',
        heading: { label: 'Tags' },
        fields: [{ type: 'text', name: 'label', label: 'Label' }],
      },
      parentDensity: 'comfortable',
      depth: 2,
      inRhythmStack: undefined,
      fieldsLength: 1,
    })

    expect(chrome.variant).toBe('compact')
    expect(chrome.collapsible).toBe(false)
  })
})
