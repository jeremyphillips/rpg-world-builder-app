import { describe, expect, it } from 'vitest'

import {
  optionalDisclosureLeafActions,
  resolveOptionalDisclosureActions,
  resolveOptionalDisclosureSubject,
} from './optional-disclosure-actions.lib'

describe('resolveOptionalDisclosureActions', () => {
  it('keeps the subject casing in action-only add defaults', () => {
    expect(resolveOptionalDisclosureActions({ intent: 'add', subject: 'notes' })).toMatchObject({
      collapsedLabel: 'Add notes',
      collapsedAccessibleName: 'Add notes',
      openLabel: 'Remove notes',
      openAccessibleName: 'Remove notes',
      collapsedAction: 'add',
      openAction: 'clear',
    })
  })

  it('generates override pairs for action-only fields', () => {
    expect(
      resolveOptionalDisclosureActions({ intent: 'override', subject: 'cast level' }),
    ).toMatchObject({
      collapsedLabel: 'Override cast level',
      openLabel: 'Clear cast level override',
    })
  })

  it('uses a compact visible verb when the label is already shown', () => {
    expect(
      resolveOptionalDisclosureActions({
        intent: 'override',
        subject: 'Damage',
        labeled: true,
      }),
    ).toMatchObject({
      collapsedLabel: 'Override',
      collapsedAccessibleName: 'Override Damage',
      openLabel: 'Clear override',
      openAccessibleName: 'Clear Damage override',
      collapsedAction: 'edit',
      openAction: 'clear',
    })
  })

  it('prefers explicit labels over generated copy', () => {
    expect(
      resolveOptionalDisclosureActions({
        intent: 'add',
        subject: 'details',
        addLabel: 'Replace condition',
        removeLabel: 'Clear condition replacement',
      }),
    ).toMatchObject({
      collapsedLabel: 'Replace condition',
      openLabel: 'Clear condition replacement',
    })
  })

  it('uses custom remove labels on labeled overrides without shortening accessible collapse', () => {
    expect(
      resolveOptionalDisclosureActions({
        intent: 'override',
        subject: 'Movement',
        labeled: true,
        removeLabel: 'Use base movement',
      }),
    ).toMatchObject({
      collapsedLabel: 'Override',
      collapsedAccessibleName: 'Override Movement',
      openLabel: 'Use base movement',
      openAccessibleName: 'Use base movement',
    })
  })

  it('supports semantic omit/restore custom pairs', () => {
    expect(
      resolveOptionalDisclosureActions({
        intent: 'add',
        subject: 'components',
        addLabel: 'Omit components',
        removeLabel: 'Restore components',
      }),
    ).toMatchObject({
      collapsedLabel: 'Omit components',
      openLabel: 'Restore components',
    })
  })
})

describe('resolveOptionalDisclosureSubject', () => {
  it('falls back to the display label', () => {
    expect(resolveOptionalDisclosureSubject('Additional details', {})).toBe('Additional details')
  })

  it('prefers actionSubject when set', () => {
    expect(
      resolveOptionalDisclosureSubject('Additional details', { actionSubject: 'details' }),
    ).toBe('details')
  })
})

describe('optionalDisclosureLeafActions', () => {
  it('resolves actionSubject instead of the field label', () => {
    expect(
      optionalDisclosureLeafActions({
        label: 'Attack',
        optionalDisclosure: { intent: 'add', actionSubject: 'follow-up attack' },
      }),
    ).toMatchObject({
      collapsedLabel: 'Add follow-up attack',
      openLabel: 'Remove follow-up attack',
    })
  })

  it('uses the field label when actionSubject is absent', () => {
    expect(
      optionalDisclosureLeafActions({
        label: 'Long range',
        optionalDisclosure: { intent: 'add' },
      }),
    ).toMatchObject({
      collapsedLabel: 'Add Long range',
      openLabel: 'Remove Long range',
    })
  })
})
