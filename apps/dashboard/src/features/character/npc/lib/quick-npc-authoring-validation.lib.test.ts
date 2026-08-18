import { describe, expect, it } from 'vitest'

import { ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE } from '../../components/connections/organization-membership-title-field.types'
import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../lib/character-builder-fixtures'
import { isQuickNpcSetupStillValid } from './quick-npc-authoring-validation.lib'

const baseSetup = {
  membershipTitle: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
} as const

describe('isQuickNpcSetupStillValid', () => {
  const context = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })

  it('rejects setup when membership title is unset', () => {
    expect(
      isQuickNpcSetupStillValid(
        {
          speciesId: 'srd-cc-5.2.1:dwarf',
          membershipTitle: undefined,
          classId: 'srd-cc-5.2.1:fighter',
          level: 1,
        },
        context,
      ),
    ).toBe(false)
  })

  it('rejects setup when membership title is an empty string', () => {
    expect(
      isQuickNpcSetupStillValid(
        {
          speciesId: 'srd-cc-5.2.1:dwarf',
          membershipTitle: '',
          classId: 'srd-cc-5.2.1:fighter',
          level: 1,
        },
        context,
      ),
    ).toBe(false)
  })

  it('accepts a setup that still matches campaign availability', () => {
    expect(
      isQuickNpcSetupStillValid(
        {
          ...baseSetup,
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
          ...baseSetup,
          speciesId: 'srd-cc-5.2.1:not-a-species',
          classId: 'srd-cc-5.2.1:fighter',
          level: 1,
        },
        context,
      ),
    ).toBe(false)
  })

  it('rejects setup when the class is no longer campaign-available', () => {
    expect(
      isQuickNpcSetupStillValid(
        {
          ...baseSetup,
          speciesId: 'srd-cc-5.2.1:dwarf',
          classId: 'srd-cc-5.2.1:not-a-class',
          level: 1,
        },
        context,
      ),
    ).toBe(false)
  })

  it('accepts level 0 setup without a class', () => {
    expect(
      isQuickNpcSetupStillValid(
        {
          ...baseSetup,
          speciesId: 'srd-cc-5.2.1:dwarf',
          classId: '',
          level: 0,
        },
        context,
      ),
    ).toBe(true)
  })
})
