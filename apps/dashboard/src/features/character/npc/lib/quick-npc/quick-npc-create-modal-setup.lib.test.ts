import { describe, expect, it } from 'vitest'

import { makeSpecies } from '@/test/fixtures/factories/species'
import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../../lib/fixtures/character-builder-fixtures'
import {
  buildQuickNpcCreateSetupSets,
  resolveQuickNpcSetupSummaryRows,
  isQuickNpcBuildResolved,
  quickNpcBuildRevision,
  resolveQuickNpcBuildExternalDecision,
  QUICK_NPC_BUILD_EXTERNAL_DECISION_ID,
  QUICK_NPC_ORG_MEMBER_SETUP_DESCRIPTION,
  QUICK_NPC_ORG_MEMBER_SETUP_HEADLINE,
  QUICK_NPC_STANDALONE_SETUP_DESCRIPTION,
  QUICK_NPC_STANDALONE_SETUP_HEADLINE,
  resolveQuickNpcModalChrome,
} from './quick-npc-create-modal-setup.lib'
import {
  QUICK_NPC_BUILD_FIELD_LABEL,
  QUICK_NPC_RECOMMENDED_BUILD_FIELD_LABEL,
  resolveQuickNpcBuildCardModel,
} from './quick-npc-build-card.lib'
import {
  createQuickNpcSetupDefaultValues,
  isQuickNpcMembershipTitleSetupComplete,
} from './quick-npc-form-fields'
import { QUICK_NPC_RECOMMENDED_GROUP_EYEBROW } from './quick-npc-affinity-option-groups.lib'
import { resolveQuickNpcClassOptionGroups } from './quick-npc-class-option-groups.lib'
import { QUICK_NPC_ROLE_ALL_GROUP_EYEBROW } from './quick-npc-npc-template-option.lib'
import { resolveCreateSetupActiveSetId, resolveCreateSetupVisibleSetIds } from '@/lib/create-setup'
import {
  quickNpcMemberSetupValues,
  quickNpcMemberSetupWithNoTitle,
  quickNpcOrganizationMemberCreateContext,
  quickNpcStandaloneCreateContext,
  quickNpcStandaloneSetupValues,
} from './quick-npc-test-fixtures'

const memberCreateContext = quickNpcOrganizationMemberCreateContext()
const standaloneCreateContext = quickNpcStandaloneCreateContext()

describe('resolveQuickNpcModalChrome', () => {
  it('returns stable headlines and phase-specific descriptions', () => {
    expect(resolveQuickNpcModalChrome(standaloneCreateContext, 'setup')).toEqual({
      headline: QUICK_NPC_STANDALONE_SETUP_HEADLINE,
      description: QUICK_NPC_STANDALONE_SETUP_DESCRIPTION,
    })
    expect(resolveQuickNpcModalChrome(standaloneCreateContext, 'authoring')).toEqual({
      headline: QUICK_NPC_STANDALONE_SETUP_HEADLINE,
      description: 'Create a new NPC.',
    })
    expect(resolveQuickNpcModalChrome(memberCreateContext, 'setup')).toEqual({
      headline: QUICK_NPC_ORG_MEMBER_SETUP_HEADLINE,
      description: QUICK_NPC_ORG_MEMBER_SETUP_DESCRIPTION,
    })
    expect(resolveQuickNpcModalChrome(memberCreateContext, 'authoring')).toEqual({
      headline: QUICK_NPC_ORG_MEMBER_SETUP_HEADLINE,
      description: `Create a new NPC as a member of ${memberCreateContext.organization.name}.`,
    })
  })
})

const guildmasterTitle = {
  id: 'omt_guildmaster',
  label: 'Guildmaster',
  description: 'Head of the guild.',
  priority: 50 as const,
  npcRecommendation: { templateId: 'criminal' as const, level: 5 },
} as const

describe('buildQuickNpcCreateSetupSets', () => {
  const context = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })

  it('returns only title and species setup sets for organization-member context', () => {
    const values = createQuickNpcSetupDefaultValues(context, memberCreateContext)
    const sets = buildQuickNpcCreateSetupSets({
      createContext: memberCreateContext,
      context,
      values,
      titles: [],
    })

    expect(sets.map((set) => set.id)).toEqual(['membershipTitle', 'speciesId'])
    expect(sets.find((set) => set.id === 'membershipTitle')?.summaryGroup).toBe('selections')
    expect(
      isQuickNpcMembershipTitleSetupComplete(
        values.contextKind === 'organization-member' ? values.membershipTitle : undefined,
      ),
    ).toBe(false)

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

  it('returns role and species setup sets for standalone context', () => {
    const values = createQuickNpcSetupDefaultValues(context, standaloneCreateContext)
    const sets = buildQuickNpcCreateSetupSets({
      createContext: standaloneCreateContext,
      context,
      values,
      titles: [],
    })

    expect(sets.map((set) => set.id)).toEqual(['npcTemplateId', 'speciesId'])
    expect(sets.find((set) => set.id === 'npcTemplateId')?.isComplete).toBe(false)
    expect(sets.find((set) => set.id === 'speciesId')?.visibleWhenComplete).toEqual([
      'npcTemplateId',
    ])

    const sequenceItems = sets.map((set) => ({
      id: set.id,
      isComplete: set.isComplete,
      required: set.required,
      visibleWhenComplete: set.visibleWhenComplete,
    }))
    expect(resolveCreateSetupActiveSetId({ sets: sequenceItems })).toBe('npcTemplateId')
    expect(
      resolveCreateSetupVisibleSetIds({
        sets: sequenceItems,
        activeSetId: 'npcTemplateId',
      }),
    ).toEqual(['npcTemplateId'])
  })

  it('reveals species after standalone role is chosen', () => {
    const sets = buildQuickNpcCreateSetupSets({
      createContext: standaloneCreateContext,
      context,
      values: quickNpcStandaloneSetupValues({ npcTemplateId: 'guard' }),
      titles: [],
    })

    const sequenceItems = sets.map((set) => ({
      id: set.id,
      isComplete: set.isComplete,
      required: set.required,
      visibleWhenComplete: set.visibleWhenComplete,
    }))
    expect(resolveCreateSetupActiveSetId({ sets: sequenceItems })).toBe('speciesId')
  })

  it('reveals species after membership title is chosen without downstream setup sets', () => {
    const values = quickNpcMemberSetupWithNoTitle()
    const sets = buildQuickNpcCreateSetupSets({
      createContext: memberCreateContext,
      context,
      values,
      titles: [],
    })

    expect(sets.map((set) => set.id)).toEqual(['membershipTitle', 'speciesId'])
    expect(sets.find((set) => set.id === 'membershipTitle')?.isComplete).toBe(true)

    const sequenceItems = sets.map((set) => ({
      id: set.id,
      isComplete: set.isComplete,
      required: set.required,
      visibleWhenComplete: set.visibleWhenComplete,
    }))
    const activeSetId = resolveCreateSetupActiveSetId({ sets: sequenceItems })
    expect(activeSetId).toBe('speciesId')
  })
})

describe('resolveQuickNpcBuildCardModel', () => {
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

  it('returns null until title and species are complete for organization-member context', () => {
    expect(
      resolveQuickNpcBuildCardModel({
        createContext: memberCreateContext,
        context,
        values: createQuickNpcSetupDefaultValues(context, memberCreateContext),
        titles: [],
      }),
    ).toBeNull()
  })

  it('returns null until role and species are complete for standalone context', () => {
    expect(
      resolveQuickNpcBuildCardModel({
        createContext: standaloneCreateContext,
        context,
        values: quickNpcStandaloneSetupValues({
          speciesId: 'srd-cc-5.2.1:dwarf',
          level: 0,
        }),
        titles: [],
      }),
    ).toBeNull()
  })

  it('returns recommended build card after role and species are complete for standalone context', () => {
    const model = resolveQuickNpcBuildCardModel({
      createContext: standaloneCreateContext,
      context,
      values: quickNpcStandaloneSetupValues({
        npcTemplateId: 'guard',
        speciesId: 'srd-cc-5.2.1:dwarf',
        level: 0,
      }),
      titles: [],
    })

    expect(model).toMatchObject({
      mode: 'recommended',
      sectionEyebrow: QUICK_NPC_BUILD_FIELD_LABEL,
      showTemplateIdentity: true,
      templateLabel: 'Guard',
      levelRow: { level: 0 },
      classRow: { classProgressionApplicable: false },
    })
  })

  it('returns recommended build mode with class grouping and level prompt', () => {
    const model = resolveQuickNpcBuildCardModel({
      createContext: memberCreateContext,
      context: multiClassContext,
      values: quickNpcMemberSetupValues({
        speciesId: 'srd-cc-5.2.1:dwarf',
        membershipTitle: 'omt_guildmaster',
        npcTemplateId: 'criminal',
        classId: '',
        level: 5,
      }),
      titles: [guildmasterTitle],
      members: { classAffinityIds: [rogueClass.id] },
    })

    expect(model).toMatchObject({
      mode: 'recommended',
      sectionEyebrow: QUICK_NPC_RECOMMENDED_BUILD_FIELD_LABEL,
      showTemplateIdentity: false,
      roleRow: {
        npcTemplateId: 'criminal',
        selectedRoleLabel: 'Criminal',
        helper: 'Suggested by Guildmaster.',
      },
      levelRow: {
        level: 5,
        helper: 'Suggested by Guildmaster.',
      },
      classRow: { classProgressionApplicable: true },
    })
    expect(model?.classRow.classOptionPresentation.optionGroups?.[0]?.options).toEqual([
      { value: rogueClass.id, label: 'Rogue' },
    ])
    expect(model?.roleRow?.roleOptionPresentation.optionGroups?.[0]).toMatchObject({
      eyebrow: QUICK_NPC_RECOMMENDED_GROUP_EYEBROW,
      options: [{ value: 'criminal', label: 'Criminal' }],
    })
    expect(model?.roleRow?.roleOptionPresentation.optionGroups?.[1]?.eyebrow).toBe(
      QUICK_NPC_ROLE_ALL_GROUP_EYEBROW,
    )
  })

  it('returns build mode without template identity or recommended level helper', () => {
    const model = resolveQuickNpcBuildCardModel({
      createContext: memberCreateContext,
      context,
      values: quickNpcMemberSetupWithNoTitle({
        speciesId: 'srd-cc-5.2.1:dwarf',
        classId: '',
        level: 0,
      }),
      titles: [],
    })

    expect(model).toMatchObject({
      mode: 'build',
      sectionEyebrow: QUICK_NPC_BUILD_FIELD_LABEL,
      levelRow: { level: 0 },
      classRow: { classProgressionApplicable: false },
    })
    expect(model?.templateLabel).toBeUndefined()
    expect(model?.roleRow?.npcTemplateId).toBe('')
    expect(model?.levelRow.helper).toBeUndefined()
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

    const model = resolveQuickNpcBuildCardModel({
      createContext: memberCreateContext,
      context: multiClassContext,
      values: quickNpcMemberSetupValues({
        speciesId: 'srd-cc-5.2.1:dwarf',
        membershipTitle: 'omt_guildmaster',
        npcTemplateId: 'criminal',
        classId: '',
        level: 5,
      }),
      titles: [guildmasterTitle],
      members: { classAffinityIds: [fighterClass.id] },
    })

    expect(model?.classRow.classOptionPresentation.optionGroups).toEqual(
      resolveQuickNpcClassOptionGroups({
        classOptions: model!.classRow.classOptionPresentation.options,
        recommendedClassIds: model!.classRow.recommendedClassIds,
        playableClasses: multiClassContext.catalog.classes,
      }).optionGroups,
    )
  })
})

describe('resolveQuickNpcSetupSummaryRows', () => {
  const context = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })

  it('returns Role, Species, and Build rows with explicit edit targets when a title recommendation exists', () => {
    const rows = resolveQuickNpcSetupSummaryRows({
      createContext: memberCreateContext,
      values: quickNpcMemberSetupValues({
        speciesId: 'srd-cc-5.2.1:dwarf',
        membershipTitle: 'omt_guildmaster',
        npcTemplateId: 'criminal',
        classId: populatedBuilderCatalog.classes[0]!.id,
        level: 5,
      }),
      context,
      titles: [guildmasterTitle],
    })

    expect(rows).toEqual([
      {
        id: 'membershipTitle',
        label: 'Role',
        value: 'Guildmaster',
        targetSetId: 'membershipTitle',
      },
      {
        id: 'speciesId',
        label: 'Species',
        value: 'Dwarf',
        targetSetId: 'speciesId',
      },
      {
        id: 'quickNpcBuild',
        label: 'Build',
        value: 'Criminal · Level 5 Fighter',
        targetSetId: 'quickNpcBuild',
      },
    ])
  })

  it('includes Role row for standalone context when a template is chosen', () => {
    const rows = resolveQuickNpcSetupSummaryRows({
      createContext: standaloneCreateContext,
      values: quickNpcStandaloneSetupValues({
        npcTemplateId: 'scout',
        speciesId: 'srd-cc-5.2.1:dwarf',
        classId: populatedBuilderCatalog.classes[0]!.id,
        level: 1,
      }),
      context,
      titles: [],
    })

    expect(rows).toEqual([
      {
        id: 'npcTemplateId',
        label: 'Role',
        value: 'Scout',
        targetSetId: 'npcTemplateId',
      },
      {
        id: 'speciesId',
        label: 'Species',
        value: 'Dwarf',
        targetSetId: 'speciesId',
      },
      {
        id: 'quickNpcBuild',
        label: 'Build',
        value: 'Scout · Level 1 Fighter',
        targetSetId: 'quickNpcBuild',
      },
    ])
  })

  it('includes Build with level-only copy when no title recommendation exists', () => {
    const rows = resolveQuickNpcSetupSummaryRows({
      createContext: memberCreateContext,
      values: quickNpcMemberSetupValues({
        membershipTitle: 'omt_member',
        speciesId: 'srd-cc-5.2.1:dwarf',
        classId: populatedBuilderCatalog.classes[0]!.id,
        level: 1,
      }),
      context,
      titles: [{ id: 'omt_member', label: 'Member', priority: 10 as const }],
    })

    expect(rows).toEqual([
      {
        id: 'membershipTitle',
        label: 'Role',
        value: 'Member',
        targetSetId: 'membershipTitle',
      },
      {
        id: 'speciesId',
        label: 'Species',
        value: 'Dwarf',
        targetSetId: 'speciesId',
      },
      {
        id: 'quickNpcBuild',
        label: 'Build',
        value: 'Level 1 Fighter',
        targetSetId: 'quickNpcBuild',
      },
    ])
  })

  it('formats Build as level-only when class progression does not apply', () => {
    const elf = makeSpecies({ slug: 'elf', name: 'Elf' })
    const elfContext = createCampaignNpcBuilderContextFixture({
      catalog: {
        ...populatedBuilderCatalog,
        species: [elf, ...populatedBuilderCatalog.species],
      },
    })
    const rows = resolveQuickNpcSetupSummaryRows({
      createContext: memberCreateContext,
      values: quickNpcMemberSetupWithNoTitle({
        speciesId: elf.id,
        classId: populatedBuilderCatalog.classes[0]!.id,
        level: 0,
      }),
      context: elfContext,
      titles: [],
    })

    expect(rows[2]).toEqual({
      id: 'quickNpcBuild',
      label: 'Build',
      value: 'Level 0',
      targetSetId: 'quickNpcBuild',
    })
  })

  it('describes the selected class instead of a role recommendation', () => {
    const wizard = {
      ...populatedBuilderCatalog.classes[0]!,
      id: 'srd-cc-5.2.1:wizard',
      slug: 'wizard',
      name: 'Wizard',
    }
    const wizardContext = createCampaignNpcBuilderContextFixture({
      catalog: {
        ...populatedBuilderCatalog,
        classes: [populatedBuilderCatalog.classes[0]!, wizard],
      },
    })
    const rows = resolveQuickNpcSetupSummaryRows({
      createContext: memberCreateContext,
      values: quickNpcMemberSetupValues({
        membershipTitle: 'omt_guildmaster',
        speciesId: 'srd-cc-5.2.1:dwarf',
        npcTemplateId: 'criminal',
        classId: wizard.id,
        level: 1,
      }),
      context: wizardContext,
      titles: [guildmasterTitle],
    })

    expect(rows.find((row) => row.id === 'quickNpcBuild')?.value).toBe('Criminal · Level 1 Wizard')
    expect(rows.find((row) => row.id === 'quickNpcBuild')?.value).not.toMatch(/recommended/i)
  })
})

describe('isQuickNpcBuildResolved', () => {
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

  it('requires class when level progression applies', () => {
    expect(
      isQuickNpcBuildResolved({
        context,
        values: quickNpcMemberSetupWithNoTitle({
          speciesId: 'srd-cc-5.2.1:dwarf',
          classId: '',
          level: 1,
        }),
      }),
    ).toBe(false)
  })

  it('is resolved at Level 0 without class for standalone context', () => {
    expect(
      isQuickNpcBuildResolved({
        context,
        values: quickNpcStandaloneSetupValues({
          npcTemplateId: 'commoner',
          speciesId: 'srd-cc-5.2.1:dwarf',
          classId: '',
          level: 0,
        }),
      }),
    ).toBe(true)
  })

  it('is resolved when a single recommendation has been auto-seeded', () => {
    expect(
      isQuickNpcBuildResolved({
        context: multiClassContext,
        values: quickNpcMemberSetupValues({
          speciesId: 'srd-cc-5.2.1:dwarf',
          membershipTitle: 'omt_guildmaster',
          npcTemplateId: 'criminal',
          classId: rogueClass.id,
          level: 5,
        }),
      }),
    ).toBe(true)
  })
})

describe('quickNpcBuildRevision', () => {
  const context = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })
  const memberBaseValues = quickNpcMemberSetupValues({
    speciesId: 'srd-cc-5.2.1:dwarf',
    membershipTitle: 'omt_guildmaster',
    npcTemplateId: 'criminal',
    classId: populatedBuilderCatalog.classes[0]!.id,
    level: 5,
  })
  const standaloneBaseValues = quickNpcStandaloneSetupValues({
    npcTemplateId: 'guard',
    speciesId: 'srd-cc-5.2.1:dwarf',
    classId: populatedBuilderCatalog.classes[0]!.id,
    level: 5,
  })

  it('derives member revision from membershipTitle, npcTemplateId, speciesId, level, and classId', () => {
    expect(quickNpcBuildRevision(memberBaseValues)).toBe(
      `omt_guildmaster:criminal:srd-cc-5.2.1:dwarf:5:${populatedBuilderCatalog.classes[0]!.id}`,
    )
    expect(quickNpcBuildRevision({ ...memberBaseValues, membershipTitle: 'Other' })).not.toBe(
      quickNpcBuildRevision(memberBaseValues),
    )
  })

  it('derives standalone revision from npcTemplateId, speciesId, level, and classId', () => {
    expect(quickNpcBuildRevision(standaloneBaseValues)).toBe(
      `guard:srd-cc-5.2.1:dwarf:5:${populatedBuilderCatalog.classes[0]!.id}`,
    )
    expect(quickNpcBuildRevision(standaloneBaseValues)).not.toContain('Guildmaster')
    expect(quickNpcBuildRevision({ ...standaloneBaseValues, level: 3 })).not.toBe(
      quickNpcBuildRevision(standaloneBaseValues),
    )
  })

  it('registers Build as an explicit external decision with Continue label', () => {
    const decision = resolveQuickNpcBuildExternalDecision({
      values: memberBaseValues,
      context,
    })

    expect(decision).toEqual({
      id: QUICK_NPC_BUILD_EXTERNAL_DECISION_ID,
      isResolved: true,
      completion: 'explicit',
      revision: quickNpcBuildRevision(memberBaseValues),
      completeLabel: 'Continue',
    })
  })

  it('changes revision when build-affecting inputs change', () => {
    const first = resolveQuickNpcBuildExternalDecision({ values: memberBaseValues, context })
    const second = resolveQuickNpcBuildExternalDecision({
      values: { ...memberBaseValues, level: 2 },
      context,
    })

    expect(first.revision).not.toBe(second.revision)
  })
})
