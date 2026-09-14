import { describe, expect, it } from 'vitest'

import type { ArrayItemShellRenderProps } from '../../config/array/array-item-shell-render.types'
import { resolveArrayFieldRendererChrome } from './resolve-array-field-renderer-chrome.lib'

const nestedGrantArray = {
  kind: 'array' as const,
  name: 'grants',
  legend: 'Grants',
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
      density: 'comfortable',
      depth: 2,
      inRhythmStack: undefined,
      namedGroupDepth: 1,
      fieldsLength: 2,
    })

    expect(chrome.variant).toBe('detailed')
    expect(chrome.collapsible).toBe(true)
  })

  it('does not enable collapse for compact nested arrays without renderShell', () => {
    const chrome = resolveArrayFieldRendererChrome({
      config: {
        kind: 'array',
        name: 'tags',
        legend: 'Tags',
        fields: [{ type: 'text', name: 'label', label: 'Label' }],
      },
      density: 'comfortable',
      depth: 2,
      inRhythmStack: undefined,
      namedGroupDepth: 1,
      fieldsLength: 1,
    })

    expect(chrome.variant).toBe('compact')
    expect(chrome.collapsible).toBe(false)
  })
})
