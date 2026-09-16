import { describe, expect, it } from 'vitest'

import type { FieldWidth } from './field-control.variants'
import { resolveFieldRowColumnTracks } from './field-row-column-tracks.lib'
import { resolveFieldRowAnatomyPresentation } from './field-row-anatomy.variants'

describe('resolveFieldRowAnatomyPresentation', () => {
  it('emits anatomy-grid classes and column custom properties from width tokens', () => {
    const widths: FieldWidth[] = ['full', '1/3']
    const { gridTemplateColumns } = resolveFieldRowColumnTracks(widths)
    const presentation = resolveFieldRowAnatomyPresentation(widths, 'form')

    expect(presentation.className).toContain('field-row-anatomy-grid')
    expect(presentation.className).toContain('gap-x-6')
    expect(presentation.style).toMatchObject({
      '--row-cols': gridTemplateColumns,
    })
    expect(
      String(presentation.style['--row-collapse-min' as keyof typeof presentation.style]),
    ).toMatch(/^\d+px$/)
  })

  it('uses compact horizontal gap when requested', () => {
    const presentation = resolveFieldRowAnatomyPresentation(['1/2', '1/2'], 'compact')

    expect(presentation.className).toContain('gap-x-4')
    expect(presentation.className).not.toContain('gap-x-6')
  })
})
