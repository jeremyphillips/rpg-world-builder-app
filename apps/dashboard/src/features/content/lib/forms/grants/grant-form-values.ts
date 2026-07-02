import type {
  Ability,
  ArmorCategory,
  ContentGrants,
  ContentProficiencies,
  DamageTypeId,
  FeatCategory,
  InnateSpellKind,
  SenseId,
  SkillId,
} from '@rpg/contracts'

import { type GrantRowForm, type GrantType } from './grant-form-schema'
import type { EquipmentGrantItemForm } from './equipment-grant-form-fields'
import { equipmentGrantFromFormRow, equipmentGrantToFormRow } from './equipment-grant-form-values'

function emptyGrantRow(grantType: GrantType): GrantRowForm {
  return {
    grantType,
    resistances: [],
    damageType: [],
    senseType: undefined,
    senseRange: undefined,
    speedWalkOverride: undefined,
    language: undefined,
    proficiencySkills: [],
    proficiencyArmor: [],
    proficiencyTools: [],
    proficiencyWeapons: [],
    innateSpellAbility: undefined,
    innateSpellEntries: [],
    featCategory: undefined,
    featChoose: 1,
    featAllowAnyQualifying: false,
    featReplaceable: false,
    featRecommendedIds: [],
  }
}

function optionalGrantRow(row: GrantRowForm | undefined): GrantRowForm[] {
  return row ? [row] : []
}

function senseGrantsToRows(senses: ContentGrants['senses']): GrantRowForm[] {
  return (senses ?? []).map((sense) => ({
    ...emptyGrantRow('senses'),
    senseType: sense.type,
    senseRange: sense.range,
  }))
}

function resistancesToRow(resistances: ContentGrants['resistances']): GrantRowForm | undefined {
  if (!resistances?.length) return undefined
  return { ...emptyGrantRow('resistances'), resistances }
}

function damageTypesToRow(damageType: ContentGrants['damageType']): GrantRowForm | undefined {
  if (!damageType?.length) return undefined
  return { ...emptyGrantRow('damageType'), damageType }
}

function speedOverrideToRow(
  speedOverride: ContentGrants['speedOverride'],
): GrantRowForm | undefined {
  if (speedOverride?.walk === undefined) return undefined
  return { ...emptyGrantRow('speedOverride'), speedWalkOverride: speedOverride.walk }
}

function languageGrantsToRows(languages: ContentGrants['languages']): GrantRowForm[] {
  return (languages ?? []).map((language) => ({ ...emptyGrantRow('languages'), language }))
}

function proficienciesToRow(
  proficiencies: ContentGrants['proficiencies'],
): GrantRowForm | undefined {
  if (!proficiencies) return undefined
  const { skills, armor, tools, weapons } = proficiencies
  return {
    ...emptyGrantRow('proficiencies'),
    proficiencySkills: skills ?? [],
    proficiencyArmor: armor ?? [],
    proficiencyTools: tools ?? [],
    proficiencyWeapons: weapons ?? [],
  }
}

function innateSpellsToRow(innateSpells: ContentGrants['innateSpells']): GrantRowForm | undefined {
  if (!innateSpells) return undefined
  return {
    ...emptyGrantRow('innateSpells'),
    innateSpellAbility: innateSpells.ability,
    innateSpellEntries: innateSpells.entries.map((entry) => ({
      level: entry.level,
      spellIds: entry.spellIds,
      kind: entry.kind,
      frequency: entry.frequency,
    })),
  }
}

function featChoiceToRow(featChoice: ContentGrants['featChoice']): GrantRowForm | undefined {
  if (!featChoice) return undefined
  return {
    ...emptyGrantRow('featChoice'),
    featCategory: featChoice.category,
    featChoose: featChoice.choose,
    featAllowAnyQualifying: featChoice.allowAnyQualifying ?? false,
    featReplaceable: featChoice.replaceable ?? false,
    featRecommendedIds: featChoice.recommendedFeatIds ?? [],
  }
}

function equipmentGrantsToRows(equipment: ContentGrants['equipment']): GrantRowForm[] {
  return (equipment ?? []).map((grant) => ({
    grantType: 'equipment',
    ...equipmentGrantToFormRow(grant),
  }))
}

/** Converts a `ContentGrants` object into flat grant-row form values. */
export function grantsToFormRows(grants: ContentGrants | undefined): GrantRowForm[] {
  if (!grants) return []
  return [
    ...senseGrantsToRows(grants.senses),
    ...optionalGrantRow(resistancesToRow(grants.resistances)),
    ...optionalGrantRow(damageTypesToRow(grants.damageType)),
    ...optionalGrantRow(speedOverrideToRow(grants.speedOverride)),
    ...languageGrantsToRows(grants.languages),
    ...optionalGrantRow(proficienciesToRow(grants.proficiencies)),
    ...optionalGrantRow(innateSpellsToRow(grants.innateSpells)),
    ...optionalGrantRow(featChoiceToRow(grants.featChoice)),
    ...equipmentGrantsToRows(grants.equipment),
  ]
}

function applySensesFromRows(result: ContentGrants, rows: GrantRowForm[]): void {
  const senseRows = rows.filter((row) => row.grantType === 'senses' && row.senseType)
  if (!senseRows.length) return
  result.senses = senseRows.map((row) => ({
    type: row.senseType as SenseId,
    range: row.senseRange ?? 60,
  }))
}

function applyResistancesFromRows(result: ContentGrants, rows: GrantRowForm[]): void {
  const row = rows.find((r) => r.grantType === 'resistances')
  if (!row?.resistances?.length) return
  result.resistances = row.resistances as DamageTypeId[]
}

function applyDamageTypesFromRows(result: ContentGrants, rows: GrantRowForm[]): void {
  const row = rows.find((r) => r.grantType === 'damageType')
  if (!row?.damageType?.length) return
  result.damageType = row.damageType as DamageTypeId[]
}

function applySpeedOverrideFromRows(result: ContentGrants, rows: GrantRowForm[]): void {
  const row = rows.find((r) => r.grantType === 'speedOverride')
  if (row?.speedWalkOverride === undefined) return
  result.speedOverride = { walk: row.speedWalkOverride }
}

function applyLanguagesFromRows(result: ContentGrants, rows: GrantRowForm[]): void {
  const languageRows = rows.filter((r) => r.grantType === 'languages' && r.language)
  if (!languageRows.length) return
  result.languages = languageRows.map((r) => r.language!)
}

function skillArmorProficiencies(row: GrantRowForm): ContentProficiencies {
  return Object.assign(
    {},
    row.proficiencySkills?.length ? { skills: row.proficiencySkills as SkillId[] } : {},
    row.proficiencyArmor?.length ? { armor: row.proficiencyArmor as ArmorCategory[] } : {},
  )
}

function toolWeaponProficiencies(row: GrantRowForm): ContentProficiencies {
  return Object.assign(
    {},
    row.proficiencyTools?.length ? { tools: row.proficiencyTools } : {},
    row.proficiencyWeapons?.length ? { weapons: row.proficiencyWeapons } : {},
  )
}

function proficienciesFromRow(row: GrantRowForm): ContentProficiencies | undefined {
  const prof = { ...skillArmorProficiencies(row), ...toolWeaponProficiencies(row) }
  return Object.keys(prof).length ? prof : undefined
}

function applyProficienciesFromRows(result: ContentGrants, rows: GrantRowForm[]): void {
  const row = rows.find((r) => r.grantType === 'proficiencies')
  if (!row) return
  const prof = proficienciesFromRow(row)
  if (prof) result.proficiencies = prof
}

function applyInnateSpellsFromRows(result: ContentGrants, rows: GrantRowForm[]): void {
  const row = rows.find((r) => r.grantType === 'innateSpells')
  if (!row?.innateSpellAbility || !row.innateSpellEntries?.length) return

  const entries = row.innateSpellEntries
    .map((entry) => {
      if (!entry.spellIds.length) return undefined
      return {
        level: entry.level,
        spellIds: entry.spellIds,
        kind: (entry.kind ?? 'free_cast') as InnateSpellKind,
        frequency: entry.kind === 'always_prepared' ? undefined : entry.frequency,
      }
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== undefined)

  if (!entries.length) return
  result.innateSpells = {
    ability: row.innateSpellAbility as Ability,
    entries,
  }
}

function applyFeatChoiceFromRows(result: ContentGrants, rows: GrantRowForm[]): void {
  const row = rows.find((r) => r.grantType === 'featChoice')
  if (!row?.featCategory) return

  const choose = row.featChoose ?? 1
  const featChoice: ContentGrants['featChoice'] = {
    category: row.featCategory as FeatCategory,
    choose,
  }
  if (row.featAllowAnyQualifying) {
    featChoice.allowAnyQualifying = true
  }
  if (row.featReplaceable) {
    featChoice.replaceable = true
  }
  if (row.featRecommendedIds?.length) {
    featChoice.recommendedFeatIds = row.featRecommendedIds
  }
  result.featChoice = featChoice
}

function applyEquipmentFromRows(result: ContentGrants, rows: GrantRowForm[]): void {
  const equipmentRows = rows.filter((row) => row.grantType === 'equipment' && row.itemKind)
  if (!equipmentRows.length) return

  result.equipment = equipmentRows.map((row) =>
    equipmentGrantFromFormRow(row as EquipmentGrantItemForm),
  )
}

/** Folds grant-row form values back into a `ContentGrants` object. */
export function formRowsToGrants(rows: GrantRowForm[]): ContentGrants | undefined {
  if (!rows.length) return undefined

  const result: ContentGrants = {}
  applySensesFromRows(result, rows)
  applyResistancesFromRows(result, rows)
  applyDamageTypesFromRows(result, rows)
  applySpeedOverrideFromRows(result, rows)
  applyLanguagesFromRows(result, rows)
  applyProficienciesFromRows(result, rows)
  applyInnateSpellsFromRows(result, rows)
  applyFeatChoiceFromRows(result, rows)
  applyEquipmentFromRows(result, rows)

  return Object.keys(result).length ? result : undefined
}
