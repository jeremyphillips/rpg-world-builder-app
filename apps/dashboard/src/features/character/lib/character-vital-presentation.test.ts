import { describe, expect, it } from 'vitest'

import { resolveCharacterVitalStatusPresentation } from './character-vital-presentation'

describe('character vital presentation', () => {
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
