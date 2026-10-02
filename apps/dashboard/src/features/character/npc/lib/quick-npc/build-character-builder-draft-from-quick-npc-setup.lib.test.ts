import { describe, expect, it } from 'vitest'

import { buildCharacterBuilderDraftFromQuickNpcSetup } from './build-character-builder-draft-from-quick-npc-setup.lib'
import { quickNpcStandaloneSetupValues } from './quick-npc-test-fixtures'

describe('buildCharacterBuilderDraftFromQuickNpcSetup', () => {
  it('carries npcTemplateId on the builder draft for standalone handoff', () => {
    const draft = buildCharacterBuilderDraftFromQuickNpcSetup(
      quickNpcStandaloneSetupValues({
        npcTemplateId: 'guard',
        speciesId: 'srd-cc-5.2.1:dwarf',
        level: 0,
      }),
    )

    expect(draft.npcTemplateId).toBe('guard')
    expect(draft.species.speciesId).toBe('srd-cc-5.2.1:dwarf')
    expect(draft.class.level).toBe(0)
  })
})
