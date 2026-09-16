import { describe, expect, it } from 'vitest'

import {
  resolvePrototypeMovementFixEnabled,
  resolveSpacingPrototypeShellPaddingClasses,
  buildPrototypeFlatGridTemplateColumns,
  buildPrototypeTwoTierParentTemplateColumns,
  isTwoTierSpacingCandidate,
  prototypeDigitInlineSizeClasses,
  resolveChromePresenceFlags,
  resolvePrototypeFieldGapClass,
  resolvePrototypeArrayFieldColumnTracks,
  resolvePrototypeOuterGapClass,
  resolvePrototypeSpacingPresentation,
  resolveSpacingPrototypeGripChromeClasses,
  JOINED_PAIR_LEGACY_DIVIDER_CLASSES,
  JOINED_PAIR_LEGACY_INTRINSIC_SHELL_CLASSES,
} from './array-item-anatomy-grid-spacing-prototype.lib'

describe('array-item-anatomy-grid-spacing-prototype.lib', () => {
  it('maps chrome presence to grip/actions flags', () => {
    expect(resolveChromePresenceFlags('fields-only')).toEqual({
      showGrip: false,
      showActions: false,
    })
    expect(resolveChromePresenceFlags('grip-fields-actions')).toEqual({
      showGrip: true,
      showActions: true,
    })
  })

  it('uses asymmetric outer and field gaps for two-tier candidates', () => {
    expect(resolvePrototypeOuterGapClass('two-tier-dense')).toBe('gap-x-2')
    expect(resolvePrototypeFieldGapClass('two-tier-dense')).toBe('gap-x-3')
    expect(resolvePrototypeFieldGapClass('two-tier-default')).toBe('gap-x-4')
    expect(isTwoTierSpacingCandidate('two-tier-dense')).toBe(true)
    expect(isTwoTierSpacingCandidate('legacy-flat-form')).toBe(false)
  })

  it('keeps full tracks shrinkable and uses intrinsic auto only when requested', () => {
    const shrinkable = resolvePrototypeArrayFieldColumnTracks(['md', 'auto'])
    expect(shrinkable[0]).toBe('9rem')
    expect(shrinkable[1]).toBe('minmax(0, 1fr)')

    const intrinsic = resolvePrototypeArrayFieldColumnTracks(['md', 'auto'], {
      intrinsicAuto: true,
    })
    expect(intrinsic[1]).toBe('minmax(min-content, max-content)')
  })

  it('omits actions column from flat template when actions slot absent', () => {
    expect(
      buildPrototypeFlatGridTemplateColumns(['md', 'auto'], {
        showGrip: true,
        showActions: false,
      }),
    ).not.toContain('max-content')
    expect(
      buildPrototypeFlatGridTemplateColumns(['md', 'auto'], {
        showGrip: true,
        showActions: true,
      }),
    ).toContain('max-content')
  })

  it('builds two-tier parent template from chrome presence', () => {
    expect(
      buildPrototypeTwoTierParentTemplateColumns({ showGrip: true, showActions: true }),
    ).toContain('max-content')
    expect(
      buildPrototypeTwoTierParentTemplateColumns({ showGrip: false, showActions: false }),
    ).toBe('minmax(0, 1fr)')
  })

  it('emits matching width and min-width from one digit formula', () => {
    const classes = prototypeDigitInlineSizeClasses(3, 'md')
    expect(classes).toContain('w-[calc(3*1ch+2.75rem)]')
    expect(classes).toContain('min-w-[calc(3*1ch+2.75rem)]')
  })

  it('uses chrome-aware pl/pr shell inset on both inline edges', () => {
    expect(resolveSpacingPrototypeShellPaddingClasses({ showGrip: true, showActions: true })).toBe(
      'pl-2 pr-2 py-2',
    )
    expect(resolveSpacingPrototypeShellPaddingClasses({ showGrip: true, showActions: false })).toBe(
      'pl-2 pr-3 py-2',
    )
    expect(resolveSpacingPrototypeShellPaddingClasses({ showGrip: false, showActions: true })).toBe(
      'pl-3 pr-2 py-2',
    )
    expect(
      resolveSpacingPrototypeShellPaddingClasses({ showGrip: false, showActions: false }),
    ).toBe('pl-3 pr-3 py-2')
    expect(resolveSpacingPrototypeGripChromeClasses(true)).toBe('')
    expect(resolveSpacingPrototypeGripChromeClasses(true, true)).toBe('-ml-1')
  })

  it('enables movement fix by default on two-tier candidates only', () => {
    expect(resolvePrototypeMovementFixEnabled('two-tier-dense')).toBe(true)
    expect(resolvePrototypeMovementFixEnabled('legacy-flat-form')).toBe(false)
    expect(resolvePrototypeMovementFixEnabled('legacy-flat-form', true)).toBe(true)
  })

  it('documents legacy joined-pair shell classes for Storybook divider crush comparison', () => {
    expect(JOINED_PAIR_LEGACY_INTRINSIC_SHELL_CLASSES).toBe('grid-cols-[auto_1px_auto]')
    expect(JOINED_PAIR_LEGACY_DIVIDER_CLASSES).toContain('w-px')
    expect(JOINED_PAIR_LEGACY_DIVIDER_CLASSES).not.toContain('min-w-px')
  })

  it('marks fieldsCluster for two-tier presentation', () => {
    const presentation = resolvePrototypeSpacingPresentation(['md', 'auto'], {
      candidate: 'two-tier-dense',
      showGrip: true,
      showActions: true,
    })

    expect(presentation.usesFieldsCluster).toBe(true)
    expect(presentation.className).toContain('gap-x-2')
    expect(presentation.fieldGapClass).toBe('gap-x-3')
  })
})
