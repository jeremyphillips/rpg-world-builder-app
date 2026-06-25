import { describe, expect, it } from 'vitest'

import {
  buildExternalLinkPickerValue,
  buildInternalLinkPickerValue,
  findInitialInternalOption,
  isLinkPickerInsertDisabled,
  resolveLinkPickerFormState,
} from './rich-text-link-picker.lib'
import type { RichTextLinkPickerInternalOption } from './rich-text-link-picker.types'

const internalOptions: RichTextLinkPickerInternalOption[] = [
  {
    id: 'spell-overview',
    title: 'Spell Overview',
    href: '/campaigns/demo/content/spells',
    contentType: 'spell',
    kind: 'overview',
  },
  {
    id: 'fireball',
    title: 'Fireball',
    href: '/campaigns/demo/content/spells/fireball',
    contentType: 'spell',
    kind: 'detail',
    sourceLabel: 'Homebrew',
  },
]

describe('resolveLinkPickerFormState', () => {
  it('prefills internal edit state from metadata', () => {
    expect(
      resolveLinkPickerFormState(
        {
          mode: 'internal',
          href: '/campaigns/demo/content/spells/fireball',
          displayText: 'Fireball spell',
          openInNewWindow: true,
          metadata: {
            contentType: 'spell',
            contentId: 'fireball',
            contentTitle: 'Fireball',
            linkKind: 'detail',
          },
        },
        internalOptions,
        'spell',
      ),
    ).toEqual({
      tab: 'internal',
      searchQuery: '',
      contentType: 'spell',
      selectedOptionId: 'fireball',
      internalDisplayText: 'Fireball spell',
      internalOpenInNewWindow: true,
      externalHref: '',
      externalDisplayText: '',
      externalOpenInNewWindow: true,
    })
  })

  it('prefills external edit state', () => {
    expect(
      resolveLinkPickerFormState(
        {
          mode: 'external',
          href: 'https://example.com',
          displayText: 'Rules',
          openInNewWindow: false,
        },
        internalOptions,
        'spell',
      ),
    ).toMatchObject({
      tab: 'external',
      externalHref: 'https://example.com',
      externalDisplayText: 'Rules',
      externalOpenInNewWindow: false,
    })
  })
})

describe('findInitialInternalOption', () => {
  it('matches by content id first', () => {
    expect(
      findInitialInternalOption(
        { metadata: { contentId: 'fireball', contentType: 'spell' } },
        internalOptions,
        'spell',
      )?.id,
    ).toBe('fireball')
  })
})

const fireballOption = internalOptions[1]!

describe('buildInternalLinkPickerValue', () => {
  it('returns canonical metadata payload', () => {
    expect(buildInternalLinkPickerValue(fireballOption, ' Fireball ', true)).toEqual({
      mode: 'internal',
      href: '/campaigns/demo/content/spells/fireball',
      displayText: 'Fireball',
      openInNewWindow: true,
      metadata: {
        contentType: 'spell',
        contentId: 'fireball',
        contentTitle: 'Fireball',
        linkKind: 'detail',
      },
    })
  })
})

describe('buildExternalLinkPickerValue', () => {
  it('marks external links and trims values', () => {
    expect(buildExternalLinkPickerValue(' https://example.com ', ' Rules ', false)).toEqual({
      mode: 'external',
      href: 'https://example.com',
      displayText: 'Rules',
      openInNewWindow: false,
      metadata: { linkKind: 'external' },
    })
  })
})

describe('isLinkPickerInsertDisabled', () => {
  it('requires internal selection and display text', () => {
    expect(isLinkPickerInsertDisabled('internal', null, '', '', '')).toBe(true)
    expect(isLinkPickerInsertDisabled('internal', fireballOption, 'Fireball', '', '')).toBe(false)
  })

  it('requires external href and display text', () => {
    expect(isLinkPickerInsertDisabled('external', null, '', '', '')).toBe(true)
    expect(isLinkPickerInsertDisabled('external', null, '', 'https://example.com', 'Rules')).toBe(
      false,
    )
  })
})
