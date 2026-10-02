import { describe, expect, it } from 'vitest'

import type { ClassStored } from '../../../content/classes/class'
import type { Equipment } from '../../../content/equipment'
import type { SkillProficiency } from '../../../content/skill-proficiency'
import type { Species } from '../../../content/species'
import { toEquipmentContentId } from '../../creature/equipment'
import { assembleCharacterProficiencies } from '../assembly/assemble-proficiencies'
import { resolveAutomaticNpcBuild } from '../automatic/resolve-automatic-npc-build'
import { buildChoiceSetId, type ChoiceSet } from '../choice-set'
import { indexCharacterBuildCatalog, type CharacterBuildContext } from '../context'
import { createEmptyCharacterBuilderDraft } from '../draft/draft'
import {
  acrobaticsSkill,
  bardClass,
  fluteTool,
  luteTool,
  perceptionSkill,
  rogueClass,
  stealthSkill,
} from '../proficiency-test-fixtures'
import { resolveProficiencyPickerItems } from '../resolvers/proficiency/resolve-proficiency-picker-items'
import { npcTemplateToolChoiceSetId } from '../resolvers/npc-template/resolve-npc-template-role-choices'
import { athleticsSkill, createCharacterBuildContext, dwarfSpecies } from '../test-fixtures'

import {
  npcStartingChoiceAllowanceSelections,
  resolveNpcStartingChoices,
  type NpcStartingChoices,
  type StartingChoiceContribution,
} from './resolve-npc-starting-choices'

const RULESET = 'srd-cc-5.2.1' as const

function skill(slug: string, name: string): SkillProficiency {
  return { ...athleticsSkill, id: `${RULESET}:${slug}`, slug, name }
}

const insightSkill = skill('insight', 'Insight')
const survivalSkill = skill('survival', 'Survival')

function tool(
  slug: string,
  name: string,
  toolCategory: 'artisan' | 'musical_instrument',
): Equipment {
  return {
    ...luteTool,
    id: toEquipmentContentId(RULESET, slug),
    slug,
    name,
    toolCategory,
  }
}

const spear = {
  ...luteTool,
  id: toEquipmentContentId(RULESET, 'spear'),
  slug: 'spear',
  name: 'Spear',
  kind: 'weapon',
} as unknown as Equipment

const thievesTools = tool('thieves-tools', "Thieves' Tools", 'artisan')
const disguiseKit = tool('disguise-kit', 'Disguise Kit', 'artisan')
const drumTool = tool('drum', 'Drum', 'musical_instrument')

const fighterClass: ClassStored = {
  id: `${RULESET}:fighter`,
  slug: 'fighter',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Fighter',
  primaryAbilities: ['str'],
  hitDie: 10,
  proficiencies: {
    savingThrows: ['str', 'con'],
    armor: { categories: ['light'], items: [] },
    weapons: { categories: ['simple'], items: [] },
    skills: { categories: [], items: [] },
  },
  characterCreation: {
    proficiencies: {
      skills: {
        choices: [
          {
            id: 'class-skills',
            choose: 2,
            from: ['perception', 'athletics', 'stealth'],
          },
        ],
      },
    },
  },
  features: [],
}

const humanSpecies = {
  ...dwarfSpecies,
  id: `${RULESET}:human`,
  slug: 'human',
  name: 'Human',
  languageAffinities: ['common'],
  traits: [],
} as const satisfies Species

const elfSpecies = {
  ...dwarfSpecies,
  id: `${RULESET}:elf`,
  slug: 'elf',
  name: 'Elf',
  languageAffinities: ['elvish'],
  traits: [
    {
      kind: 'custom' as const,
      id: 'keen-senses',
      name: 'Keen Senses',
      description: '<p>Choose one skill.</p>',
      grantGroups: [
        {
          grants: [
            {
              kind: 'skillProficiency' as const,
              grant: {
                kind: 'choice' as const,
                choose: 1,
                pool: {
                  source: 'explicit' as const,
                  skillIds: ['insight', 'perception', 'survival'],
                },
              },
            },
          ],
        },
      ],
    },
  ],
} as const satisfies Species

const fixedPerceptionSpecies = {
  ...dwarfSpecies,
  id: `${RULESET}:keen-folk`,
  slug: 'keen-folk',
  name: 'Keen Folk',
  languageAffinities: [],
  traits: [
    {
      kind: 'custom' as const,
      id: 'watchful',
      name: 'Watchful',
      description: '<p>You have Perception.</p>',
      grantGroups: [
        {
          grants: [
            {
              kind: 'skillProficiency' as const,
              grant: { kind: 'fixed' as const, skillIds: ['perception'] },
            },
          ],
        },
      ],
    },
  ],
} as const satisfies Species

const toolChoiceClass: ClassStored = {
  ...rogueClass,
  id: `${RULESET}:tool-choice`,
  slug: 'tool-choice',
  name: 'Tool Choice',
  characterCreation: {
    proficiencies: {
      tools: {
        choices: [
          {
            id: 'class-tools',
            label: 'Tools',
            choose: 1,
            pool: { source: 'explicit', toolSlugs: ['thieves-tools', 'lute'] },
          },
        ],
      },
    },
  },
}

const bardChooseThree: ClassStored = {
  ...bardClass,
  characterCreation: {
    proficiencies: {
      tools: {
        choices: [
          {
            id: 'class-tools',
            label: 'Bard Tools',
            choose: 3,
            pool: { source: 'filtered', toolCategories: ['musical_instrument'] },
          },
        ],
      },
    },
  },
}

function npcContext(
  catalog: Partial<CharacterBuildContext['catalog']> = {},
): CharacterBuildContext {
  const base = createCharacterBuildContext({
    characterKind: 'npc',
    rulesScope: { type: 'campaign', campaignId: 'campaign-1', rulesetId: RULESET },
  })
  return {
    ...base,
    catalog: {
      ...base.catalog,
      skillProficiencies: [
        athleticsSkill,
        perceptionSkill,
        stealthSkill,
        acrobaticsSkill,
        insightSkill,
        survivalSkill,
      ],
      equipment: [thievesTools, disguiseKit, luteTool, fluteTool, drumTool, spear],
      classes: [fighterClass, rogueClass, bardChooseThree, toolChoiceClass],
      species: [dwarfSpecies, humanSpecies, elfSpecies, fixedPerceptionSpecies],
      ...catalog,
    },
  }
}

function allowanceSelections(choices: NpcStartingChoices): Record<string, readonly string[]> {
  return Object.fromEntries(
    choices.contributions
      .filter(
        (entry): entry is Extract<StartingChoiceContribution, { mechanic: 'choice-allowance' }> =>
          entry.mechanic === 'choice-allowance',
      )
      .map((entry) => [entry.choiceSetId, [...entry.selectedIds]]),
  )
}

function expectParity(args: {
  context: CharacterBuildContext
  speciesId: string
  level: 0 | 1
  classId?: string
  npcTemplateId?: 'guard' | 'criminal'
  preferences?: {
    skills?: { id: string; sources: ('template' | 'species' | 'title' | 'user')[] }[]
    tools?: { id: string; sources: ('template' | 'species' | 'title' | 'user')[] }[]
    languages?: { id: string; sources: ('template' | 'species' | 'title' | 'user')[] }[]
  }
}) {
  const choices = resolveNpcStartingChoices({
    context: args.context,
    seed: {
      speciesId: args.speciesId,
      level: args.level,
      ...(args.classId ? { classId: args.classId } : {}),
      ...(args.npcTemplateId ? { npcTemplateId: args.npcTemplateId } : {}),
    },
    preferences: args.preferences,
  })
  const built = resolveAutomaticNpcBuild({
    context: args.context,
    seed: {
      name: 'Parity',
      speciesId: args.speciesId,
      level: args.level,
      alignment: 'n',
      gender: 'male',
      ...(args.classId ? { classId: args.classId } : {}),
      ...(args.npcTemplateId ? { npcTemplateId: args.npcTemplateId } : {}),
    },
    preferences: args.preferences,
  })
  expect(built.ok, built.ok ? '' : built.issues.map((issue) => issue.message).join('\n')).toBe(true)
  if (!built.ok) return

  const automatic = Object.fromEntries(
    built.resolvedChoiceSets
      .filter(
        (choiceSet) =>
          (choiceSet.choiceType === 'skillProficiency' ||
            choiceSet.choiceType === 'toolProficiency' ||
            choiceSet.choiceType === 'language') &&
          choiceSet.min > 0,
      )
      .map((choiceSet) => [choiceSet.id, [...(built.draft.choiceSelections[choiceSet.id] ?? [])]]),
  )
  expect(allowanceSelections(choices)).toEqual(automatic)
}

describe('starting choice ownership', () => {
  const context = npcContext()

  it('matches unseeded automatic fills for level 0 and level 1 fixtures', () => {
    expectParity({ context, speciesId: dwarfSpecies.id, level: 0, npcTemplateId: 'guard' })
    expectParity({ context, speciesId: dwarfSpecies.id, level: 0, npcTemplateId: 'criminal' })
    expectParity({
      context,
      speciesId: elfSpecies.id,
      level: 1,
      classId: fighterClass.id,
    })
    expectParity({
      context,
      speciesId: humanSpecies.id,
      level: 1,
      classId: fighterClass.id,
    })
    expectParity({ context, speciesId: dwarfSpecies.id, level: 1, classId: rogueClass.id })
    expectParity({ context, speciesId: dwarfSpecies.id, level: 1, classId: bardChooseThree.id })
  })

  it('keeps a fixed skill out of the class allowance and marks it already granted', () => {
    const choices = resolveNpcStartingChoices({
      context,
      seed: { speciesId: fixedPerceptionSpecies.id, classId: fighterClass.id, level: 1 },
    })
    const fixed = choices.contributions.find(
      (entry) => entry.mechanic === 'fixed-grant' && entry.category === 'skill',
    )
    const allowance = choices.contributions.find(
      (entry) => entry.mechanic === 'choice-allowance' && entry.category === 'skill',
    )
    expect(fixed).toMatchObject({
      mechanic: 'fixed-grant',
      selectedIds: ['perception'],
      owner: { ownerKind: 'species', ownerLabel: 'Keen Folk', featureLabel: 'Watchful' },
    })
    expect(allowance).toMatchObject({ allowance: { min: 2, max: 2 } })
    expect(allowance?.selectedIds.join(' ')).not.toContain('perception')

    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      species: { speciesId: fixedPerceptionSpecies.id },
      class: { classId: fighterClass.id, level: 1 as const },
    }
    const catalogIndex = indexCharacterBuildCatalog(context.catalog)
    const choiceSets = [
      {
        id: buildChoiceSetId('class', fighterClass.id, 'class-skills'),
        sourceType: 'class',
        sourceId: fighterClass.id,
        choiceType: 'skillProficiency',
        label: 'Skills',
        min: 2,
        max: 2,
        required: true,
        options: [
          { id: perceptionSkill.id, label: 'Perception' },
          { id: athleticsSkill.id, label: 'Athletics' },
          { id: stealthSkill.id, label: 'Stealth' },
        ],
      } satisfies ChoiceSet,
    ]
    const proficiencies = assembleCharacterProficiencies(
      draft,
      catalogIndex,
      choiceSets,
      fighterClass,
      context,
    )
    const perception = resolveProficiencyPickerItems({
      draft,
      context,
      choiceSetId: choiceSets[0]!.id,
      proficiencies,
    }).find((item) => item.optionId === perceptionSkill.id)
    expect(perception?.state.isAlreadyGranted).toBe(true)
  })

  it('grants Common as a fixed language and spends origin slots on other languages', () => {
    const choices = resolveNpcStartingChoices({
      context,
      seed: { speciesId: humanSpecies.id, classId: fighterClass.id, level: 1 },
      preferences: {
        languages: [{ id: 'common', sources: ['species'] }],
      },
    })
    const common = choices.contributions.find(
      (entry) => entry.id === `fixed:language:characterCreation:${RULESET}:language-grants`,
    )
    expect(common).toMatchObject({
      mechanic: 'fixed-grant',
      selectedIds: ['common'],
      owner: { ownerKind: 'origin' },
    })
    const origin = choices.contributions.find(
      (entry) =>
        entry.mechanic === 'choice-allowance' &&
        entry.choiceSetId === `ruleset:${RULESET}:origin-languages`,
    )
    expect(origin?.mechanic === 'choice-allowance' ? origin.allowance : undefined).toEqual({
      min: 2,
      max: 2,
    })
    expect(origin?.selectedIds).not.toContain('common')
    expect(
      npcStartingChoiceAllowanceSelections(choices)[
        origin?.mechanic === 'choice-allowance' ? origin.choiceSetId : ''
      ],
    ).not.toContain('common')
  })

  it('records Rogue thieves tools as a class fixed grant', () => {
    const choices = resolveNpcStartingChoices({
      context,
      seed: { speciesId: dwarfSpecies.id, classId: rogueClass.id, level: 1 },
    })
    const tools = choices.contributions.find(
      (entry) => entry.id === `fixed:tool:classFeature:${rogueClass.id}:tool-proficiencies`,
    )
    expect(tools).toMatchObject({
      mechanic: 'fixed-grant',
      selectedIds: ['thieves-tools'],
      owner: { ownerKind: 'class', ownerLabel: 'Rogue' },
    })
    expect(Object.keys(npcStartingChoiceAllowanceSelections(choices))).not.toContain(tools?.id)
  })

  it('keeps Bard instruments and the Criminal role tool as allowances', () => {
    const bard = resolveNpcStartingChoices({
      context,
      seed: { speciesId: dwarfSpecies.id, classId: bardChooseThree.id, level: 1 },
    })
    const instruments = bard.contributions.find(
      (entry) =>
        entry.mechanic === 'choice-allowance' &&
        entry.choiceSetId === buildChoiceSetId('class', bardChooseThree.id, 'class-tools'),
    )
    expect(instruments).toMatchObject({
      mechanic: 'choice-allowance',
      allowance: { min: 3, max: 3 },
      owner: { ownerKind: 'class', ownerLabel: 'Bard' },
    })

    const criminal = resolveNpcStartingChoices({
      context,
      seed: { speciesId: dwarfSpecies.id, level: 0, npcTemplateId: 'criminal' },
      preferences: {
        tools: [{ id: 'thieves-tools', sources: ['template'] }],
      },
    })
    const roleTool = criminal.contributions.find(
      (entry) =>
        entry.mechanic === 'choice-allowance' &&
        entry.choiceSetId === npcTemplateToolChoiceSetId('criminal'),
    )
    expect(roleTool?.mechanic).toBe('choice-allowance')
    expect(roleTool?.mechanic === 'choice-allowance' ? roleTool.allowance : undefined).toEqual({
      min: 1,
      max: 1,
    })
    expect(roleTool?.mechanic === 'choice-allowance' ? roleTool.suggestedBy : undefined).toEqual({
      [thievesTools.id]: [{ kind: 'role', id: 'criminal' }],
    })
    expect(
      criminal.contributions.some(
        (entry) => entry.mechanic === 'fixed-grant' && entry.selectedIds.includes(thievesTools.id),
      ),
    ).toBe(false)
  })

  it('skips a fixed tool that also sits in a tool allowance pool', () => {
    const choices = resolveNpcStartingChoices({
      context,
      seed: { speciesId: dwarfSpecies.id, classId: toolChoiceClass.id, level: 1 },
    })
    const allowance = choices.contributions.find(
      (entry) =>
        entry.mechanic === 'choice-allowance' &&
        entry.choiceSetId === buildChoiceSetId('class', toolChoiceClass.id, 'class-tools'),
    )
    expect(allowance?.mechanic === 'choice-allowance' ? allowance.allowance : undefined).toEqual({
      min: 1,
      max: 1,
    })
    expect(allowance?.selectedIds).toEqual([luteTool.id])
  })

  it('keeps Elf as the owner and Keen Senses as the subsource', () => {
    const choices = resolveNpcStartingChoices({
      context,
      seed: { speciesId: elfSpecies.id, classId: fighterClass.id, level: 1 },
      preferences: { skills: [] },
    })
    const keen = choices.contributions.find((entry) => entry.id.includes('keen-senses'))
    expect(keen).toMatchObject({
      mechanic: 'choice-allowance',
      owner: { ownerKind: 'species', ownerLabel: 'Elf', featureLabel: 'Keen Senses' },
    })
    expect(
      keen?.mechanic === 'choice-allowance' ? Object.values(keen.suggestedBy ?? {}) : [],
    ).toEqual([[]])
  })

  it('attributes a template pick on Keen Senses and leaves a fallback empty', () => {
    const choices = resolveNpcStartingChoices({
      context,
      seed: { speciesId: elfSpecies.id, classId: fighterClass.id, level: 1 },
      preferences: {
        skills: [{ id: 'perception', sources: ['template'] }],
        recommendationIdentity: { roleId: 'guard' },
      },
    })
    const keen = choices.contributions.find((entry) => entry.id.includes('keen-senses'))
    expect(keen?.mechanic === 'choice-allowance' ? keen.suggestedBy : undefined).toEqual({
      [perceptionSkill.id]: [{ kind: 'role', id: 'guard' }],
    })
  })

  it('traces recommendation sources per selected value', () => {
    const traced = resolveNpcStartingChoices({
      context,
      seed: { speciesId: elfSpecies.id, classId: fighterClass.id, level: 1 },
      preferences: {
        languages: [{ id: 'elvish', sources: ['species', 'template'] }],
        skills: [{ id: 'athletics', sources: ['template'] }],
        recommendationIdentity: { roleId: 'guard' },
      },
    })
    const origin = traced.contributions.find(
      (entry) =>
        entry.mechanic === 'choice-allowance' &&
        entry.choiceSetId === `ruleset:${RULESET}:origin-languages`,
    )
    const elvish = origin?.selectedIds.find((id) => id === 'elvish')
    expect(elvish).toBe('elvish')
    expect(
      origin?.mechanic === 'choice-allowance' ? origin.suggestedBy?.elvish : undefined,
    ).toEqual([
      { kind: 'species', id: elfSpecies.id },
      { kind: 'role', id: 'guard' },
    ])

    const fighterSkills = traced.contributions.find(
      (entry) =>
        entry.mechanic === 'choice-allowance' &&
        entry.choiceSetId === buildChoiceSetId('class', fighterClass.id, 'class-skills'),
    )
    expect(fighterSkills?.owner.ownerLabel).toBe('Fighter')
    expect(
      fighterSkills?.mechanic === 'choice-allowance' ? fighterSkills.suggestedBy : undefined,
    ).toEqual({
      [athleticsSkill.id]: [{ kind: 'role', id: 'guard' }],
      [perceptionSkill.id]: [],
    })
  })

  it('gives baseline languages and retained species languages distinct stable ids', () => {
    const first = resolveNpcStartingChoices({
      context,
      seed: { speciesId: dwarfSpecies.id, level: 0, npcTemplateId: 'guard' },
      preferences: { skills: [{ id: 'perception', sources: ['template'] }] },
    })
    const second = resolveNpcStartingChoices({
      context,
      seed: { speciesId: dwarfSpecies.id, level: 0, npcTemplateId: 'guard' },
      preferences: { skills: [{ id: 'stealth', sources: ['template'] }] },
    })
    const fixedIds = (choices: NpcStartingChoices) =>
      choices.contributions
        .filter((entry) => entry.mechanic === 'fixed-grant')
        .map((entry) => entry.id)
    expect(fixedIds(first)).toEqual(fixedIds(second))
    expect(fixedIds(first)).toEqual(
      expect.arrayContaining([
        `fixed:language:characterCreation:${RULESET}:language-grants`,
        'fixed:language:characterCreation:levelZeroNpcs:baseline',
        `fixed:language:speciesTrait:${dwarfSpecies.id}:language-affinities`,
      ]),
    )
    expect(fixedIds(first).every((id) => !id.includes(':language:language:'))).toBe(true)
  })

  it('never puts fixed grants into overrides or allowance selections', () => {
    const choiceSetId = buildChoiceSetId('class', fighterClass.id, 'class-skills')
    const choices = resolveNpcStartingChoices({
      context,
      seed: { speciesId: fixedPerceptionSpecies.id, classId: fighterClass.id, level: 1 },
      startingChoiceOverrides: { [choiceSetId]: [athleticsSkill.id, stealthSkill.id] },
    })
    for (const id of Object.keys(npcStartingChoiceAllowanceSelections(choices))) {
      expect(id.startsWith('fixed:')).toBe(false)
    }
    expect(
      choices.contributions
        .filter((entry) => entry.mechanic === 'fixed-grant')
        .every((entry) => entry.mechanic === 'fixed-grant' && entry.id.startsWith('fixed:')),
    ).toBe(true)
  })

  it('reports a removed species trait override and keeps a class override', () => {
    const elfSkills = resolveNpcStartingChoices({
      context,
      seed: { speciesId: elfSpecies.id, classId: fighterClass.id, level: 1 },
    }).contributions.find((entry) => entry.id.includes('keen-senses'))
    const classSkills = buildChoiceSetId('class', fighterClass.id, 'class-skills')
    const switched = resolveNpcStartingChoices({
      context,
      seed: { speciesId: humanSpecies.id, classId: fighterClass.id, level: 1 },
      startingChoiceOverrides: {
        ...(elfSkills ? { [elfSkills.id]: [insightSkill.id] } : {}),
        [classSkills]: [athleticsSkill.id, stealthSkill.id],
      },
    })
    expect(switched.removedOverrideIds).toContain(elfSkills?.id)
    expect(switched.removedOverrideIds).not.toContain(classSkills)
    const kept = switched.contributions.find(
      (entry) => entry.mechanic === 'choice-allowance' && entry.choiceSetId === classSkills,
    )
    expect(kept?.selectedIds).toEqual([athleticsSkill.id, stealthSkill.id])
    expect(kept?.mechanic === 'choice-allowance' ? kept.overridden : false).toBe(true)
  })

  it('shows a heritage-dependent allowance after heritage is selected', () => {
    const lineageSpecies = {
      ...dwarfSpecies,
      id: `${RULESET}:lineage-folk`,
      slug: 'lineage-folk',
      name: 'Lineage Folk',
      languageAffinities: [],
      traits: [],
      heritage: {
        id: 'lineage',
        name: 'Lineage',
        choose: 1,
        options: [
          {
            kind: 'custom' as const,
            id: 'high',
            name: 'High',
            grantGroups: [
              {
                grants: [
                  {
                    kind: 'skillProficiency' as const,
                    grant: {
                      kind: 'choice' as const,
                      choose: 1,
                      pool: {
                        source: 'explicit' as const,
                        skillIds: ['athletics', 'stealth'],
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    } as const satisfies Species
    const lineageContext = npcContext({ species: [...context.catalog.species, lineageSpecies] })
    const hidden = resolveNpcStartingChoices({
      context: lineageContext,
      seed: { speciesId: lineageSpecies.id, classId: fighterClass.id, level: 1 },
    })
    expect(hidden.contributions.some((entry) => entry.id.includes('heritage:high'))).toBe(false)

    const shown = resolveNpcStartingChoices({
      context: lineageContext,
      seed: { speciesId: lineageSpecies.id, classId: fighterClass.id, level: 1 },
      heritageOptionId: 'high',
    })
    expect(shown.contributions.some((entry) => entry.id.includes('heritage:high'))).toBe(true)
  })

  it('keeps class-fixed skills and ruleset languages out of later fills', () => {
    const fixedSkillClass: ClassStored = {
      ...fighterClass,
      id: `${RULESET}:fixed-skill`,
      slug: 'fixed-skill',
      name: 'Fixed Skill',
      proficiencies: {
        ...fighterClass.proficiencies,
        skills: { categories: [], items: ['perception'] },
      },
    }
    const fixedContext = npcContext({
      classes: [...context.catalog.classes, fixedSkillClass],
    })
    const choices = resolveNpcStartingChoices({
      context: fixedContext,
      seed: { speciesId: dwarfSpecies.id, classId: fixedSkillClass.id, level: 1 },
    })
    const classSkills = choices.contributions.find(
      (entry) =>
        entry.mechanic === 'choice-allowance' &&
        entry.choiceSetId === buildChoiceSetId('class', fixedSkillClass.id, 'class-skills'),
    )
    expect(classSkills?.selectedIds.join(' ')).not.toContain('perception')
    expect(classSkills?.selectedIds).toHaveLength(2)

    const built = resolveAutomaticNpcBuild({
      context: fixedContext,
      seed: {
        name: 'Held',
        speciesId: dwarfSpecies.id,
        classId: fixedSkillClass.id,
        level: 1,
        alignment: 'n',
        gender: 'male',
      },
    })
    expect(built.ok).toBe(true)
    if (!built.ok || !classSkills || classSkills.mechanic !== 'choice-allowance') return
    expect(built.draft.choiceSelections[classSkills.choiceSetId]).toEqual(classSkills.selectedIds)
  })
})
