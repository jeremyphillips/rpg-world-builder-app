import { z } from 'zod'
import {
  ARMOR_CATEGORIES,
  ARMOR_CATEGORY_ENTRIES,
  CREATURE_SIZES,
  CREATURE_SIZE_ENTRIES,
  CREATURE_TYPES,
  CREATURE_TYPE_ENTRIES,
  DAMAGE_TYPE_IDS,
  DAMAGE_TYPE_ENTRIES,
  SENSE_RANGES,
  SENSE_TYPES,
  SENSE_ENTRIES,
  SKILL_IDS,
  SKILLS,
  SPECIES_CHOICE_KINDS,
  SPECIES_CHOICE_KIND_LABELS,
  STANDARD_SPEEDS,
  armorCategorySchema,
  creatureSizeSchema,
  creatureTypeSchema,
  damageTypeSchema,
  senseTypeSchema,
  skillSchema,
  speciesChoiceKindSchema,
  slugSchema,
  type ArmorCategory,
  type ContentGrants,
  type ContentProficiencies,
  type ContentTrait,
  type CreateSpeciesInput,
  type DamageType,
  type SenseType,
  type SkillId,
  type Species,
  type SpeciesChoiceGroup,
} from '@rpg/contracts'
import { toOptions, type FieldOption, type FieldVisibility, type FormItem } from '@rpg/ui/form'

import { useSpecies, speciesQueryKey } from '../hooks/use-species'
import { contentFormRegistry, type ContentFormDef } from '../../lib/content-form-registry'

// ---------------------------------------------------------------------------
// Vocab option lists — derived once, reused in buildFields and conditionals
// ---------------------------------------------------------------------------

const creatureTypeOptions = toOptions(
  CREATURE_TYPES,
  Object.fromEntries(CREATURE_TYPES.map((t) => [t, CREATURE_TYPE_ENTRIES[t].label])) as Record<
    (typeof CREATURE_TYPES)[number],
    string
  >,
)

const creatureSizeOptions = toOptions(
  CREATURE_SIZES,
  Object.fromEntries(CREATURE_SIZES.map((s) => [s, CREATURE_SIZE_ENTRIES[s].label])) as Record<
    (typeof CREATURE_SIZES)[number],
    string
  >,
)

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

// ---------------------------------------------------------------------------
// Grant type select options
// ---------------------------------------------------------------------------

const GRANT_TYPES = [
  'resistances',
  'senses',
  'damageType',
  'speedOverride',
  'proficiencies',
  'languages',
] as const
type GrantType = (typeof GRANT_TYPES)[number]

const GRANT_TYPE_LABELS: Record<GrantType, string> = {
  resistances: 'Damage resistances',
  senses: 'Special sense',
  damageType: 'Damage type',
  speedOverride: 'Speed override',
  proficiencies: 'Proficiencies',
  languages: 'Language',
}

const grantTypeOptions: FieldOption[] = GRANT_TYPES.map((t) => ({
  value: t,
  label: GRANT_TYPE_LABELS[t],
}))

const choiceKindOptions = toOptions(SPECIES_CHOICE_KINDS, SPECIES_CHOICE_KIND_LABELS)

// ---------------------------------------------------------------------------
// Form schema
//
// NOTE on conditional grant fields: they are all `optional()` because the
// form uses `shouldUnregister: true`. When a conditional field unmounts,
// RHF clears it from the payload, so Zod only sees `undefined` — which the
// `.optional()` accepts. The resolver's `omitHidden` only strips top-level
// keys; nested optionals handle item-scoped conditional visibility.
// ---------------------------------------------------------------------------

const grantRowFormSchema = z.object({
  grantType: z.enum(GRANT_TYPES),
  // 'resistances'
  resistances: z.array(damageTypeSchema).optional(),
  // 'damageType'
  damageType: z.array(damageTypeSchema).optional(),
  // 'senses' — one sense per grant row
  senseType: senseTypeSchema.optional(),
  senseRange: z.coerce.number().int().min(0).optional(),
  // 'speedOverride'
  speedWalkOverride: z.coerce.number().int().min(0).optional(),
  // 'languages' — one language string per grant row
  language: z.string().optional(),
  // 'proficiencies'
  proficiencySkills: z.array(skillSchema).optional(),
  proficiencyArmor: z.array(armorCategorySchema).optional(),
  proficiencyTools: z.string().optional(),
  proficiencyWeapons: z.string().optional(),
})
type GrantRowForm = z.infer<typeof grantRowFormSchema>

const traitRowFormSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  grants: z.array(grantRowFormSchema),
})
type TraitRowForm = z.infer<typeof traitRowFormSchema>

const choiceGroupRowFormSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  kind: speciesChoiceKindSchema,
  description: z.string().optional(),
  options: z.array(traitRowFormSchema).min(1),
})
type ChoiceGroupRowForm = z.infer<typeof choiceGroupRowFormSchema>

const speciesFormSchema = z.object({
  name: z.string().min(1),
  slug: slugSchema,
  description: z.string().optional(),
  creatureType: creatureTypeSchema,
  sizes: z.array(creatureSizeSchema).min(1),
  speed: z.object({
    walk: z.coerce.number().int().min(0),
  }),
  traits: z.array(traitRowFormSchema),
  choiceGroups: z.array(choiceGroupRowFormSchema).optional(),
})
type SpeciesFormValues = z.infer<typeof speciesFormSchema>

// ---------------------------------------------------------------------------
// Conditional visibility helper
// ---------------------------------------------------------------------------

function visibleFor(value: GrantType): FieldVisibility {
  return {
    dependsOn: ['grantType'],
    visibleWhen: (watched) => watched['grantType'] === value,
  }
}

// ---------------------------------------------------------------------------
// Field builders
// ---------------------------------------------------------------------------

function grantItemFields(): FormItem[] {
  return [
    {
      type: 'select',
      name: 'grantType',
      label: 'Grant type',
      options: grantTypeOptions,
      required: true,
    },
    // resistances
    {
      type: 'chips',
      name: 'resistances',
      label: 'Damage types',
      options: damageTypeOptions,
      visibility: visibleFor('resistances'),
    },
    // damageType
    {
      type: 'chips',
      name: 'damageType',
      label: 'Damage types',
      options: damageTypeOptions,
      visibility: visibleFor('damageType'),
    },
    // senses — one sense per grant row
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
    // speedOverride
    {
      type: 'select',
      name: 'speedWalkOverride',
      label: 'Walk speed (ft.)',
      options: speedWalkOptions,
      visibility: visibleFor('speedOverride'),
    },
    // languages — one per row
    {
      type: 'text',
      name: 'language',
      label: 'Language',
      placeholder: 'e.g. Common',
      visibility: visibleFor('languages'),
    },
    // proficiencies
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
      type: 'text',
      name: 'proficiencyTools',
      label: 'Tools',
      hint: 'Comma-separated',
      visibility: visibleFor('proficiencies'),
    },
    {
      type: 'text',
      name: 'proficiencyWeapons',
      label: 'Weapons',
      hint: 'Comma-separated',
      visibility: visibleFor('proficiencies'),
    },
  ]
}

function traitItemFields(): FormItem[] {
  return [
    {
      kind: 'row',
      fields: [
        {
          type: 'text',
          name: 'id',
          label: 'ID',
          hint: 'Unique slug (e.g. darkvision)',
          required: true,
        },
        { type: 'text', name: 'name', label: 'Name', required: true },
      ],
    },
    { type: 'richtext', name: 'description', label: 'Description' },
    {
      kind: 'array',
      name: 'grants',
      legend: 'Grants',
      addLabel: 'Add grant',
      itemTitle: (values, index) => {
        const type = values['grantType'] as GrantType | undefined
        return type ? GRANT_TYPE_LABELS[type] : `Grant ${index + 1}`
      },
      fields: grantItemFields(),
    },
  ]
}

function choiceGroupItemFields(): FormItem[] {
  return [
    {
      kind: 'row',
      fields: [
        {
          type: 'text',
          name: 'id',
          label: 'ID',
          hint: 'Unique slug (e.g. draconic-ancestry)',
          required: true,
        },
        { type: 'text', name: 'name', label: 'Name', required: true },
        { type: 'select', name: 'kind', label: 'Kind', options: choiceKindOptions, required: true },
      ],
    },
    { type: 'richtext', name: 'description', label: 'Description' },
    {
      kind: 'array',
      name: 'options',
      legend: 'Options',
      addLabel: 'Add option',
      min: 1,
      itemTitle: (values, index) => (values['name'] as string) || `Option ${index + 1}`,
      fields: traitItemFields(),
    },
  ]
}

// ---------------------------------------------------------------------------
// Grant conversion helpers (ContentGrants ↔ GrantRowForm[])
// ---------------------------------------------------------------------------

function emptyGrantRow(grantType: GrantType): GrantRowForm {
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
    proficiencyTools: '',
    proficiencyWeapons: '',
  }
}

function splitComma(s: string): string[] {
  return s
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
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
    proficiencyTools: tools?.join(', ') ?? '',
    proficiencyWeapons: weapons?.join(', ') ?? '',
  }
}

/**
 * Converts a `ContentGrants` object into an array of flat grant-row form
 * values. Each sense becomes its own row; each language becomes its own row;
 * all resistances/damageTypes collapse into one row each.
 */
function grantsToFormRows(grants: ContentGrants | undefined): GrantRowForm[] {
  if (!grants) return []
  return [
    ...senseGrantsToRows(grants.senses),
    ...optionalGrantRow(resistancesToRow(grants.resistances)),
    ...optionalGrantRow(damageTypesToRow(grants.damageType)),
    ...optionalGrantRow(speedOverrideToRow(grants.speedOverride)),
    ...languageGrantsToRows(grants.languages),
    ...optionalGrantRow(proficienciesToRow(grants.proficiencies)),
  ]
}

function applySensesFromRows(result: ContentGrants, rows: GrantRowForm[]): void {
  const senseRows = rows.filter((r) => r.grantType === 'senses' && r.senseType)
  if (!senseRows.length) return
  result.senses = senseRows.map((r) => ({
    type: r.senseType as SenseType,
    range: r.senseRange ?? 60,
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
  const tools = splitComma(row.proficiencyTools ?? '')
  const weapons = splitComma(row.proficiencyWeapons ?? '')
  return Object.assign({}, tools.length ? { tools } : {}, weapons.length ? { weapons } : {})
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

/**
 * Folds an array of grant-row form values back into a `ContentGrants` object.
 * Multiple 'senses'/'languages' rows are merged into their respective arrays.
 */
function formRowsToGrants(rows: GrantRowForm[]): ContentGrants | undefined {
  if (!rows.length) return undefined

  const result: ContentGrants = {}
  applySensesFromRows(result, rows)
  applyResistancesFromRows(result, rows)
  applyDamageTypesFromRows(result, rows)
  applySpeedOverrideFromRows(result, rows)
  applyLanguagesFromRows(result, rows)
  applyProficienciesFromRows(result, rows)

  return Object.keys(result).length ? result : undefined
}

// ---------------------------------------------------------------------------
// Trait conversion helpers (ContentTrait ↔ TraitRowForm)
// ---------------------------------------------------------------------------

function traitToFormRow(trait: ContentTrait): TraitRowForm {
  return {
    id: trait.id,
    name: trait.name,
    description: trait.description,
    grants: grantsToFormRows(trait.grants),
  }
}

function traitFromFormRow(row: TraitRowForm): ContentTrait {
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    grants: formRowsToGrants(row.grants),
  }
}

// ---------------------------------------------------------------------------
// Choice group conversion helpers
// ---------------------------------------------------------------------------

function choiceGroupToFormRow(group: SpeciesChoiceGroup): ChoiceGroupRowForm {
  return {
    id: group.id,
    name: group.name,
    kind: group.kind,
    description: group.description,
    options: group.options.map(traitToFormRow),
  }
}

function choiceGroupFromFormRow(row: ChoiceGroupRowForm): SpeciesChoiceGroup {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    description: row.description || undefined,
    options: row.options.map(traitFromFormRow),
  }
}

// ---------------------------------------------------------------------------
// Create-form defaults
// ---------------------------------------------------------------------------

const speciesCreateDefaultValues: Partial<SpeciesFormValues> = {
  creatureType: 'humanoid',
  sizes: ['medium'],
  speed: { walk: 30 },
  traits: [],
}

// ---------------------------------------------------------------------------
// Species ContentFormDef
// ---------------------------------------------------------------------------

const speciesFormDef: ContentFormDef<Species, SpeciesFormValues, CreateSpeciesInput> = {
  routeKey: 'species',

  schema: speciesFormSchema,
  createDefaultValues: speciesCreateDefaultValues,

  buildFields: (_ctx) => [
    {
      kind: 'group',
      legend: 'Identity',
      fields: [
        {
          kind: 'row',
          fields: [
            { type: 'text', name: 'name', label: 'Name', required: true },
            {
              type: 'text',
              name: 'slug',
              label: 'Slug',
              hint: 'Lowercase letters, numbers, hyphens',
              required: true,
            },
          ],
        },
        { type: 'richtext', name: 'description', label: 'Description' },
      ],
    },
    {
      kind: 'group',
      legend: 'Attributes',
      fields: [
        {
          kind: 'row',
          fields: [
            {
              type: 'select',
              name: 'creatureType',
              label: 'Creature type',
              options: creatureTypeOptions,
              required: true,
            },
            {
              type: 'select',
              name: 'speed.walk',
              label: 'Walk speed',
              options: speedWalkOptions,
              required: true,
            },
          ],
        },
        {
          type: 'chips',
          name: 'sizes',
          label: 'Size',
          options: creatureSizeOptions,
          required: true,
        },
      ],
    },
    {
      kind: 'array',
      name: 'traits',
      legend: 'Traits',
      addLabel: 'Add trait',
      itemTitle: (values, index) => (values['name'] as string) || `Trait ${index + 1}`,
      fields: traitItemFields(),
    },
    {
      kind: 'array',
      name: 'choiceGroups',
      legend: 'Choice groups',
      addLabel: 'Add choice group',
      itemTitle: (values, index) => (values['name'] as string) || `Choice group ${index + 1}`,
      fields: choiceGroupItemFields(),
    },
  ],

  toFormValues: (entity) => ({
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    creatureType: entity.creatureType,
    sizes: entity.sizes,
    speed: { walk: entity.speed.walk },
    traits: entity.traits.map(traitToFormRow),
    choiceGroups: entity.choiceGroups?.map(choiceGroupToFormRow) ?? [],
  }),

  toInput: (values) => ({
    name: values.name,
    slug: values.slug,
    description: values.description || undefined,
    creatureType: values.creatureType,
    sizes: values.sizes,
    speed: { walk: values.speed.walk },
    traits: values.traits.map(traitFromFormRow),
    choiceGroups: values.choiceGroups?.length
      ? values.choiceGroups.map(choiceGroupFromFormRow)
      : undefined,
  }),

  useListQuery: useSpecies,
  queryKey: speciesQueryKey,
}

// Register into the global content form registry (side effect on module load).
contentFormRegistry['species'] = speciesFormDef

export { speciesFormDef }
export type { SpeciesFormValues }
