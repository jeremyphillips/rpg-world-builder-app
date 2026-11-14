import { describe, expect, it } from 'vitest'

import {
  resolveSelectOptionTrailingColumn,
  selectOptionTrailingClassName,
} from './select-option-row-content.lib'

describe('selectOptionRowContent.lib', () => {
  it('prefers disabledReason over trailing metadata', () => {
    expect(
      resolveSelectOptionTrailingColumn({
        disabled: true,
        disabledReason: 'Already used',
        trailing: { text: 'DC 15', variant: 'strong' },
      }),
    ).toEqual({ text: 'Already used', variant: 'disabled-reason' })
  })

  it('defaults quiet trailing variant', () => {
    expect(
      resolveSelectOptionTrailingColumn({
        trailing: { text: '4 spells' },
      }),
    ).toEqual({ text: '4 spells', variant: 'quiet' })
  })

  it('maps strong variant to trailing class modifier', () => {
    expect(selectOptionTrailingClassName('strong')).toContain('ui-select-option-trailing--strong')
  })
})
