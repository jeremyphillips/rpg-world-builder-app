import { describe, expect, it } from 'vitest'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../lib/fixtures/character-builder-fixtures'
import {
  quickNpcMemberSetupValues,
  quickNpcMemberSetupWithNoTitle,
  quickNpcStandaloneSetupValues,
} from './quick-npc-test-fixtures'
import { isQuickNpcSetupStillValid } from './quick-npc-authoring-validation.lib'

describe('isQuickNpcSetupStillValid', () => {
  const context = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })

  it('rejects organization-member setup when membership title is unset', () => {
    expect(
      isQuickNpcSetupStillValid(
        quickNpcMemberSetupValues({
          speciesId: 'srd-cc-5.2.1:dwarf',
          membershipTitle: undefined,
          classId: 'srd-cc-5.2.1:fighter',
          level: 1,
        }),
        context,
      ),
    ).toBe(false)
  })

  it('rejects organization-member setup when membership title is an empty string', () => {
    expect(
      isQuickNpcSetupStillValid(
        quickNpcMemberSetupValues({
          speciesId: 'srd-cc-5.2.1:dwarf',
          membershipTitle: '',
          classId: 'srd-cc-5.2.1:fighter',
          level: 1,
        }),
        context,
      ),
    ).toBe(false)
  })

  it('accepts organization-member setup that still matches campaign availability', () => {
    expect(
      isQuickNpcSetupStillValid(
        quickNpcMemberSetupWithNoTitle({
          speciesId: 'srd-cc-5.2.1:dwarf',
          classId: 'srd-cc-5.2.1:fighter',
          level: 1,
        }),
        context,
      ),
    ).toBe(true)
  })

  it('rejects organization-member setup when the species is no longer campaign-available', () => {
    expect(
      isQuickNpcSetupStillValid(
        quickNpcMemberSetupWithNoTitle({
          speciesId: 'srd-cc-5.2.1:not-a-species',
          classId: 'srd-cc-5.2.1:fighter',
          level: 1,
        }),
        context,
      ),
    ).toBe(false)
  })

  it('rejects organization-member setup when the class is no longer campaign-available', () => {
    expect(
      isQuickNpcSetupStillValid(
        quickNpcMemberSetupWithNoTitle({
          speciesId: 'srd-cc-5.2.1:dwarf',
          classId: 'srd-cc-5.2.1:not-a-class',
          level: 1,
        }),
        context,
      ),
    ).toBe(false)
  })

  it('accepts organization-member level 0 setup without a class', () => {
    expect(
      isQuickNpcSetupStillValid(
        quickNpcMemberSetupWithNoTitle({
          speciesId: 'srd-cc-5.2.1:dwarf',
          classId: '',
          level: 0,
        }),
        context,
      ),
    ).toBe(true)
  })

  it('accepts standalone setup without a membership title field', () => {
    expect(
      isQuickNpcSetupStillValid(
        quickNpcStandaloneSetupValues({
          speciesId: 'srd-cc-5.2.1:dwarf',
          classId: 'srd-cc-5.2.1:fighter',
          level: 1,
        }),
        context,
      ),
    ).toBe(true)
  })

  it('rejects standalone setup when the species is no longer campaign-available', () => {
    expect(
      isQuickNpcSetupStillValid(
        quickNpcStandaloneSetupValues({
          speciesId: 'srd-cc-5.2.1:not-a-species',
          classId: 'srd-cc-5.2.1:fighter',
          level: 1,
        }),
        context,
      ),
    ).toBe(false)
  })

  it('accepts standalone level 0 setup without a class', () => {
    expect(
      isQuickNpcSetupStillValid(
        quickNpcStandaloneSetupValues({
          speciesId: 'srd-cc-5.2.1:dwarf',
          classId: '',
          level: 0,
        }),
        context,
      ),
    ).toBe(true)
  })
})
