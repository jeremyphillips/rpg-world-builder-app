import { describe, expect, it } from 'vitest'

import {
  resolveCharacterRosterStatusPresentation,
  resolveCharacterVitalStatusPresentation,
} from './character-lifecycle-presentation'

describe('character lifecycle presentation', () => {
  it('maps roster statuses to quiet badges', () => {
    expect(resolveCharacterRosterStatusPresentation('active')).toMatchObject({
      label: 'Active',
      appearance: 'neutral',
    })
    expect(resolveCharacterRosterStatusPresentation('inactive')).toMatchObject({
      appearance: 'outline',
    })
    expect(resolveCharacterRosterStatusPresentation('retired')).toMatchObject({
      appearance: 'soft',
    })
  })

  it('maps vital statuses to quiet badges', () => {
    expect(resolveCharacterVitalStatusPresentation('alive')).toMatchObject({
      label: 'Alive',
      appearance: 'neutral',
    })
    expect(resolveCharacterVitalStatusPresentation('deceased')).toMatchObject({
      tone: 'destructive',
    })
  })
})
