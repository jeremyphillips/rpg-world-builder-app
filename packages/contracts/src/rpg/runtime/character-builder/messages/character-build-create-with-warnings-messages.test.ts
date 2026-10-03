import { describe, expect, it } from 'vitest'

import { getCharacterBuildCreateWithWarningsMessages } from './character-build-create-with-warnings-messages'

describe('getCharacterBuildCreateWithWarningsMessages', () => {
  it('labels the confirm action by character kind', () => {
    expect(getCharacterBuildCreateWithWarningsMessages('pc').confirmLabel).toBe(
      'Create character anyway',
    )
    expect(getCharacterBuildCreateWithWarningsMessages('npc').confirmLabel).toBe(
      'Create NPC anyway',
    )
  })
})
