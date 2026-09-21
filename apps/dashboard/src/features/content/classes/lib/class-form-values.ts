import {
  classFeatureSchema,
  createClassDraftInputSchema,
  createClassInputSchema,
  resolveClassAbilityScoreOrder,
  type CharacterClass,
  type ClassFeature,
  type ClassGainProgression,
  type ClassProficiencies,
  type ContentValidationIntent,
  type CreateClassInput,
  type Spellcasting,
} from '@rpg/contracts'

import {
  finalizeContentInput,
  slugForInputParse,
} from '../../lib/forms/registry/content-form-key-helpers'
import type { ContentFormInputCtx } from '../../lib/forms/registry/content-form-registry'
import type { ClassFormValues } from './class-form-fields'
import {
  alignProgressionToModel,
  detectRegularGain,
  materializeRegularGain,
  spellSelectionChangePackageFromPolicy,
  spellSelectionFromForm,
  type SpellSelectionChangePackage,
} from './class-spell-selection-form.lib'
import { createAsiFeature } from './class-asi-features'
import { createSubclassChoiceFeature } from './class-subclass-choice-features'
import { featuresFromFormValues, featureToFormRow } from './class-feature-form-fields'
import { normalizeClassWeaponProficiencies } from './class-weapon-proficiency-helpers'
import {
  startingEquipmentEmptyFormValues,
  startingEquipmentFromFormValues,
} from './character-creation/class-starting-equipment-form-values'
import { characterCreationProficienciesFromFormValues } from './character-creation/class-character-creation-proficiencies-form-values'

export function proficienciesToFormValues(proficiencies: ClassProficiencies) {
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
      items: proficiencies.skills.items ?? [],
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

export function proficienciesFromFormValues(
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
    skills: { categories: [], items: proficiencies.skills.items ?? [] },
  }
}

function proficienciesForInput(
  proficiencies: ClassFormValues['proficiencies'],
  hasSpecificWeapons: boolean,
  validationIntent: ContentValidationIntent,
): ClassProficiencies | undefined {
  const parsed = proficienciesFromFormValues(proficiencies, hasSpecificWeapons)
  if (validationIntent === 'draft' && parsed.savingThrows.length === 0) {
    return undefined
  }
  return parsed
}

function classCharacterCreationInputFromForm(
  values: ClassFormValues,
  entity?: CharacterClass,
): CreateClassInput['characterCreation'] | undefined {
  const startingEquipment = startingEquipmentFromFormValues(
    values.characterCreation?.startingEquipment,
    entity?.characterCreation?.startingEquipment,
  )
  const proficiencies = characterCreationProficienciesFromFormValues(
    values.characterCreation?.proficiencies,
    entity,
  )
  if (!startingEquipment && !proficiencies) return undefined

  const abilityScoreOrder = resolveClassAbilityScoreOrder({
    abilityScoreOrder: values.characterCreation?.abilityScoreOrder,
    primaryAbilities: values.primaryAbilities,
  })

  return {
    ...(startingEquipment ? { startingEquipment } : {}),
    ...(proficiencies ? { proficiencies } : {}),
    abilityScoreOrder: [...abilityScoreOrder],
  }
}

function featuresForInput(
  rows: ClassFormValues['features'],
  existing: readonly ClassFeature[] | undefined,
  validationIntent: ContentValidationIntent,
): ClassFeature[] {
  const features = featuresFromFormValues(rows, existing)
  if (validationIntent === 'publish') return features
  return features.filter((feature) => classFeatureSchema.safeParse(feature).success)
}

type ClassWirePayloadParts = {
  characterCreation: ReturnType<typeof classCharacterCreationInputFromForm>
  proficiencies: ClassProficiencies | undefined
  features: ClassFeature[]
}

function classWirePayloadBase(
  values: ClassFormValues,
  ctx: ContentFormInputCtx<CharacterClass> | undefined,
  parts: ClassWirePayloadParts,
) {
  return {
    slug: slugForInputParse(values.name, ctx),
    name: values.name,
    description: values.description || undefined,
    spellcasting: spellcastingFromFormValues(values),
    features: parts.features,
    ...(parts.characterCreation ? { characterCreation: parts.characterCreation } : {}),
  }
}

function classDraftWirePayload(
  values: ClassFormValues,
  ctx: ContentFormInputCtx<CharacterClass> | undefined,
  parts: ClassWirePayloadParts,
) {
  return {
    ...classWirePayloadBase(values, ctx, parts),
    ...(values.primaryAbilities?.length ? { primaryAbilities: values.primaryAbilities } : {}),
    ...(values.hitDie !== undefined ? { hitDie: values.hitDie } : {}),
    ...(parts.proficiencies ? { proficiencies: parts.proficiencies } : {}),
  }
}

function classPublishWirePayload(
  values: ClassFormValues,
  ctx: ContentFormInputCtx<CharacterClass> | undefined,
  parts: ClassWirePayloadParts,
) {
  return {
    ...classWirePayloadBase(values, ctx, parts),
    primaryAbilities: values.primaryAbilities,
    hitDie: values.hitDie,
    proficiencies: parts.proficiencies!,
  }
}

function classWirePayloadParts(
  values: ClassFormValues,
  ctx: ContentFormInputCtx<CharacterClass> | undefined,
  validationIntent: ContentValidationIntent,
): ClassWirePayloadParts {
  return {
    characterCreation: classCharacterCreationInputFromForm(values, ctx?.entity),
    proficiencies: proficienciesForInput(
      values.proficiencies,
      values.weaponProficiencyMode === 'individual',
      validationIntent,
    ),
    features: featuresForInput(values.features, ctx?.entity?.features, validationIntent),
  }
}

function classWirePayload(
  values: ClassFormValues,
  ctx: ContentFormInputCtx<CharacterClass> | undefined,
  validationIntent: ContentValidationIntent,
) {
  const parts = classWirePayloadParts(values, ctx, validationIntent)
  return validationIntent === 'draft'
    ? classDraftWirePayload(values, ctx, parts)
    : classPublishWirePayload(values, ctx, parts)
}

export function buildClassCreateInput(
  values: ClassFormValues,
  ctx: ContentFormInputCtx<CharacterClass> | undefined,
  validationIntent: ContentValidationIntent = 'publish',
) {
  const schema = validationIntent === 'draft' ? createClassDraftInputSchema : createClassInputSchema
  const input = schema.parse(classWirePayload(values, ctx, validationIntent))
  return finalizeContentInput(input, ctx) as CreateClassInput
}

export function spellcastingToFormValues(
  spellcasting: Spellcasting | undefined,
): ClassFormValues['spellcasting'] {
  if (!spellcasting) {
    return undefined
  }

  return {
    level: spellcasting.level,
    description: spellcasting.description,
    slotProgressionId: spellcasting.slotProgressionId,
    progression: spellcasting.progression,
    ability: spellcasting.ability,
    requiredGear: spellcasting.requiredGear,
    focusKinds: spellcasting.focusKinds,
    recommendedGear: spellcasting.recommendedGear,
  }
}

export function spellSelectionModelToFormValues(
  spellcasting: Spellcasting | undefined,
): ClassFormValues['spellSelectionModel'] {
  return spellcasting?.spellSelection?.model
}

export function spellSelectionChangePackageToFormValues(
  spellcasting: Spellcasting | undefined,
): SpellSelectionChangePackage | undefined {
  if (!spellcasting?.spellSelection) return undefined
  return spellSelectionChangePackageFromPolicy(spellcasting.spellSelection.change)
}

export function spellbookAcquisitionToFormValues(spellcasting: Spellcasting | undefined): {
  irregular: boolean
  starting?: number
  perLevel?: number
  throughLevel?: number
  curve?: ClassGainProgression
} {
  if (spellcasting?.spellSelection?.model !== 'prepareFromLearnedCollection') {
    return { irregular: false }
  }

  const acquisition = spellcasting.spellSelection.acquisition
  const regular = detectRegularGain(acquisition)
  if (regular) {
    return {
      irregular: false,
      starting: regular.starting,
      perLevel: regular.perLevel,
      throughLevel: regular.throughLevel,
    }
  }

  return {
    irregular: true,
    curve: acquisition,
  }
}

function resolveSpellbookAcquisitionFromFormValues(
  values: ClassFormValues,
): ClassGainProgression | undefined {
  if (values.spellSelectionModel !== 'prepareFromLearnedCollection') return undefined

  if (values.spellbookAcquisitionIrregular) {
    return values.spellbookAcquisitionCurve ?? { curve: { rows: [] }, extension: 'zero' }
  }

  const {
    spellbookAcquisitionStarting,
    spellbookAcquisitionPerLevel,
    spellbookAcquisitionThroughLevel,
  } = values
  if (
    spellbookAcquisitionStarting === undefined ||
    spellbookAcquisitionPerLevel === undefined ||
    spellbookAcquisitionThroughLevel === undefined
  ) {
    return { curve: { rows: [] }, extension: 'zero' }
  }

  return materializeRegularGain({
    starting: spellbookAcquisitionStarting,
    perLevel: spellbookAcquisitionPerLevel,
    throughLevel: spellbookAcquisitionThroughLevel,
  })
}

function hasCompleteSpellcastingCore(values: ClassFormValues): boolean {
  return Boolean(
    values.hasSpellcasting &&
    values.spellcasting?.slotProgressionId &&
    values.spellcasting?.ability &&
    values.spellSelectionModel,
  )
}

// fallow-ignore-next-line complexity
function applyOptionalSpellcastingFields(
  result: Spellcasting,
  spellcasting: NonNullable<ClassFormValues['spellcasting']>,
  grantsCantrips: boolean,
): void {
  const alignedProgression = alignProgressionToModel(
    result.spellSelection?.model,
    spellcasting.progression,
  )
  const progression = { ...(alignedProgression ?? {}) }
  if (!grantsCantrips) {
    delete progression.cantrips
  }
  if (Object.keys(progression).length > 0) {
    result.progression = progression
  }
  if (spellcasting.description?.trim()) {
    result.description = spellcasting.description.trim()
  }
  if (spellcasting.requiredGear?.length) {
    result.requiredGear = spellcasting.requiredGear
  }
  if (spellcasting.focusKinds?.length) {
    result.focusKinds = spellcasting.focusKinds
  }
  if (spellcasting.recommendedGear?.length) {
    result.recommendedGear = spellcasting.recommendedGear
  }
}

export function spellcastingFromFormValues(values: ClassFormValues): Spellcasting | undefined {
  const { grantsCantrips, spellcasting, spellSelectionChangePackage } = values
  if (!hasCompleteSpellcastingCore(values) || !spellcasting) {
    return undefined
  }

  const changePackage = spellSelectionChangePackage ?? 'none'
  const acquisition = resolveSpellbookAcquisitionFromFormValues(values)
  const spellSelection = spellSelectionFromForm({
    model: values.spellSelectionModel,
    changePackage,
    acquisition,
  })

  const result: Spellcasting = {
    level: spellcasting.level ?? 1,
    slotProgressionId: spellcasting.slotProgressionId!,
    ability: spellcasting.ability!,
    ...(spellSelection ? { spellSelection } : {}),
  }
  applyOptionalSpellcastingFields(result, spellcasting, grantsCantrips)
  return result
}

export const classCreateDefaultValues: Partial<ClassFormValues> = {
  hasSpellcasting: false,
  grantsCantrips: false,
  spellbookAcquisitionIrregular: false,
  weaponProficiencyMode: 'categories',
  proficiencies: {
    savingThrows: [],
    armor: [],
    weapons: { categories: [], items: [] },
    tools: { categories: [], items: [] },
    skills: { items: [] },
  },
  characterCreation: {
    startingEquipment: startingEquipmentEmptyFormValues(),
    proficiencies: {
      skills: { choose: 2, from: [] },
      tools: { choose: 0, poolSource: 'filtered', poolToolCategories: [] },
    },
    abilityScoreOrder: resolveClassAbilityScoreOrder({
      primaryAbilities: [],
    }),
  },
  features: [
    createSubclassChoiceFeature({ classSlug: 'new-class', className: 'New Class' }),
    ...[4, 8, 12, 16].map((level) => createAsiFeature(level)),
  ].map(featureToFormRow),
}
