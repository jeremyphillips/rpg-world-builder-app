import { describe, expect, it } from 'vitest'
import {
  resolveMediaManagerBodyDropOverlay,
  resolveMediaManagerFooterHint,
  shouldShowMediaManagerStatus,
} from './media-manager-session.lib'

describe('media-manager-session.lib', () => {
  it('resolves body drop overlay preview and drag state', () => {
    expect(resolveMediaManagerBodyDropOverlay('invalid', { active: false, invalid: false })).toBe(
      'invalid',
    )
    expect(resolveMediaManagerBodyDropOverlay(undefined, { active: true, invalid: true })).toBe(
      'invalid',
    )
    expect(resolveMediaManagerBodyDropOverlay(undefined, { active: true, invalid: false })).toBe(
      'active',
    )
    expect(resolveMediaManagerBodyDropOverlay(undefined, { active: false, invalid: false })).toBe(
      undefined,
    )
  })

  it('shows status only when there is feedback to surface', () => {
    expect(
      shouldShowMediaManagerStatus({
        hasActiveUploads: false,
        hasFailedUploads: false,
        validationOk: true,
      }),
    ).toBe(false)
    expect(
      shouldShowMediaManagerStatus({
        statusNotice: { kind: 'text', text: 'Upload complete.' },
        hasActiveUploads: false,
        hasFailedUploads: false,
        validationOk: true,
      }),
    ).toBe(true)
  })

  it('resolves footer hint copy by mode', () => {
    expect(resolveMediaManagerFooterHint('form', 'character')).toBe(
      'Changes are saved with this character.',
    )
    expect(resolveMediaManagerFooterHint('form', 'class')).toBe(
      'Changes are saved with this class.',
    )
    expect(resolveMediaManagerFooterHint('detail', 'class')).toBe('Save changes to this record.')
  })
})
