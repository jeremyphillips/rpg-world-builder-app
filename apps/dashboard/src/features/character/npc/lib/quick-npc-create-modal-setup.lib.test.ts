import { describe, expect, it } from 'vitest'

import { getNpcAuthoringTemplateLabel } from '@rpg/contracts'

import { ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE } from '../../components/connections/organization-membership-title-field.types'
import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../lib/character-builder-fixtures'
import {
  QUICK_NPC_CLASS_AFFINITY_GROUP_EYEBROW,
  QUICK_NPC_CLASS_ALL_GROUP_EYEBROW,
} from './quick-npc-class-option-groups.lib'
import { QUICK_NPC_SPECIES_ALL_GROUP_EYEBROW } from './quick-npc-species-option-groups.lib'
import { QUICK_NPC_AFFINITY_RECOMMENDED_EYEBROW } from './quick-npc-affinity-option-groups.lib'
import {
  buildQuickNpcCreateSetupSets,
  formatQuickNpcLevelRecommendationPrompt,
  formatQuickNpcSetupCharacterSummary,
  QUICK_NPC_CLASS_AFFINITY_PROMPT,
  QUICK_NPC_RECOMMENDED_BUILD_FIELD_LABEL,
  QUICK_NPC_TITLE_FIELD_PROMPT,
  resolveQuickNpcDefaultLevel,
  resolveQuickNpcSetupModel,
} from './quick-npc-create-modal-setup.lib'
import {
  createQuickNpcSetupDefaultValues,
  isQuickNpcMembershipTitleSetupComplete,
} from './quick-npc-form-fields'
import { resolveCreateSetupActiveSetId, resolveCreateSetupVisibleSetIds } from '@/lib/create-setup'

const guildmasterTitle = {
  id: 'omt_guildmaster',
  label: 'Guildmaster',
  description: 'Head of the guild.',
  priority: 50 as const,
  npcRecommendation: { templateId: 'covert_operator' as const, level: 5 },
} as const

describe('buildQuickNpcCreateSetupSets', () => {
  const context = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })
  const rogueClass = {
    ...populatedBuilderCatalog.classes[0]!,
    id: 'srd-cc-5.2.1:rogue',
    slug: 'rogue',
    name: 'Rogue',
  }
  const multiClassContext = createCampaignNpcBuilderContextFixture({
    catalog: {
      ...populatedBuilderCatalog,
      classes: [populatedBuilderCatalog.classes[0]!, rogueClass],
    },
  })
  const elfSpecies = {
    ...populatedBuilderCatalog.species[0]!,
    id: 'srd-cc-5.2.1:elf',
    slug: 'elf',
    name: 'Elf',
  }
  const multiSpeciesContext = createCampaignNpcBuilderContextFixture({
    catalog: {
      ...populatedBuilderCatalog,
      species: [populatedBuilderCatalog.species[0]!, elfSpecies],
    },
  })

  it('orders title first and omits downstream sets until title and species are chosen', () => {
    const values = createQuickNpcSetupDefaultValues(context)
    const sets = buildQuickNpcCreateSetupSets({
      context,
      values,
      onApplySetupChange: () => {},
      titles: [],
    })

    expect(sets.map((set) => set.id)).toEqual(['membershipTitle', 'speciesId', 'level'])
    expect(isQuickNpcMembershipTitleSetupComplete(values.membershipTitle)).toBe(false)

    const sequenceItems = sets.map((set) => ({
      id: set.id,
      isComplete: set.isComplete,
      required: set.required,
      visibleWhenComplete: set.visibleWhenComplete,
    }))
    const activeSetId = resolveCreateSetupActiveSetId({ sets: sequenceItems })
    expect(activeSetId).toBe('membershipTitle')
    expect(resolveCreateSetupVisibleSetIds({ sets: sequenceItems, activeSetId })).toEqual([
      'membershipTitle',
    ])
  })

  it('treats explicit No title as complete and reveals species without downstream build sets', () => {
    const values = {
      ...createQuickNpcSetupDefaultValues(context),
      membershipTitle: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
    }
    const sets = buildQuickNpcCreateSetupSets({
      context,
      values,
      onApplySetupChange: () => {},
      titles: [],
    })

    expect(sets.map((set) => set.id)).toEqual(['membershipTitle', 'speciesId', 'level'])
    expect(sets.find((set) => set.id === 'membershipTitle')?.isComplete).toBe(true)

    const sequenceItems = sets.map((set) => ({
      id: set.id,
      isComplete: set.isComplete,
      required: set.required,
      visibleWhenComplete: set.visibleWhenComplete,
    }))
    const activeSetId = resolveCreateSetupActiveSetId({ sets: sequenceItems })
    expect(activeSetId).toBe('speciesId')
    expect(resolveCreateSetupVisibleSetIds({ sets: sequenceItems, activeSetId })).toEqual([
      'membershipTitle',
      'speciesId',
    ])
  })

  it('includes recommended build, level prompt, and class when a title recommendation applies', () => {
    const sets = buildQuickNpcCreateSetupSets({
      context,
      values: {
        speciesId: 'srd-cc-5.2.1:dwarf',
        membershipTitle: 'Guildmaster',
        classId: '',
        level: 5,
      },
      onApplySetupChange: () => {},
      titles: [guildmasterTitle],
    })

    expect(sets.map((set) => set.id)).toEqual([
      'membershipTitle',
      'speciesId',
      'recommendedBuild',
      'level',
      'classId',
    ])

    const recommendedBuild = sets.find((set) => set.id === 'recommendedBuild')
    expect(recommendedBuild).toMatchObject({
      kind: 'note',
      fieldLabel: QUICK_NPC_RECOMMENDED_BUILD_FIELD_LABEL,
      body: getNpcAuthoringTemplateLabel('covert_operator'),
      isComplete: true,
      required: false,
      visibleWhenComplete: ['speciesId'],
    })

    const titleSet = sets.find((set) => set.id === 'membershipTitle')
    expect(titleSet).toMatchObject({
      required: false,
      prompt: QUICK_NPC_TITLE_FIELD_PROMPT,
      isComplete: true,
    })

    const speciesSet = sets.find((set) => set.id === 'speciesId')
    expect(speciesSet).toMatchObject({
      visibleWhenComplete: ['membershipTitle'],
    })

    const levelSet = sets.find((set) => set.id === 'level')
    expect(levelSet).toMatchObject({
      prompt: 'Recommended for Guildmaster: Level 5.',
      visibleWhenComplete: ['speciesId'],
    })
    expect(levelSet?.dependsOn).toBeUndefined()
  })

  it('includes class when level progression applies without a title recommendation', () => {
    const sets = buildQuickNpcCreateSetupSets({
      context,
      values: {
        speciesId: 'srd-cc-5.2.1:dwarf',
        membershipTitle: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
        classId: '',
        level: 1,
      },
      onApplySetupChange: () => {},
      titles: [],
    })

    expect(sets.map((set) => set.id)).toEqual(['membershipTitle', 'speciesId', 'level', 'classId'])
    expect(sets[0]?.kind).toBe('choice')
    expect(sets[2]?.kind).toBe('number')
    expect(sets[3]?.kind).toBe('choice')
  })

  it('keeps level expanded while complete', () => {
    const sets = buildQuickNpcCreateSetupSets({
      context,
      values: {
        speciesId: 'srd-cc-5.2.1:dwarf',
        membershipTitle: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
        classId: '',
        level: 1,
      },
      onApplySetupChange: () => {},
      titles: [],
    })

    const levelSet = sets.find((set) => set.id === 'level')
    expect(levelSet?.collapseWhenComplete).toBe(false)
    expect(levelSet?.isComplete).toBe(true)
  })

  it('merges title template and organization class affinities for class recommendations', () => {
    const fighterClass = {
      ...populatedBuilderCatalog.classes[0]!,
      id: 'srd-cc-5.2.1:fighter',
      slug: 'fighter',
      name: 'Fighter',
    }
    const multiClassContext = createCampaignNpcBuilderContextFixture({
      catalog: {
        ...populatedBuilderCatalog,
        classes: [fighterClass, rogueClass],
      },
    })

    const sets = buildQuickNpcCreateSetupSets({
      context: multiClassContext,
      values: {
        speciesId: 'srd-cc-5.2.1:dwarf',
        membershipTitle: 'Guildmaster',
        classId: '',
        level: 5,
      },
      onApplySetupChange: () => {},
      titles: [guildmasterTitle],
      members: { classAffinityIds: [fighterClass.id] },
    })

    const classSet = sets.find((set) => set.id === 'classId')
    expect(classSet?.kind).toBe('choice')
    if (classSet?.kind !== 'choice') throw new Error('expected class choice set')
    expect(classSet.prompt).toBe(QUICK_NPC_CLASS_AFFINITY_PROMPT)
    expect(classSet.optionGroups).toEqual([
      {
        id: 'recommended',
        eyebrow: QUICK_NPC_CLASS_AFFINITY_GROUP_EYEBROW,
        options: [
          { value: rogueClass.id, label: 'Rogue' },
          { value: fighterClass.id, label: 'Fighter' },
        ],
      },
    ])
  })

  it('groups class options by organization member class affinities when survivors exist', () => {
    const sets = buildQuickNpcCreateSetupSets({
      context: multiClassContext,
      values: {
        speciesId: 'srd-cc-5.2.1:dwarf',
        membershipTitle: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
        classId: '',
        level: 1,
      },
      onApplySetupChange: () => {},
      titles: [],
      members: { classAffinityIds: [rogueClass.id] },
    })

    const classSet = sets.find((set) => set.id === 'classId')
    expect(classSet?.kind).toBe('choice')
    if (classSet?.kind !== 'choice') throw new Error('expected class choice set')
    expect(classSet.optionGroups).toEqual([
      {
        id: 'recommended',
        eyebrow: QUICK_NPC_CLASS_AFFINITY_GROUP_EYEBROW,
        options: [{ value: rogueClass.id, label: 'Rogue' }],
      },
      {
        id: 'all-classes',
        eyebrow: QUICK_NPC_CLASS_ALL_GROUP_EYEBROW,
        options: [{ value: 'srd-cc-5.2.1:fighter', label: 'Fighter' }],
      },
    ])
  })

  it('groups species options by organization member species affinities when survivors exist', () => {
    const sets = buildQuickNpcCreateSetupSets({
      context: multiSpeciesContext,
      values: createQuickNpcSetupDefaultValues(multiSpeciesContext),
      onApplySetupChange: () => {},
      titles: [],
      members: { speciesAffinityIds: [elfSpecies.id] },
    })

    const speciesSet = sets.find((set) => set.id === 'speciesId')
    expect(speciesSet?.kind).toBe('choice')
    if (speciesSet?.kind !== 'choice') throw new Error('expected species choice set')
    expect(speciesSet.optionGroups).toEqual([
      {
        id: 'recommended',
        eyebrow: QUICK_NPC_AFFINITY_RECOMMENDED_EYEBROW,
        options: [{ value: elfSpecies.id, label: 'Elf' }],
      },
      {
        id: 'all-species',
        eyebrow: QUICK_NPC_SPECIES_ALL_GROUP_EYEBROW,
        options: [{ value: 'srd-cc-5.2.1:dwarf', label: 'Dwarf' }],
      },
    ])
  })
})

describe('formatQuickNpcLevelRecommendationPrompt', () => {
  it('returns undefined when title setup is untouched', () => {
    expect(
      formatQuickNpcLevelRecommendationPrompt({
        membershipTitle: undefined,
        titles: [guildmasterTitle],
      }),
    ).toBeUndefined()
  })

  it('returns undefined when the title has no recommendation', () => {
    expect(
      formatQuickNpcLevelRecommendationPrompt({
        membershipTitle: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
        titles: [],
      }),
    ).toBeUndefined()
  })

  it('formats the recommended level prompt from the selected title', () => {
    expect(
      formatQuickNpcLevelRecommendationPrompt({
        membershipTitle: 'Guildmaster',
        titles: [guildmasterTitle],
      }),
    ).toBe('Recommended for Guildmaster: Level 5.')
  })
})

describe('resolveQuickNpcSetupModel', () => {
  const context = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })
  const rogueClass = {
    ...populatedBuilderCatalog.classes[0]!,
    id: 'srd-cc-5.2.1:rogue',
    slug: 'rogue',
    name: 'Rogue',
  }
  const multiClassContext = createCampaignNpcBuilderContextFixture({
    catalog: {
      ...populatedBuilderCatalog,
      classes: [populatedBuilderCatalog.classes[0]!, rogueClass],
    },
  })

  it('defaults to campaign minimum level', () => {
    expect(resolveQuickNpcDefaultLevel(context)).toBe(0)
  })

  it('requires an explicit title choice before Continue', () => {
    expect(
      resolveQuickNpcSetupModel({
        context,
        values: {
          ...createQuickNpcSetupDefaultValues(context),
          speciesId: 'srd-cc-5.2.1:dwarf',
        },
      }).canContinue,
    ).toBe(false)
  })

  it('requires species and a valid level to continue at level 0', () => {
    expect(
      resolveQuickNpcSetupModel({
        context,
        values: createQuickNpcSetupDefaultValues(context),
      }).canContinue,
    ).toBe(false)

    expect(
      resolveQuickNpcSetupModel({
        context,
        values: {
          speciesId: 'srd-cc-5.2.1:dwarf',
          membershipTitle: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
          classId: '',
          level: 0,
        },
      }).canContinue,
    ).toBe(true)
  })

  it('requires class when level progression applies', () => {
    expect(
      resolveQuickNpcSetupModel({
        context,
        values: {
          speciesId: 'srd-cc-5.2.1:dwarf',
          membershipTitle: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
          classId: '',
          level: 1,
        },
      }).canContinue,
    ).toBe(false)

    expect(
      resolveQuickNpcSetupModel({
        context,
        values: {
          speciesId: 'srd-cc-5.2.1:dwarf',
          membershipTitle: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
          classId: 'srd-cc-5.2.1:fighter',
          level: 1,
        },
      }).canContinue,
    ).toBe(true)
  })

  it('formats classless level 0 summaries', () => {
    const values = {
      speciesId: 'srd-cc-5.2.1:dwarf',
      membershipTitle: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
      classId: '',
      level: 0,
    }

    expect(formatQuickNpcSetupCharacterSummary(values, context)).toBe('Dwarf · Level 0')
  })

  it('formats the setup summary with the canonical character summary line', () => {
    const values = {
      speciesId: 'srd-cc-5.2.1:dwarf',
      membershipTitle: ORGANIZATION_MEMBERSHIP_NO_TITLE_VALUE,
      classId: 'srd-cc-5.2.1:fighter',
      level: 1,
    }

    expect(formatQuickNpcSetupCharacterSummary(values, context)).toBe('Dwarf · Level 1 Fighter')
    expect(
      resolveQuickNpcSetupModel({
        context,
        values,
      }).summaryLine,
    ).toBe('Dwarf · Level 1 Fighter')
  })

  it('enables Continue when a single recommendation has been auto-seeded', () => {
    expect(
      resolveQuickNpcSetupModel({
        context: multiClassContext,
        values: {
          speciesId: 'srd-cc-5.2.1:dwarf',
          membershipTitle: 'Guildmaster',
          classId: rogueClass.id,
          level: 5,
        },
        titles: [guildmasterTitle],
        members: { classAffinityIds: [rogueClass.id] },
      }).canContinue,
    ).toBe(true)
  })

  it('requires explicit Class selection when multiple recommendations exist', () => {
    const fighterClass = {
      ...populatedBuilderCatalog.classes[0]!,
      id: 'srd-cc-5.2.1:fighter',
      slug: 'fighter',
      name: 'Fighter',
    }
    const multiClassContext = createCampaignNpcBuilderContextFixture({
      catalog: {
        ...populatedBuilderCatalog,
        classes: [fighterClass, rogueClass],
      },
    })

    expect(
      resolveQuickNpcSetupModel({
        context: multiClassContext,
        values: {
          speciesId: 'srd-cc-5.2.1:dwarf',
          membershipTitle: 'Guildmaster',
          classId: '',
          level: 5,
        },
        titles: [guildmasterTitle],
        members: { classAffinityIds: [fighterClass.id] },
      }).canContinue,
    ).toBe(false)
  })

  it('marks an auto-seeded Class as complete for collapse', () => {
    const sets = buildQuickNpcCreateSetupSets({
      context: multiClassContext,
      values: {
        speciesId: 'srd-cc-5.2.1:dwarf',
        membershipTitle: 'Guildmaster',
        classId: rogueClass.id,
        level: 5,
      },
      onApplySetupChange: () => {},
      titles: [guildmasterTitle],
      members: { classAffinityIds: [rogueClass.id] },
    })

    const classSet = sets.find((set) => set.id === 'classId')
    expect(classSet).toMatchObject({
      kind: 'choice',
      value: rogueClass.id,
      isComplete: true,
      collapseWhenComplete: true,
      collapseWhenActiveAndComplete: true,
    })
  })

  it('appends the selected title and recommended build to the setup summary', () => {
    const values = {
      speciesId: 'srd-cc-5.2.1:dwarf',
      membershipTitle: 'Guildmaster',
      classId: 'srd-cc-5.2.1:fighter',
      level: 5,
    }

    expect(formatQuickNpcSetupCharacterSummary(values, context, [guildmasterTitle])).toBe(
      'Dwarf · Level 5 Fighter · Guildmaster · Covert operator',
    )
    expect(
      resolveQuickNpcSetupModel({
        context,
        values,
        titles: [guildmasterTitle],
      }).summaryLine,
    ).toBe('Dwarf · Level 5 Fighter · Guildmaster · Covert operator')
  })
})
