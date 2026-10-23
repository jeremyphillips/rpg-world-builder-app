import { describe, expect, it } from 'vitest'

import { resetPrimaryCrop } from '@rpg/contracts'

import { isStalePrimaryCrop, resolveWorkspaceEditorCrop } from './media-workspace-editor.lib'

describe('media-workspace-editor.lib', () => {
  const source = { width: 1600, height: 900 }

  it('detects legacy full-frame primary crops', () => {
    expect(
      isStalePrimaryCrop('primary', source, {
        mode: 'crop',
        crop: { x: 0, y: 0, width: 1, height: 1 },
      }),
    ).toBe(true)
  })

  it('resets stale primary crops to centered 4:3', () => {
    const crop = resolveWorkspaceEditorCrop({
      role: 'primary',
      source,
      cropPresentation: {
        mode: 'crop',
        crop: { x: 0, y: 0, width: 1, height: 1 },
      },
      stalePrimaryCrop: true,
    })

    expect(crop).toEqual(resetPrimaryCrop(source))
  })
})
