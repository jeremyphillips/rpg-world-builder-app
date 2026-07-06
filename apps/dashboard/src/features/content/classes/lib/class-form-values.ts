import {
  MAX_CHARACTER_LEVEL,
  type CharacterClass,
  type ClassProficiencies,
  type ClassResource,
  type CreateClassInput,
  type Spellcasting,
} from '@rpg/contracts'

import { envelopeSlugFields } from '../../lib/forms/content-form-key-helpers'
import type { ContentFormInputCtx } from '../../lib/forms/content-form-registry'
import type { ClassFormValues } from './class-form-fields'
import { createAsiFeature } from './class-asi-features'
import { createSubclassChoiceFeature } from './class-subclass-choice-features'
import { featuresFromFormValues, featureToFormRow } from './class-feature-form-fields'
import { normalizeClassWeaponProficiencies } from './class-weapon-proficiency-helpers'
import {
  emptyProgressionTable,
  progressionTableFromFormValues,
  progressionTableToFormValues,
  type ProgressionTableFormValue,
} from './progression-table-helpers'
import { startingEquipmentFromFormValues } from './character-creation/class-starting-equipment-form-values'

type ResourceRowForm = {
  name: string
  entries: { level: number; value: number }[]
}

export function proficienciesToFormValues(
  proficiencies: ClassProficiencies,
  characterCreation?: CharacterClass['characterCreation'],
) {
  const skillChoice = characterCreation?.proficiencies?.skills?.choices?.[0]
  return {
    savingThrows: proficiencies.savingThrows,
    armor: proficiencies.armor.categories,
    weapons: {
      categories: proficiencies.weapons.categories,
      items: proficiencies.weapons.items ?? [],
    },
    tools: {
      categories: proficiencies.tools?.categories ?? [],
      items: proficiencies.tools?.items ?? [],
    },
    skills: {
      choose: skillChoice?.choose ?? 0,
      from: skillChoice?.from ?? [],
    },
  }
}

function normalizeClassToolProficiencies(
  tools: ClassFormValues['proficiencies']['tools'],
): ClassProficiencies['tools'] {
  const categories = [...tools.categories]
  const items = tools.items ?? []
  if (categories.length === 0 && items.length === 0) return undefined
  return {
    categories,
    items: [...items],
  }
}

function proficienciesFromFormValues(
  proficiencies: ClassFormValues['proficiencies'],
  hasSpecificWeapons: boolean,
): ClassProficiencies {
  const tools = normalizeClassToolProficiencies(proficiencies.tools)
  const weapons = normalizeClassWeaponProficiencies({
    categories: proficiencies.weapons.categories,
    items: proficiencies.weapons.items,
    hasSpecificWeapons,
  })

  return {
    savingThrows: proficiencies.savingThrows,
    armor: { categories: proficiencies.armor, items: [] },
    weapons,
    ...(tools ? { tools } : {}),
    skills: { categories: [], items: [] },
  }
}

function skillChoicesFromFormValues(
  proficiencies: ClassFormValues['proficiencies'],
): NonNullable<CreateClassInput['characterCreation']>['proficiencies'] | undefined {
  const { choose, from } = proficiencies.skills
  if (choose <= 0 || from.length === 0) return undefined
  return {
    skills: {
      choices: [{ id: 'class-skills', choose, from }],
    },
  }
}

export function resourceToFormRow(resource: ClassResource): ResourceRowForm {
  return {
    name: resource.name,
    entries: resource.entries,
  }
}

function resourceFromFormRow(row: ResourceRowForm): ClassResource {
  return {
    name: row.name,
    entries: row.entries,
  }
}

function classCharacterCreationInputFromForm(
  values: ClassFormValues,
  entity?: CharacterClass,
): CreateClassInput['characterCreation'] | undefined {
  const startingEquipment = startingEquipmentFromFormValues(
    values.characterCreation?.startingEquipment,
    entity?.characterCreation?.startingEquipment,
  )
  const proficiencies = skillChoicesFromFormValues(values.proficiencies)
  if (!startingEquipment && !proficiencies) return undefined
  return {
    ...(startingEquipment ? { startingEquipment } : {}),
    ...(proficiencies ? { proficiencies } : {}),
  }
}

function classResourcesInputFromForm(
  resources: ClassFormValues['resources'],
): ClassResource[] | undefined {
  return resources?.length ? resources.map(resourceFromFormRow) : undefined
}

export function buildClassCreateInput(
  values: ClassFormValues,
  ctx: ContentFormInputCtx<CharacterClass> | undefined,
) {
  const characterCreation = classCharacterCreationInputFromForm(values, ctx?.entity)

  return {
    ...envelopeSlugFields(values.name, ctx),
    name: values.name,
    description: values.description || undefined,
    primaryAbilities: values.primaryAbilities,
    hitDie: values.hitDie,
    spellcasting: spellcastingFromFormValues(values.hasSpellcasting, values.spellcasting),
    proficiencies: proficienciesFromFormValues(
      values.proficiencies,
      values.weaponProficiencyMode === 'individual',
    ),
    features: featuresFromFormValues(values.features, ctx?.entity?.features),
    resources: classResourcesInputFromForm(values.resources),
    ...(characterCreation ? { characterCreation } : {}),
  }
}

function progressionRowCount(spellcasting?: Spellcasting): number {
  const levels = [
    ...(spellcasting?.cantrips?.map((entry) => entry.level) ?? []),
    ...(spellcasting?.spellsAvailable?.map((entry) => entry.level) ?? []),
  ]
  const maxInData = levels.length > 0 ? Math.max(...levels) : 0
  return Math.max(MAX_CHARACTER_LEVEL, maxInData)
}

export function spellcastingToFormValues(spellcasting: Spellcasting | undefined) {
  const rowCount = progressionRowCount(spellcasting)
  if (!spellcasting) {
    return {
      level: 1,
      description: undefined,
      progression: undefined,
      ability: undefined,
      preparation: undefined,
      progressionTable: emptyProgressionTable(rowCount),
    }
  }

  return {
    level: spellcasting.level,
    description: spellcasting.description,
    progression: spellcasting.progression,
    ability: spellcasting.ability,
    preparation: spellcasting.preparation,
    progressionTable: progressionTableToFormValues(
      spellcasting.cantrips,
      spellcasting.spellsAvailable,
      rowCount,
    ),
  }
}

function hasCompleteSpellcastingCore(
  hasSpellcasting: boolean,
  spellcasting: ClassFormValues['spellcasting'],
): boolean {
  return Boolean(
    hasSpellcasting &&
    spellcasting?.progression &&
    spellcasting?.ability &&
    spellcasting?.preparation,
  )
}

function appendOptionalProgressionTables(
  result: Spellcasting,
  progressionTable: ProgressionTableFormValue | undefined,
): void {
  const { cantrips, spellsAvailable } = progressionTableFromFormValues(progressionTable)
  if (cantrips) result.cantrips = cantrips
  if (spellsAvailable) result.spellsAvailable = spellsAvailable
}

function spellcastingFromFormValues(
  hasSpellcasting: boolean,
  spellcasting: ClassFormValues['spellcasting'],
): Spellcasting | undefined {
  if (!hasCompleteSpellcastingCore(hasSpellcasting, spellcasting) || !spellcasting) {
    return undefined
  }

  const result: Spellcasting = {
    level: spellcasting.level ?? 1,
    progression: spellcasting.progression!,
    ability: spellcasting.ability!,
    preparation: spellcasting.preparation!,
  }
  if (spellcasting.description?.trim()) {
    result.description = spellcasting.description.trim()
  }
  appendOptionalProgressionTables(result, spellcasting.progressionTable)
  return result
}

export const classCreateDefaultValues: Partial<ClassFormValues> = {
  primaryAbilities: ['str'],
  hitDie: 8,
  hasSpellcasting: false,
  weaponProficiencyMode: 'categories',
  spellcasting: {
    level: 1,
    progression: 'full',
    ability: 'int',
    preparation: 'prepared',
    progressionTable: emptyProgressionTable(),
  },
  proficiencies: {
    savingThrows: ['str'],
    armor: [],
    weapons: { categories: [], items: [] },
    tools: { categories: [], items: [] },
    skills: { choose: 2, from: [] },
  },
  features: [
    createSubclassChoiceFeature({ classSlug: 'new-class', className: 'New Class' }),
    ...[4, 8, 12, 16].map((level) => createAsiFeature(level)),
  ].map(featureToFormRow),
  resources: [],
}
