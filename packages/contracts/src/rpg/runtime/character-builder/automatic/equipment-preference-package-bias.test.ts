import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../content/equipment'
import type { ClassStored } from '../../../content/classes/class'
import { createCharacterBuildContext, dwarfSpecies, athleticsSkill } from '../test-fixtures'
import { applySelectedClassChange } from '../draft/apply-selected-class-change'
import { indexCharacterBuildCatalog } from '../context'
import { startingEquipmentChoiceSetId } from '../resolvers/equipment/resolve-starting-equipment-choice-sets'
import { deriveEquipmentDraftEntries } from '../resolvers/equipment/derive-equipment-draft-entries'
import {
  resolveNpcTemplateRecommendations,
  toAutomaticNpcBuildPreferences,
} from '../npc/resolve-npc-template-recommendations'
import type { AutomaticNpcBuildPreferences } from './automatic-npc-build-seed'
import type { AutomaticNpcBuildSeed } from './automatic-npc-build-seed'
import { resolveAutomaticChoiceSelections } from './resolve-automatic-choice-selections'
import { resolveAutomaticNpcBuild } from './resolve-automatic-npc-build'
import { nestedStartingEquipmentChoiceSetId } from '../resolvers/equipment/resolve-starting-equipment-choice-sets'

const RULESET = 'srd-cc-5.2.1' as const

const META = {
  rulesetId: RULESET,
  source: 'system' as const,
  status: 'published' as const,
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function weapon(slug: string, category: 'simple' | 'martial' = 'martial') {
  return equipmentSchema.parse({
    ...META,
    id: `${RULESET}:${slug}`,
    slug,
    name: slug,
    description: '',
    cost: { amount: 10, currency: 'gp' },
    weight: { value: 3, unit: 'lb' },
    kind: 'weapon',
    category,
    mode: 'melee',
    damage: { dice: { count: 1, faces: 8 } },
    damageType: 'slashing',
    properties: [],
    mastery: 'sap',
  })
}

function armor(slug: string, category: 'light' | 'medium' | 'heavy' = 'heavy') {
  return equipmentSchema.parse({
    ...META,
    id: `${RULESET}:${slug}`,
    slug,
    name: slug,
    description: '',
    cost: { amount: 50, currency: 'gp' },
    weight: { value: 40, unit: 'lb' },
    kind: 'armor',
    category,
    baseAc: 16,
    addDexModifier: category === 'light',
    stealthDisadvantage: category !== 'light',
    strengthRequirement: category === 'heavy' ? 13 : undefined,
  })
}

const packageFighter: ClassStored = {
  ...META,
  id: `${RULESET}:package-fighter`,
  slug: 'package-fighter',
  name: 'Package Fighter',
  primaryAbilities: ['str'],
  hitDie: 10,
  proficiencies: {
    savingThrows: ['str', 'con'],
    armor: { categories: ['light', 'medium', 'heavy'], items: [] },
    weapons: { categories: ['simple', 'martial'], items: [] },
    skills: { categories: [], items: [] },
  },
  characterCreation: {
    proficiencies: {
      skills: { choices: [{ id: 'class-skills', choose: 1, from: ['athletics'] }] },
    },
    startingEquipment: {
      choose: 1,
      options: [
        {
          id: 'heavy-armor',
          label: 'Heavy Armor',
          items: [
            {
              id: 'chain-mail',
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'chain-mail' },
              quantity: 1,
            },
            {
              id: 'greatsword',
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'greatsword' },
              quantity: 1,
            },
            {
              id: 'javelin',
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'javelin' },
              quantity: 1,
            },
          ],
          wealth: { gp: 4 },
        },
        {
          id: 'skirmisher',
          label: 'Skirmisher',
          items: [
            {
              id: 'studded-leather',
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'studded-leather' },
              quantity: 1,
            },
            {
              id: 'scimitar',
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'scimitar' },
              quantity: 1,
            },
            {
              id: 'longbow',
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'longbow' },
              quantity: 1,
            },
          ],
          wealth: { gp: 11 },
        },
        { id: 'starting-gold', label: 'Starting Gold', items: [], wealth: { gp: 100 } },
      ],
    },
  },
  features: [],
}

const poolFighter: ClassStored = {
  ...packageFighter,
  id: `${RULESET}:pool-fighter`,
  slug: 'pool-fighter',
  name: 'Pool Fighter',
  characterCreation: {
    proficiencies: packageFighter.characterCreation!.proficiencies,
    startingEquipment: {
      choose: 1,
      options: [
        {
          id: 'dagger-kit',
          label: 'Dagger Kit',
          items: [
            {
              id: 'dagger',
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'dagger' },
              quantity: 1,
            },
          ],
          wealth: { gp: 5 },
        },
        {
          id: 'pool-kit',
          label: 'Pool Kit',
          items: [
            {
              id: 'martial-choice',
              kind: 'choice',
              choose: 1,
              pool: { source: 'filtered', equipmentKind: 'weapon', weaponCategory: 'martial' },
            },
          ],
          wealth: { gp: 5 },
        },
      ],
    },
  },
}

const packageWizard: ClassStored = {
  ...packageFighter,
  id: `${RULESET}:package-wizard`,
  slug: 'package-wizard',
  name: 'Package Wizard',
  hitDie: 6,
  characterCreation: {
    proficiencies: packageFighter.characterCreation!.proficiencies,
    startingEquipment: {
      choose: 1,
      options: [
        {
          id: 'scholar',
          label: 'Scholar',
          items: [
            {
              id: 'dagger',
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'dagger' },
              quantity: 1,
            },
          ],
          wealth: { gp: 5 },
        },
        {
          id: 'field-kit',
          label: 'Field Kit',
          items: [
            {
              id: 'leather-armor',
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'leather-armor' },
              quantity: 1,
            },
          ],
          wealth: { gp: 5 },
        },
      ],
    },
  },
}

const unmatchedWizard: ClassStored = {
  ...packageWizard,
  id: `${RULESET}:unmatched-wizard`,
  slug: 'unmatched-wizard',
  name: 'Unmatched Wizard',
  characterCreation: {
    proficiencies: packageFighter.characterCreation!.proficiencies,
    startingEquipment: {
      choose: 1,
      options: [
        {
          id: 'scholar',
          label: 'Scholar',
          items: [
            {
              id: 'dagger',
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'dagger' },
              quantity: 1,
            },
          ],
          wealth: { gp: 5 },
        },
      ],
    },
  },
}

function packageContext(classEntries: ClassStored | readonly ClassStored[]) {
  const base = createCharacterBuildContext()
  return {
    ...base,
    catalog: {
      ...base.catalog,
      classes: Array.isArray(classEntries) ? [...classEntries] : [classEntries],
      equipment: [
        weapon('greatsword'),
        weapon('javelin', 'simple'),
        weapon('scimitar'),
        weapon('longbow'),
        weapon('dagger', 'simple'),
        weapon('greataxe'),
        armor('chain-mail', 'heavy'),
        armor('studded-leather', 'light'),
        armor('leather-armor', 'light'),
      ],
      skillProficiencies: [athleticsSkill],
    },
  }
}

function guardPreferences(classes: ClassStored[]): AutomaticNpcBuildPreferences {
  return toAutomaticNpcBuildPreferences(
    resolveNpcTemplateRecommendations({
      level: 1,
      userTemplateId: 'guard',
      playableClasses: classes,
    }),
  )
}

function equipmentIdsOf(inventory: ReturnType<typeof deriveEquipmentDraftEntries>): string[] {
  return [
    ...inventory.weapons,
    ...inventory.armor,
    ...inventory.tools,
    ...inventory.gear,
    ...inventory.magicItems,
  ].map((entry) => entry.equipmentId)
}

function seed(
  classId: string,
  npcTemplateId?: AutomaticNpcBuildSeed['npcTemplateId'],
): AutomaticNpcBuildSeed {
  return {
    name: 'Test NPC',
    speciesId: dwarfSpecies.id,
    classId,
    level: 1,
    alignment: 'ln',
    gender: 'male',
    ...(npcTemplateId ? { npcTemplateId } : {}),
  }
}

describe('equipment preference package bias', () => {
  it('selects skirmisher for scout role preferences on a dual-package fighter', () => {
    const context = packageContext(packageFighter)
    const preferences = toAutomaticNpcBuildPreferences(
      resolveNpcTemplateRecommendations({
        level: 1,
        userTemplateId: 'scout',
        playableClasses: [packageFighter],
      }),
    )
    const result = resolveAutomaticNpcBuild({
      seed: seed(packageFighter.id, 'scout'),
      context,
      preferences,
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.draft.choiceSelections[startingEquipmentChoiceSetId(packageFighter.id)]).toEqual([
      'skirmisher',
    ])
  })

  it('keeps heavy-armor for guard role preferences', () => {
    const context = packageContext(packageFighter)
    const preferences = toAutomaticNpcBuildPreferences(
      resolveNpcTemplateRecommendations({
        level: 1,
        userTemplateId: 'guard',
        playableClasses: [packageFighter],
      }),
    )
    const result = resolveAutomaticNpcBuild({
      seed: seed(packageFighter.id, 'guard'),
      context,
      preferences,
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.draft.choiceSelections[startingEquipmentChoiceSetId(packageFighter.id)]).toEqual([
      'heavy-armor',
    ])
  })

  it('lets one user weapon preference beat multiple role matches', () => {
    const context = packageContext(packageFighter)
    const rolePrefs = toAutomaticNpcBuildPreferences(
      resolveNpcTemplateRecommendations({
        level: 1,
        userTemplateId: 'guard',
        playableClasses: [packageFighter],
      }),
    )
    const preferences = {
      ...rolePrefs,
      equipmentPreferences: [
        {
          slug: 'longbow',
          source: 'user' as const,
          sourcePriority: 0,
          index: 0,
        },
        ...(rolePrefs.equipmentPreferences ?? []),
      ],
    }
    const result = resolveAutomaticNpcBuild({
      seed: seed(packageFighter.id, 'guard'),
      context,
      preferences,
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.draft.choiceSelections[startingEquipmentChoiceSetId(packageFighter.id)]).toEqual([
      'skirmisher',
    ])
  })

  it('prefers a nested pool package when it can satisfy a recommended weapon', () => {
    const context = packageContext(poolFighter)
    const preferences = toAutomaticNpcBuildPreferences(
      resolveNpcTemplateRecommendations({
        level: 1,
        userTemplateId: 'guard',
        playableClasses: [poolFighter],
      }),
    )
    const result = resolveAutomaticNpcBuild({
      seed: seed(poolFighter.id, 'guard'),
      context,
      preferences: {
        ...preferences,
        equipmentPreferences: [
          {
            slug: 'greataxe',
            source: 'user',
            sourcePriority: 0,
            index: 0,
          },
        ],
      },
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.draft.choiceSelections[startingEquipmentChoiceSetId(poolFighter.id)]).toEqual([
      'pool-kit',
    ])
    expect(
      result.draft.choiceSelections[
        nestedStartingEquipmentChoiceSetId(poolFighter.id, 'pool-kit', 0)
      ],
    ).toEqual([`${RULESET}:greataxe`])
  })

  it('still honors required weapon constraints over soft preferences', () => {
    const context = packageContext(packageFighter)
    const preferences = toAutomaticNpcBuildPreferences(
      resolveNpcTemplateRecommendations({
        level: 1,
        userTemplateId: 'scout',
        playableClasses: [packageFighter],
      }),
    )
    const result = resolveAutomaticNpcBuild({
      seed: seed(packageFighter.id, 'scout'),
      context,
      preferences,
      constraints: { requiredWeaponIds: [`${RULESET}:greatsword`], requiredSpellIds: [] },
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.draft.choiceSelections[startingEquipmentChoiceSetId(packageFighter.id)]).toEqual([
      'heavy-armor',
    ])
  })

  it('ranks a legal wizard package with guard preferences and ignores an unmatched spear', () => {
    const context = packageContext([packageFighter, packageWizard])
    const preferences = guardPreferences([packageFighter, packageWizard])
    const result = resolveAutomaticNpcBuild({
      seed: seed(packageWizard.id, 'guard'),
      context,
      preferences,
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const wizardChoiceSetId = startingEquipmentChoiceSetId(packageWizard.id)
    expect(result.draft.choiceSelections[wizardChoiceSetId]).toEqual(['field-kit'])
    expect(
      result.draft.choiceSelections[startingEquipmentChoiceSetId(packageFighter.id)],
    ).toBeUndefined()

    const attributed = resolveAutomaticChoiceSelections({
      draft: {
        ...result.draft,
        choiceSelections: { ...result.draft.choiceSelections, [wizardChoiceSetId]: [] },
      },
      context,
      preferences,
    })
    expect(attributed.ok).toBe(true)
    if (!attributed.ok) return
    expect(attributed.suggestedBy[wizardChoiceSetId]?.['field-kit']).toEqual(
      expect.arrayContaining([{ kind: 'role', id: 'guard' }]),
    )
    expect(attributed.suggestedBy[startingEquipmentChoiceSetId(packageFighter.id)]).toBeUndefined()

    const unmatchedContext = packageContext(unmatchedWizard)
    const unmatchedPreferences = guardPreferences([unmatchedWizard])
    const unmatched = resolveAutomaticNpcBuild({
      seed: seed(unmatchedWizard.id, 'guard'),
      context: unmatchedContext,
      preferences: unmatchedPreferences,
    })
    expect(unmatched.ok).toBe(true)
    if (!unmatched.ok) return
    const unmatchedChoiceSetId = startingEquipmentChoiceSetId(unmatchedWizard.id)
    expect(unmatched.draft.choiceSelections[unmatchedChoiceSetId]).toEqual(['scholar'])
    const unmatchedAttribution = resolveAutomaticChoiceSelections({
      draft: {
        ...unmatched.draft,
        choiceSelections: { ...unmatched.draft.choiceSelections, [unmatchedChoiceSetId]: [] },
      },
      context: unmatchedContext,
      preferences: unmatchedPreferences,
    })
    expect(unmatchedAttribution.ok).toBe(true)
    if (!unmatchedAttribution.ok) return
    expect(unmatchedAttribution.suggestedBy[unmatchedChoiceSetId]?.scholar ?? []).toEqual([])
  })

  it('clears a fighter package on a wizard class change and re-resolves fighter from scratch', () => {
    const classes = [packageFighter, packageWizard]
    const context = packageContext(classes)
    const preferences = guardPreferences(classes)
    const fighterBuild = resolveAutomaticNpcBuild({
      seed: seed(packageFighter.id, 'guard'),
      context,
      preferences,
    })
    expect(fighterBuild.ok).toBe(true)
    if (!fighterBuild.ok) return

    const fighterPackageId = startingEquipmentChoiceSetId(packageFighter.id)
    const nestedPoolId = nestedStartingEquipmentChoiceSetId(packageFighter.id, 'heavy-armor', 0)
    const drafted = {
      ...fighterBuild.draft,
      choiceSelections: {
        ...fighterBuild.draft.choiceSelections,
        [nestedPoolId]: [`${RULESET}:javelin`],
      },
      equipment: {
        mode: 'gold' as const,
        purchases: [
          { equipmentId: `${RULESET}:rope`, quantity: 1, sourceMode: 'manual' as const },
          {
            equipmentId: `${RULESET}:greatsword`,
            quantity: 1,
            sourceMode: 'startingGold' as const,
          },
        ],
        editedSincePackageSelection: true,
      },
    }

    const changed = applySelectedClassChange({
      draft: drafted,
      nextClassId: packageWizard.id,
      context,
    })
    expect(changed.class.classId).toBe(packageWizard.id)
    expect(changed.choiceSelections[fighterPackageId]).toBeUndefined()
    expect(changed.choiceSelections[nestedPoolId]).toBeUndefined()
    expect(changed.equipment?.purchases).toEqual([
      { equipmentId: `${RULESET}:rope`, quantity: 1, sourceMode: 'manual' },
    ])
    expect(changed.equipment?.classPackage).toEqual({ state: 'unresolved' })
    expect(changed.equipment?.editedSincePackageSelection).toBe(false)
    expect(changed.equipment?.mode).toBe('package')

    const wizardFill = resolveAutomaticChoiceSelections({
      draft: changed,
      context,
      preferences,
    })
    expect(wizardFill.ok).toBe(true)
    if (!wizardFill.ok) return
    const wizardPackageId = startingEquipmentChoiceSetId(packageWizard.id)
    expect(wizardFill.draft.choiceSelections[wizardPackageId]).toEqual(['field-kit'])
    expect(wizardFill.draft.choiceSelections[fighterPackageId]).toBeUndefined()
    expect(wizardFill.draft.choiceSelections[nestedPoolId]).toBeUndefined()
    expect(wizardFill.suggestedBy[wizardPackageId]?.['field-kit']).toEqual(
      expect.arrayContaining([{ kind: 'role', id: 'guard' }]),
    )
    expect(JSON.stringify(wizardFill.suggestedBy)).not.toContain('heavy-armor')

    const catalogIndex = indexCharacterBuildCatalog(context.catalog)
    const wizardInventory = equipmentIdsOf(
      deriveEquipmentDraftEntries(wizardFill.draft, catalogIndex),
    )
    expect(wizardInventory).toContain(`${RULESET}:leather-armor`)
    expect(wizardInventory).not.toContain(`${RULESET}:chain-mail`)
    expect(wizardInventory).not.toContain(`${RULESET}:greatsword`)

    const back = applySelectedClassChange({
      draft: wizardFill.draft,
      nextClassId: packageFighter.id,
      context,
    })
    expect(back.choiceSelections[fighterPackageId]).toBeUndefined()
    expect(back.equipment?.purchases).toEqual([
      { equipmentId: `${RULESET}:rope`, quantity: 1, sourceMode: 'manual' },
    ])

    const scoutPreferences = toAutomaticNpcBuildPreferences(
      resolveNpcTemplateRecommendations({
        level: 1,
        userTemplateId: 'scout',
        playableClasses: classes,
      }),
    )
    const fighterAgain = resolveAutomaticChoiceSelections({
      draft: back,
      context,
      preferences: scoutPreferences,
    })
    expect(fighterAgain.ok).toBe(true)
    if (!fighterAgain.ok) return
    expect(fighterAgain.draft.choiceSelections[fighterPackageId]).toEqual(['skirmisher'])
  })
})
