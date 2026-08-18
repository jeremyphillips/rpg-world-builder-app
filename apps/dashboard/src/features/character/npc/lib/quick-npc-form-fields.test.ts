import { describe, expect, it } from 'vitest'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../lib/character-builder-fixtures'
import { ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE } from '../../components/connections/organization-membership-title-field.types'
import {
  buildQuickNpcContentOptions,
  buildQuickNpcDetailsFields,
  buildQuickNpcSeed,
  buildQuickNpcConstraints,
  buildQuickNpcTabs,
  countQuickNpcConfiguredRequirements,
  createQuickNpcSetupDefaultValues,
  isQuickNpcMembershipTitleSetupComplete,
  mergeQuickNpcAuthoringValues,
  quickNpcAuthoringSchema,
  quickNpcAuthoringTabDefaultValues,
  QUICK_NPC_DETAILS_TAB_ID,
} from './quick-npc-form-fields'

const validValues = {
  name: 'Guard Captain',
  speciesId: 'srd-cc-5.2.1:dwarf',
  classId: 'srd-cc-5.2.1:fighter',
  level: 3,
  alignment: 'ln',
  membershipTitle: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
  requiredWeaponIds: [],
  requiredSpellIds: [],
}

describe('isQuickNpcMembershipTitleSetupComplete', () => {
  it('treats unset and empty string as incomplete', () => {
    expect(isQuickNpcMembershipTitleSetupComplete(undefined)).toBe(false)
    expect(isQuickNpcMembershipTitleSetupComplete('')).toBe(false)
    expect(isQuickNpcMembershipTitleSetupComplete('   ')).toBe(false)
  })

  it('treats explicit No title and organization titles as complete', () => {
    expect(isQuickNpcMembershipTitleSetupComplete(ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE)).toBe(
      true,
    )
    expect(isQuickNpcMembershipTitleSetupComplete('Guildmaster')).toBe(true)
  })
})

describe('createQuickNpcSetupDefaultValues', () => {
  it('starts with setup-only unset membership title until the user chooses', () => {
    const context = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })

    expect(createQuickNpcSetupDefaultValues(context)).toMatchObject({
      speciesId: '',
      membershipTitle: undefined,
      classId: '',
      level: 0,
    })
  })
})

describe('quickNpcAuthoringSchema', () => {
  it('accepts a complete quick NPC form payload', () => {
    expect(quickNpcAuthoringSchema(20, 0).parse(validValues)).toMatchObject({
      name: 'Guard Captain',
      level: 3,
      alignment: 'ln',
    })
  })

  it('rejects setup with an empty membership title', () => {
    const result = quickNpcAuthoringSchema(20, 0).safeParse({
      ...validValues,
      membershipTitle: '',
    })

    expect(result.success).toBe(false)
  })

  it('rejects missing required seed fields with builder messages', () => {
    const result = quickNpcAuthoringSchema(20, 0).safeParse({
      ...validValues,
      name: ' ',
      speciesId: '',
      classId: '',
      alignment: '',
    })

    expect(result.success).toBe(false)
    const messages = result.success ? [] : result.error.issues.map((issue) => issue.message)
    expect(messages).toEqual(
      expect.arrayContaining([
        'Enter a character name.',
        expect.stringMatching(/^Choose a /),
        'Choose an alignment.',
      ]),
    )
  })

  it('rejects a level above the campaign maximum', () => {
    const result = quickNpcAuthoringSchema(20, 0).safeParse({ ...validValues, level: 21 })

    expect(result.success).toBe(false)
    const messages = result.success ? [] : result.error.issues.map((issue) => issue.message)
    expect(messages).toContain('Character level cannot exceed 20.')
  })
})

describe('buildQuickNpcSeed', () => {
  it('maps form values to the automatic build seed without the membership title', () => {
    const seed = buildQuickNpcSeed(quickNpcAuthoringSchema(20, 0).parse(validValues))

    expect(seed).toEqual({
      name: 'Guard Captain',
      speciesId: 'srd-cc-5.2.1:dwarf',
      classId: 'srd-cc-5.2.1:fighter',
      level: 3,
      alignment: 'ln',
    })
  })

  it('omits classId for level 0 NPCs', () => {
    const seed = buildQuickNpcSeed(
      quickNpcAuthoringSchema(20, 0).parse({
        ...validValues,
        classId: '',
        level: 0,
      }),
    )

    expect(seed).toEqual({
      name: 'Guard Captain',
      speciesId: 'srd-cc-5.2.1:dwarf',
      level: 0,
      alignment: 'ln',
    })
  })
})

describe('buildQuickNpcContentOptions', () => {
  it('maps campaign-available species and classes to labeled options', () => {
    const context = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })

    expect(buildQuickNpcContentOptions(context)).toEqual({
      speciesOptions: [{ value: 'srd-cc-5.2.1:dwarf', label: 'Dwarf' }],
      classOptions: [{ value: 'srd-cc-5.2.1:fighter', label: 'Fighter' }],
    })
  })

  it('sorts options by label regardless of catalog insertion order', () => {
    const [species] = populatedBuilderCatalog.species
    const context = createCampaignNpcBuilderContextFixture({
      catalog: {
        ...populatedBuilderCatalog,
        species: [
          { ...species!, id: 'srd-cc-5.2.1:zebrafolk', slug: 'zebrafolk', name: 'Zebrafolk' },
          { ...species!, id: 'srd-cc-5.2.1:aarakocra', slug: 'aarakocra', name: 'Aarakocra' },
        ],
      },
    })

    expect(
      buildQuickNpcContentOptions(context).speciesOptions.map((option) => option.label),
    ).toEqual(['Aarakocra', 'Zebrafolk'])
  })
})

describe('buildQuickNpcDetailsFields', () => {
  it('includes name and alignment only', () => {
    const fields = buildQuickNpcDetailsFields()

    expect(fields.map((field) => ('name' in field ? field.name : null))).toEqual([
      'name',
      'alignment',
    ])
  })

  it('has defaults for authoring tab schema keys', () => {
    expect(quickNpcAuthoringTabDefaultValues).toEqual({
      name: '',
      alignment: 'n',
      requiredWeaponIds: [],
      requiredSpellIds: [],
    })
  })
})

describe('buildQuickNpcTabs validation wiring', () => {
  it('declares explicit ownership for the name field with trailing action', () => {
    const tabs = buildQuickNpcTabs({
      detailsFields: buildQuickNpcDetailsFields({
        nameTrailingAction: {
          label: 'Generate',
          onAction: () => {},
        },
      }),
      requirementsFields: [
        {
          type: 'select',
          name: 'requiredWeaponIds',
          label: 'Starting weapon',
          options: [],
          width: 'full',
        },
      ],
      configuredCount: 0,
    })

    const detailsTab = tabs.find((tab) => tab.id === QUICK_NPC_DETAILS_TAB_ID)
    expect(detailsTab?.errorPaths).toEqual(['name'])
    expect(detailsTab?.resolverFields).toEqual([
      { type: 'text', name: 'name', label: 'Name', required: true },
    ])
  })

  it('merges setup and tab values for create/finalize', () => {
    expect(
      mergeQuickNpcAuthoringValues(
        {
          speciesId: 'species-1',
          membershipTitle: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
          classId: 'class-1',
          level: 2,
        },
        {
          name: 'Guard Captain',
          alignment: 'ln',
          requiredWeaponIds: [],
          requiredSpellIds: [],
        },
      ),
    ).toMatchObject({
      speciesId: 'species-1',
      membershipTitle: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
      classId: 'class-1',
      level: 2,
      name: 'Guard Captain',
    })
  })
})

describe('buildQuickNpcConstraints', () => {
  it('omits empty requirement fields', () => {
    expect(
      buildQuickNpcConstraints({ requiredWeaponIds: [], requiredSpellIds: [] }),
    ).toBeUndefined()
  })

  it('maps configured requirement id arrays', () => {
    expect(
      buildQuickNpcConstraints({
        requiredWeaponIds: ['srd-cc-5.2.1:longsword'],
        requiredSpellIds: [],
      }),
    ).toEqual({ requiredWeaponIds: ['srd-cc-5.2.1:longsword'], requiredSpellIds: [] })
  })
})

describe('countQuickNpcConfiguredRequirements', () => {
  it('counts weapons and spells in configured arrays', () => {
    expect(
      countQuickNpcConfiguredRequirements({
        requiredWeaponIds: ['weapon-1'],
        requiredSpellIds: ['spell-1'],
      }),
    ).toBe(2)
  })
})
