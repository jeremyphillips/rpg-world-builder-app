import { z } from 'zod'
import {
  ABILITY_ENTRIES,
  ABILITY_IDS,
  ARMOR_CATEGORIES,
  ARMOR_CATEGORY_ENTRIES,
  DAMAGE_TYPE_IDS,
  DAMAGE_TYPE_ENTRIES,
  INNATE_SPELL_KINDS,
  SENSE_RANGES,
  SENSE_TYPES,
  SENSE_ENTRIES,
  SKILL_IDS,
  SKILLS,
  STANDARD_SPEEDS,
  USAGE_FREQUENCIES,
  USAGE_FREQUENCY_ENTRIES,
  abilitySchema,
  armorCategorySchema,
  damageTypeSchema,
  innateSpellKindSchema,
  levelSchema,
  senseTypeSchema,
  skillSchema,
  usageFrequencySchema,
  type Ability,
  type ArmorCategory,
  type ContentGrants,
  type ContentProficiencies,
  type DamageType,
  type InnateSpellKind,
  type SenseType,
  type SkillId,
  type UsageFrequency,
} from '@rpg/contracts'
import { toOptions, type FieldOption, type FieldVisibility, type FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from './content-form-registry'
import { titleCase } from './title-case'

// ---------------------------------------------------------------------------
// Grant type vocab
// ---------------------------------------------------------------------------

const BASE_GRANT_TYPES = [
  'resistances',
  'senses',
  'damageType',
  'speedOverride',
  'proficiencies',
  'languages',
] as const

export const CLASS_GRANT_TYPES = [...BASE_GRANT_TYPES, 'innateSpells'] as const

export const SPECIES_GRANT_TYPES = [...CLASS_GRANT_TYPES] as const

type BaseGrantType = (typeof BASE_GRANT_TYPES)[number]
type ClassGrantType = (typeof CLASS_GRANT_TYPES)[number]

const BASE_GRANT_TYPE_LABELS: Record<BaseGrantType, string> = {
  resistances: 'Damage resistances',
  senses: 'Special sense',
  damageType: 'Damage type',
  speedOverride: 'Speed override',
  proficiencies: 'Proficiencies',
  languages: 'Language',
}

const CLASS_GRANT_TYPE_LABELS: Record<ClassGrantType, string> = {
  ...BASE_GRANT_TYPE_LABELS,
  innateSpells: 'Innate spells',
}

// ---------------------------------------------------------------------------
// Shared option lists
// ---------------------------------------------------------------------------

const speedWalkOptions: FieldOption[] = STANDARD_SPEEDS.map((s) => ({
  value: String(s),
  label: `${s} ft.`,
}))

const senseTypeOptions = toOptions(
  SENSE_TYPES,
  Object.fromEntries(SENSE_TYPES.map((t) => [t, SENSE_ENTRIES[t].label])) as Record<
    (typeof SENSE_TYPES)[number],
    string
  >,
)

const senseRangeOptions: FieldOption[] = SENSE_RANGES.map((r) => ({
  value: String(r),
  label: `${r} ft.`,
}))

const damageTypeOptions = toOptions(
  DAMAGE_TYPE_IDS,
  Object.fromEntries(DAMAGE_TYPE_IDS.map((t) => [t, DAMAGE_TYPE_ENTRIES[t].label])) as Record<
    (typeof DAMAGE_TYPE_IDS)[number],
    string
  >,
)

const skillOptions = toOptions(SKILL_IDS, SKILLS as Record<(typeof SKILL_IDS)[number], string>)

const armorCategoryOptions = toOptions(
  ARMOR_CATEGORIES,
  Object.fromEntries(ARMOR_CATEGORIES.map((c) => [c, ARMOR_CATEGORY_ENTRIES[c].label])) as Record<
    (typeof ARMOR_CATEGORIES)[number],
    string
  >,
)

const abilityOptions = toOptions(
  ABILITY_IDS,
  Object.fromEntries(ABILITY_IDS.map((id) => [id, ABILITY_ENTRIES[id].label])) as Record<
    (typeof ABILITY_IDS)[number],
    string
  >,
)

const innateSpellKindOptions = toOptions(
  INNATE_SPELL_KINDS,
  Object.fromEntries(
    INNATE_SPELL_KINDS.map((k) => [k, titleCase(k.replaceAll('_', ' '))]),
  ) as Record<(typeof INNATE_SPELL_KINDS)[number], string>,
)

const usageFrequencyOptions = toOptions(
  USAGE_FREQUENCIES,
  Object.fromEntries(USAGE_FREQUENCIES.map((f) => [f, USAGE_FREQUENCY_ENTRIES[f].label])) as Record<
    UsageFrequency,
    string
  >,
)

// ---------------------------------------------------------------------------
// Form schema
// ---------------------------------------------------------------------------

const innateSpellEntryFormSchema = z.object({
  level: z.coerce.number().pipe(levelSchema),
  spellIds: z.array(z.string()).min(1),
  kind: innateSpellKindSchema.optional(),
  frequency: usageFrequencySchema.optional(),
})

export const grantRowFormSchema = z.object({
  grantType: z.enum(CLASS_GRANT_TYPES),
  resistances: z.array(damageTypeSchema).optional(),
  damageType: z.array(damageTypeSchema).optional(),
  senseType: senseTypeSchema.optional(),
  senseRange: z.coerce.number().int().min(0).optional(),
  speedWalkOverride: z.coerce.number().int().min(0).optional(),
  language: z.string().optional(),
  proficiencySkills: z.array(skillSchema).optional(),
  proficiencyArmor: z.array(armorCategorySchema).optional(),
  proficiencyTools: z.array(z.string()).optional(),
  proficiencyWeapons: z.array(z.string()).optional(),
  innateSpellAbility: abilitySchema.optional(),
  innateSpellEntries: z.array(innateSpellEntryFormSchema).optional(),
})

export type GrantRowForm = z.infer<typeof grantRowFormSchema>

// ---------------------------------------------------------------------------
// Conditional visibility
// ---------------------------------------------------------------------------

function visibleFor<T extends string>(value: T): FieldVisibility {
  return {
    dependsOn: ['grantType'],
    visibleWhen: (watched) => watched['grantType'] === value,
  }
}

function grantTypeOptionsFor<T extends string>(
  grantTypes: readonly T[],
  labels: Record<T, string>,
): FieldOption[] {
  return grantTypes.map((t) => ({ value: t, label: labels[t] }))
}

// ---------------------------------------------------------------------------
// Field builders
// ---------------------------------------------------------------------------

export function formatInnateSpellEntryTitle(
  spellIds: string[] | undefined,
  spellOptions: FieldOption[],
  index: number,
): string {
  if (!spellIds?.length) return `Entry ${index + 1}`
  const labels = spellIds.map(
    (id) => spellOptions.find((option) => option.value === id)?.label ?? id,
  )
  return labels.length <= 2 ? labels.join(', ') : `${labels.length} spells`
}

export function grantItemFields<T extends string>(
  grantTypes: readonly T[],
  labels: Record<T, string>,
  ctx: ContentFormCtx,
): FormItem[] {
  const spellOptions = ctx.options?.spells ?? []
  const toolOptions = ctx.options?.tools ?? []
  const weaponOptions = ctx.options?.weapons ?? []

  return [
    {
      type: 'select',
      name: 'grantType',
      label: 'Grant type',
      options: grantTypeOptionsFor(grantTypes, labels),
      required: true,
    },
    {
      type: 'chips',
      name: 'resistances',
      label: 'Damage types',
      options: damageTypeOptions,
      visibility: visibleFor('resistances'),
    },
    {
      type: 'chips',
      name: 'damageType',
      label: 'Damage types',
      options: damageTypeOptions,
      visibility: visibleFor('damageType'),
    },
    {
      type: 'select',
      name: 'senseType',
      label: 'Sense type',
      options: senseTypeOptions,
      visibility: visibleFor('senses'),
    },
    {
      type: 'select',
      name: 'senseRange',
      label: 'Range',
      options: senseRangeOptions,
      visibility: visibleFor('senses'),
    },
    {
      type: 'select',
      name: 'speedWalkOverride',
      label: 'Walk speed (ft.)',
      options: speedWalkOptions,
      visibility: visibleFor('speedOverride'),
    },
    {
      type: 'text',
      name: 'language',
      label: 'Language',
      placeholder: 'e.g. Common',
      visibility: visibleFor('languages'),
    },
    {
      type: 'chips',
      name: 'proficiencySkills',
      label: 'Skills',
      options: skillOptions,
      visibility: visibleFor('proficiencies'),
    },
    {
      type: 'chips',
      name: 'proficiencyArmor',
      label: 'Armor',
      options: armorCategoryOptions,
      visibility: visibleFor('proficiencies'),
    },
    {
      type: 'combobox',
      name: 'proficiencyTools',
      label: 'Tools',
      multiple: true,
      options: toolOptions,
      placeholder: 'Choose tools…',
      visibility: visibleFor('proficiencies'),
    },
    {
      type: 'combobox',
      name: 'proficiencyWeapons',
      label: 'Weapons',
      multiple: true,
      options: weaponOptions,
      placeholder: 'Choose weapons…',
      visibility: visibleFor('proficiencies'),
    },
    {
      type: 'select',
      name: 'innateSpellAbility',
      label: 'Spellcasting ability',
      options: abilityOptions,
      visibility: visibleFor('innateSpells'),
    },
    {
      kind: 'array',
      name: 'innateSpellEntries',
      legend: 'Innate spell entries',
      addLabel: 'Add entry',
      visibility: visibleFor('innateSpells'),
      itemTitle: (values, index) =>
        formatInnateSpellEntryTitle(
          values['spellIds'] as string[] | undefined,
          spellOptions,
          index,
        ),
      fields: [
        {
          type: 'select',
          name: 'level',
          label: 'Character level',
          options: levelOptions(),
          required: true,
        },
        {
          type: 'combobox',
          name: 'spellIds',
          label: 'Spells',
          multiple: true,
          options: spellOptions,
          placeholder: 'Choose spells…',
          required: true,
        },
        {
          type: 'select',
          name: 'kind',
          label: 'Kind',
          options: innateSpellKindOptions,
          defaultValue: 'free_cast',
        },
        {
          type: 'select',
          name: 'frequency',
          label: 'Frequency',
          options: usageFrequencyOptions,
          visibility: {
            dependsOn: ['kind'],
            visibleWhen: (watched) =>
              watched['kind'] === undefined || watched['kind'] === 'free_cast',
          },
        },
      ],
    },
  ]
}

export function grantArrayFields<T extends string>(
  grantTypes: readonly T[],
  labels: Record<T, string>,
  ctx: ContentFormCtx,
): FormItem[] {
  return [
    {
      kind: 'array',
      name: 'grants',
      legend: 'Grants',
      addLabel: 'Add grant',
      itemTitle: (values, index) => {
        const type = values['grantType'] as T | undefined
        return type ? labels[type] : `Grant ${index + 1}`
      },
      fields: grantItemFields(grantTypes, labels, ctx),
    },
  ]
}

function levelOptions(): FieldOption[] {
  return Array.from({ length: 20 }, (_, index) => {
    const level = index + 1
    return { value: String(level), label: `Level ${level}` }
  })
}

// ---------------------------------------------------------------------------
// Grant conversion helpers (ContentGrants ↔ GrantRowForm[])
// ---------------------------------------------------------------------------

function emptyGrantRow(grantType: ClassGrantType): GrantRowForm {
  return {
    grantType,
    resistances: [],
    damageType: [],
    senseType: undefined,
    senseRange: undefined,
    speedWalkOverride: undefined,
    language: '',
    proficiencySkills: [],
    proficiencyArmor: [],
    proficiencyTools: [],
    proficiencyWeapons: [],
    innateSpellAbility: undefined,
    innateSpellEntries: [],
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
  ]
}

function applySensesFromRows(result: ContentGrants, rows: GrantRowForm[]): void {
  const senseRows = rows.filter((row) => row.grantType === 'senses' && row.senseType)
  if (!senseRows.length) return
  result.senses = senseRows.map((row) => ({
    type: row.senseType as SenseType,
    range: row.senseRange ?? 60,
  }))
}

function applyResistancesFromRows(result: ContentGrants, rows: GrantRowForm[]): void {
  const row = rows.find((r) => r.grantType === 'resistances')
  if (!row?.resistances?.length) return
  result.resistances = row.resistances as DamageType[]
}

function applyDamageTypesFromRows(result: ContentGrants, rows: GrantRowForm[]): void {
  const row = rows.find((r) => r.grantType === 'damageType')
  if (!row?.damageType?.length) return
  result.damageType = row.damageType as DamageType[]
}

function applySpeedOverrideFromRows(result: ContentGrants, rows: GrantRowForm[]): void {
  const row = rows.find((r) => r.grantType === 'speedOverride')
  if (row?.speedWalkOverride === undefined) return
  result.speedOverride = { walk: row.speedWalkOverride }
}

function applyLanguagesFromRows(result: ContentGrants, rows: GrantRowForm[]): void {
  const languageRows = rows.filter((r) => r.grantType === 'languages' && r.language?.trim())
  if (!languageRows.length) return
  result.languages = languageRows.map((r) => r.language!.trim())
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

  return Object.keys(result).length ? result : undefined
}

export { CLASS_GRANT_TYPE_LABELS as SPECIES_GRANT_TYPE_LABELS, CLASS_GRANT_TYPE_LABELS }
