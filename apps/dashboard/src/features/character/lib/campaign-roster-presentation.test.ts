import { describe, expect, it } from 'vitest'

import { resolveCharacterRosterStatusPresentation } from './campaign-roster-presentation'

describe('campaign roster presentation', () => {
  it('maps roster statuses to quiet badges', () => {
    expect(resolveCharacterRosterStatusPresentation('active')).toMatchObject({
      label: 'Active',
      appearance: 'soft',
    })
    expect(resolveCharacterRosterStatusPresentation('inactive')).toMatchObject({
      appearance: 'outline',
    })
    expect(resolveCharacterRosterStatusPresentation('retired')).toMatchObject({
      appearance: 'soft',
    })
  })
})
