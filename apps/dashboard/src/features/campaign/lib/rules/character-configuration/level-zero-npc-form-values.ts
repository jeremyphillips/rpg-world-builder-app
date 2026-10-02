import type {
  ArmorProficiencyGrantSet,
  CampaignLevelZeroNpcsPatch,
  CharacterWealthGrant,
  LevelZeroNpcWealthTiers,
  ResolvedCampaignCharacterCreationPatch,
  WeaponProficiencyGrantSet,
} from '@rpg/contracts'
import {
  DEFAULT_LEVEL_ZERO_BASE_HIT_DIE,
  DEFAULT_LEVEL_ZERO_LANGUAGE_PROFICIENCIES,
  DEFAULT_LEVEL_ZERO_NPC_WEALTH_TIERS,
  DEFAULT_LEVEL_ZERO_NPCS_ENABLED,
  DEFAULT_LEVEL_ZERO_PROFICIENCY_BONUS,
  DEFAULT_LEVEL_ZERO_RETAIN_SPECIES_LANGUAGES,
  DEFAULT_LEVEL_ZERO_RETAIN_SPECIES_TRAITS,
  DEFAULT_STANDARD_ARRAY,
  NPC_WEALTH_TIER_IDS,
  WEALTH_GRANT_DENOMINATIONS,
  characterWealthGrantsEqual,
  normalizeWealthTierGrant,
  type Currency,
  type NpcWealthTierId,
} from '@rpg/contracts'

import {
  buildStandardArrayPatchInput,
  mapStandardArrayToFormValues,
  parseStandardArrayFormValues,
} from '@/lib/forms/standard-array-form-values'

import type { WealthGrantMoneyForm } from '@/lib/forms/wealth-grant-form-fields'

import type { LevelZeroNpcsFormValues } from './level-zero-npc-form-fields'
import { LEVEL_ZERO_WEALTH_TIER_FIELD_PATHS } from './level-zero-npc-form-fields'
import {
  xorGrantSetFromForm,
  xorGrantSetModeFromGrantSet,
} from './xor-proficiency-grant-set-form-fields'

export function mapLevelZeroNpcsToFormValues(
  levelZeroNpcs: ResolvedCampaignCharacterCreationPatch['levelZeroNpcs'],
): LevelZeroNpcsFormValues {
  return {
    levelZeroNpcsEnabled: levelZeroNpcs.enabled,
    levelZeroBaseHitDie: levelZeroNpcs.baseHitDie,
    levelZeroProficiencyBonus: levelZeroNpcs.proficiencyBonus,
    levelZeroRetainSpeciesTraits: levelZeroNpcs.retainSpeciesTraits,
    levelZeroArmorGrantMode: xorGrantSetModeFromGrantSet(levelZeroNpcs.armorProficiencies),
    levelZeroArmorProficiencies: {
      categories: [...levelZeroNpcs.armorProficiencies.categories],
      items: [...levelZeroNpcs.armorProficiencies.items],
    },
    levelZeroWeaponGrantMode: xorGrantSetModeFromGrantSet(levelZeroNpcs.weaponProficiencies),
    levelZeroWeaponProficiencies: {
      categories: [...levelZeroNpcs.weaponProficiencies.categories],
      items: [...levelZeroNpcs.weaponProficiencies.items],
    },
    levelZeroLanguageProficiencies: {
      items: [...levelZeroNpcs.languageProficiencies.items],
    },
    levelZeroRetainSpeciesLanguages: levelZeroNpcs.retainSpeciesLanguages,
    levelZeroWealthTierPoor: wealthTierGrantMoneyToForm(levelZeroNpcs.wealthTiers.poor),
    levelZeroWealthTierModest: wealthTierGrantMoneyToForm(levelZeroNpcs.wealthTiers.modest),
    levelZeroWealthTierComfortable: wealthTierGrantMoneyToForm(
      levelZeroNpcs.wealthTiers.comfortable,
    ),
    levelZeroWealthTierWealthy: wealthTierGrantMoneyToForm(levelZeroNpcs.wealthTiers.wealthy),
    levelZeroStandardArray: mapStandardArrayToFormValues(levelZeroNpcs.standardArray),
  }
}

export function levelZeroNpcsDefaultFormValues(): LevelZeroNpcsFormValues {
  return mapLevelZeroNpcsToFormValues({
    enabled: DEFAULT_LEVEL_ZERO_NPCS_ENABLED,
    baseHitDie: DEFAULT_LEVEL_ZERO_BASE_HIT_DIE,
    proficiencyBonus: DEFAULT_LEVEL_ZERO_PROFICIENCY_BONUS,
    retainSpeciesTraits: DEFAULT_LEVEL_ZERO_RETAIN_SPECIES_TRAITS,
    armorProficiencies: { categories: [], items: [] },
    weaponProficiencies: { categories: [], items: [] },
    languageProficiencies: {
      items: [...DEFAULT_LEVEL_ZERO_LANGUAGE_PROFICIENCIES.items],
      categories: [],
    },
    retainSpeciesLanguages: DEFAULT_LEVEL_ZERO_RETAIN_SPECIES_LANGUAGES,
    wealthTiers: {
      poor: { ...DEFAULT_LEVEL_ZERO_NPC_WEALTH_TIERS.poor },
      modest: { ...DEFAULT_LEVEL_ZERO_NPC_WEALTH_TIERS.modest },
      comfortable: { ...DEFAULT_LEVEL_ZERO_NPC_WEALTH_TIERS.comfortable },
      wealthy: { ...DEFAULT_LEVEL_ZERO_NPC_WEALTH_TIERS.wealthy },
    },
    standardArray: [...DEFAULT_STANDARD_ARRAY],
  })
}

function buildLevelZeroArmorProficienciesPatch(
  values: LevelZeroNpcsFormValues,
): ArmorProficiencyGrantSet {
  return xorGrantSetFromForm(
    values.levelZeroArmorGrantMode,
    values.levelZeroArmorProficiencies.categories,
    values.levelZeroArmorProficiencies.items,
  ) as ArmorProficiencyGrantSet
}

function buildLevelZeroWeaponProficienciesPatch(
  values: LevelZeroNpcsFormValues,
): WeaponProficiencyGrantSet {
  return xorGrantSetFromForm(
    values.levelZeroWeaponGrantMode,
    values.levelZeroWeaponProficiencies.categories,
    values.levelZeroWeaponProficiencies.items,
  ) as WeaponProficiencyGrantSet
}

export function wealthTierGrantMoneyToForm(
  grant: CharacterWealthGrant | undefined,
): WealthGrantMoneyForm {
  if (!grant) return { amount: 0, currency: 'gp' }

  for (const denomination of WEALTH_GRANT_DENOMINATIONS) {
    const value = grant[denomination]
    if (value !== undefined) {
      return { amount: value, currency: denomination as Currency }
    }
  }

  return { amount: 0, currency: 'gp' }
}

export function wealthTierGrantMoneyFromForm(
  wealth: WealthGrantMoneyForm | undefined,
): CharacterWealthGrant {
  if (!wealth) return { gp: 0 }
  return normalizeWealthTierGrant({ [wealth.currency]: wealth.amount })
}

function wealthGrantFromTierFormField(
  values: LevelZeroNpcsFormValues,
  tierId: NpcWealthTierId,
): CharacterWealthGrant {
  const path = LEVEL_ZERO_WEALTH_TIER_FIELD_PATHS[tierId]
  const formValue = values[path as keyof LevelZeroNpcsFormValues] as
    | WealthGrantMoneyForm
    | undefined
  return wealthTierGrantMoneyFromForm(formValue)
}

function buildLevelZeroWealthTiersPatchInput(
  values: LevelZeroNpcsFormValues,
  options: { sparse: boolean },
): LevelZeroNpcWealthTiers | undefined {
  const tiers: LevelZeroNpcWealthTiers = {}
  for (const tierId of NPC_WEALTH_TIER_IDS) {
    const resolved = wealthGrantFromTierFormField(values, tierId)
    if (options.sparse) {
      if (!characterWealthGrantsEqual(resolved, DEFAULT_LEVEL_ZERO_NPC_WEALTH_TIERS[tierId])) {
        tiers[tierId] = resolved
      }
      continue
    }
    tiers[tierId] = resolved
  }
  return Object.keys(tiers).length > 0 ? tiers : undefined
}

function buildFullLevelZeroNpcsPatchInput(
  values: LevelZeroNpcsFormValues,
): CampaignLevelZeroNpcsPatch {
  return {
    enabled: values.levelZeroNpcsEnabled,
    baseHitDie: values.levelZeroBaseHitDie,
    proficiencyBonus: values.levelZeroProficiencyBonus,
    retainSpeciesTraits: values.levelZeroRetainSpeciesTraits,
    armorProficiencies: buildLevelZeroArmorProficienciesPatch(values),
    weaponProficiencies: buildLevelZeroWeaponProficienciesPatch(values),
    languageProficiencies: {
      items: [...values.levelZeroLanguageProficiencies.items],
      categories: [],
    },
    retainSpeciesLanguages: values.levelZeroRetainSpeciesLanguages,
    wealthTiers: Object.fromEntries(
      NPC_WEALTH_TIER_IDS.map((tierId) => [tierId, wealthGrantFromTierFormField(values, tierId)]),
    ) as LevelZeroNpcWealthTiers,
    standardArray: parseStandardArrayFormValues(values.levelZeroStandardArray),
  }
}

function hasNonEmptyGrantSet(grant: {
  categories: readonly string[]
  items: readonly string[]
}): boolean {
  return grant.categories.length > 0 || grant.items.length > 0
}

function languageProficienciesDifferFromDefault(items: readonly string[]): boolean {
  return (
    items.length !== DEFAULT_LEVEL_ZERO_LANGUAGE_PROFICIENCIES.items.length ||
    items.some((item, index) => item !== DEFAULT_LEVEL_ZERO_LANGUAGE_PROFICIENCIES.items[index])
  )
}

function applyLevelZeroScalarSparsePatches(
  patch: CampaignLevelZeroNpcsPatch,
  values: LevelZeroNpcsFormValues,
): void {
  if (values.levelZeroNpcsEnabled !== DEFAULT_LEVEL_ZERO_NPCS_ENABLED) {
    patch.enabled = values.levelZeroNpcsEnabled
  }
  if (values.levelZeroBaseHitDie !== DEFAULT_LEVEL_ZERO_BASE_HIT_DIE) {
    patch.baseHitDie = values.levelZeroBaseHitDie
  }
  if (values.levelZeroProficiencyBonus !== DEFAULT_LEVEL_ZERO_PROFICIENCY_BONUS) {
    patch.proficiencyBonus = values.levelZeroProficiencyBonus
  }
  if (values.levelZeroRetainSpeciesTraits !== DEFAULT_LEVEL_ZERO_RETAIN_SPECIES_TRAITS) {
    patch.retainSpeciesTraits = values.levelZeroRetainSpeciesTraits
  }
  if (values.levelZeroRetainSpeciesLanguages !== DEFAULT_LEVEL_ZERO_RETAIN_SPECIES_LANGUAGES) {
    patch.retainSpeciesLanguages = values.levelZeroRetainSpeciesLanguages
  }
}

function buildSparseLevelZeroNpcsPatchInput(
  values: LevelZeroNpcsFormValues,
): CampaignLevelZeroNpcsPatch | undefined {
  const patch: CampaignLevelZeroNpcsPatch = {}

  applyLevelZeroScalarSparsePatches(patch, values)

  const armor = buildLevelZeroArmorProficienciesPatch(values)
  if (hasNonEmptyGrantSet(armor)) {
    patch.armorProficiencies = armor
  }

  const weapons = buildLevelZeroWeaponProficienciesPatch(values)
  if (hasNonEmptyGrantSet(weapons)) {
    patch.weaponProficiencies = weapons
  }

  if (languageProficienciesDifferFromDefault(values.levelZeroLanguageProficiencies.items)) {
    patch.languageProficiencies = {
      items: [...values.levelZeroLanguageProficiencies.items],
      categories: [],
    }
  }

  const wealthTiers = buildLevelZeroWealthTiersPatchInput(values, { sparse: true })
  if (wealthTiers) {
    patch.wealthTiers = wealthTiers
  }

  const standardArray = buildStandardArrayPatchInput(
    values.levelZeroStandardArray,
    DEFAULT_STANDARD_ARRAY,
  )
  if (standardArray) {
    patch.standardArray = standardArray
  }

  return Object.keys(patch).length > 0 ? patch : undefined
}

/** Maps flat level 0 NPC form fields to the nested patch shape. */
type LevelZeroWealthTierFormKeys =
  | 'levelZeroWealthTierPoor'
  | 'levelZeroWealthTierModest'
  | 'levelZeroWealthTierComfortable'
  | 'levelZeroWealthTierWealthy'

type LevelZeroNpcsPatchFormValues = Omit<LevelZeroNpcsFormValues, LevelZeroWealthTierFormKeys> & {
  levelZeroWealthTierPoor?: WealthGrantMoneyForm
  levelZeroWealthTierModest?: WealthGrantMoneyForm
  levelZeroWealthTierComfortable?: WealthGrantMoneyForm
  levelZeroWealthTierWealthy?: WealthGrantMoneyForm
}

function withLevelZeroWealthTierDefaults(
  values: LevelZeroNpcsPatchFormValues,
): LevelZeroNpcsFormValues {
  const defaults = levelZeroNpcsDefaultFormValues()
  return {
    ...defaults,
    ...values,
    levelZeroWealthTierPoor: values.levelZeroWealthTierPoor ?? defaults.levelZeroWealthTierPoor,
    levelZeroWealthTierModest:
      values.levelZeroWealthTierModest ?? defaults.levelZeroWealthTierModest,
    levelZeroWealthTierComfortable:
      values.levelZeroWealthTierComfortable ?? defaults.levelZeroWealthTierComfortable,
    levelZeroWealthTierWealthy:
      values.levelZeroWealthTierWealthy ?? defaults.levelZeroWealthTierWealthy,
  }
}

export function buildLevelZeroNpcsPatchInput(
  values: LevelZeroNpcsPatchFormValues,
  options: { includeDefaultLevelZeroNpcs?: boolean } = {},
): CampaignLevelZeroNpcsPatch | undefined {
  const normalized = withLevelZeroWealthTierDefaults(values)
  if (options.includeDefaultLevelZeroNpcs) {
    return buildFullLevelZeroNpcsPatchInput(normalized)
  }

  return buildSparseLevelZeroNpcsPatchInput(normalized)
}
