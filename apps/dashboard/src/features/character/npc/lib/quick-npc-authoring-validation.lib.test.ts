import { describe, expect, it } from 'vitest'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../lib/character-builder-fixtures'
import { isQuickNpcSetupStillValid } from './quick-npc-authoring-validation.lib'

describe('isQuickNpcSetupStillValid', () => {
  const context = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })

  it('accepts a setup that still matches campaign availability', () => {
    expect(
      isQuickNpcSetupStillValid(
        {
          speciesId: 'srd-cc-5.2.1:dwarf',
          classId: 'srd-cc-5.2.1:fighter',
          level: 1,
        },
        context,
      ),
    ).toBe(true)
  })

  it('rejects setup when the species is no longer campaign-available', () => {
    expect(
      isQuickNpcSetupStillValid(
        {
          speciesId: 'srd-cc-5.2.1:not-a-species',
          classId: 'srd-cc-5.2.1:fighter',
          level: 1,
        },
        context,
      ),
    ).toBe(false)
  })
})
