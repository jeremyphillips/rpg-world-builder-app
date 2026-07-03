import { z } from 'zod'
import {
  ARMOR_CATEGORIES,
  ARMOR_CATEGORY_ENTRIES,
  defineMessage,
  EQUIPMENT_KIND_LABELS,
  EQUIPMENT_KINDS,
  GEAR_KIND_ENTRIES,
  GEAR_KINDS,
  TOOL_CATEGORIES,
  TOOL_CATEGORY_ENTRIES,
  toolCategorySchema,
  WEAPON_CATEGORIES,
  WEAPON_CATEGORY_ENTRIES,
  weaponCategorySchema,
  armorCategorySchema,
  equipmentKindSchema,
  gearKindSchema,
} from '@rpg/contracts'
import {
  combineFieldVisibilityAll,
  toOptions,
  type FieldVisibility,
  type FormItem,
} from '@rpg/ui/form'

import type { ContentFormCtx } from '../content-form-registry'
import {
  EQUIPMENT_GRANT_ITEM_KIND_LABELS,
  EQUIPMENT_POOL_SOURCE_LABELS,
} from './equipment-grant-form-labels'

/** Sentinel for “any category” in single-select pool category fields (Radix Select rejects `''`). */
export const EQUIPMENT_POOL_CATEGORY_ANY = '__any__' as const

/** Equipment grant validation messages (tier 3 form overrides). */
export const equipmentGrantValidationMessages = {
  fixedEquipmentRequired: defineMessage(
    'validation.equipmentGrant.fixedEquipmentRequired',
    () => 'Specific items require equipment',
    () => 'Missing equipment',
  ),
  explicitPoolSlugsRequired: defineMessage(
    'validation.equipmentGrant.explicitPoolSlugsRequired',
    () => 'Specific item lists require at least one equipment item',
    () => 'Missing pool equipment',
  ),
  filteredPoolKindRequired: defineMessage(
    'validation.equipmentGrant.filteredPoolKindRequired',
    () => 'Filtered pools require an equipment type',
    () => 'Missing equipment type',
  ),
}

export const EQUIPMENT_GRANT_ITEM_KINDS = ['fixed', 'choice'] as const

export const EQUIPMENT_POOL_SOURCES = ['explicit', 'filtered'] as const

const itemKindOptions = toOptions(EQUIPMENT_GRANT_ITEM_KINDS, EQUIPMENT_GRANT_ITEM_KIND_LABELS)

const poolSourceOptions = toOptions(EQUIPMENT_POOL_SOURCES, EQUIPMENT_POOL_SOURCE_LABELS)

const equipmentKindOptions = toOptions(
  EQUIPMENT_KINDS,
  EQUIPMENT_KIND_LABELS as Record<(typeof EQUIPMENT_KINDS)[number], string>,
)

const toolCategoryOptions = toOptions(
  TOOL_CATEGORIES,
  Object.fromEntries(
    TOOL_CATEGORIES.map((category) => [category, TOOL_CATEGORY_ENTRIES[category].label]),
  ) as Record<(typeof TOOL_CATEGORIES)[number], string>,
)

const weaponCategoryOptions = toOptions(
  WEAPON_CATEGORIES,
  Object.fromEntries(
    WEAPON_CATEGORIES.map((category) => [category, WEAPON_CATEGORY_ENTRIES[category].label]),
  ) as Record<(typeof WEAPON_CATEGORIES)[number], string>,
)

const armorCategoryOptions = toOptions(
  ARMOR_CATEGORIES,
  Object.fromEntries(
    ARMOR_CATEGORIES.map((category) => [category, ARMOR_CATEGORY_ENTRIES[category].label]),
  ) as Record<(typeof ARMOR_CATEGORIES)[number], string>,
)

const gearKindOptions = toOptions(
  GEAR_KINDS,
  Object.fromEntries(GEAR_KINDS.map((kind) => [kind, GEAR_KIND_ENTRIES[kind].label])) as Record<
    (typeof GEAR_KINDS)[number],
    string
  >,
)

function categoryOptionsWithAny(options: { value: string; label: string }[]) {
  return [{ value: EQUIPMENT_POOL_CATEGORY_ANY, label: 'Any' }, ...options]
}

export const equipmentGrantFixedItemFormSchema = z.object({
  itemKind: z.literal('fixed'),
  equipmentSlug: z.string().min(1),
  quantity: z.coerce.number().int().min(1).default(1),
  equipped: z.boolean().optional(),
})

export const equipmentGrantChoiceItemFormSchema = z
  .object({
    itemKind: z.literal('choice'),
    choose: z.coerce.number().int().min(1).default(1),
    poolSource: z.enum(EQUIPMENT_POOL_SOURCES).default('filtered'),
    poolEquipmentSlugs: z.array(z.string().min(1)).optional(),
    poolEquipmentKind: equipmentKindSchema.optional(),
    poolToolCategory: z
      .union([toolCategorySchema, z.literal(EQUIPMENT_POOL_CATEGORY_ANY)])
      .optional(),
    poolWeaponCategory: z
      .union([weaponCategorySchema, z.literal(EQUIPMENT_POOL_CATEGORY_ANY)])
      .optional(),
    poolArmorCategory: z
      .union([armorCategorySchema, z.literal(EQUIPMENT_POOL_CATEGORY_ANY)])
      .optional(),
    poolGearKind: z.union([gearKindSchema, z.literal(EQUIPMENT_POOL_CATEGORY_ANY)]).optional(),
  })
  .superRefine((row, ctx) => {
    if (row.poolSource === 'explicit') {
      if (!row.poolEquipmentSlugs?.length) {
        ctx.addIssue({
          code: 'custom',
          message: equipmentGrantValidationMessages.explicitPoolSlugsRequired(),
          path: ['poolEquipmentSlugs'],
        })
      }
      return
    }

    if (!row.poolEquipmentKind) {
      ctx.addIssue({
        code: 'custom',
        message: equipmentGrantValidationMessages.filteredPoolKindRequired(),
        path: ['poolEquipmentKind'],
      })
    }
  })

export const equipmentGrantItemFormSchema = z.discriminatedUnion('itemKind', [
  equipmentGrantFixedItemFormSchema,
  equipmentGrantChoiceItemFormSchema,
])

export type EquipmentGrantItemForm = z.infer<typeof equipmentGrantItemFormSchema>

export type EquipmentGrantFixedItemForm = Extract<EquipmentGrantItemForm, { itemKind: 'fixed' }>

export type EquipmentGrantChoiceItemForm = Extract<EquipmentGrantItemForm, { itemKind: 'choice' }>

function withGuard(
  visibility: FieldVisibility | undefined,
  guard?: FieldVisibility,
): FieldVisibility | undefined {
  if (!guard) return visibility
  if (!visibility) return guard
  return combineFieldVisibilityAll(guard, visibility)
}

function visibleForItemKind(
  itemKind: (typeof EQUIPMENT_GRANT_ITEM_KINDS)[number],
  guard?: FieldVisibility,
): FieldVisibility {
  return withGuard(
    {
      dependsOn: ['itemKind'],
      visibleWhen: (watched) => watched['itemKind'] === itemKind,
    },
    guard,
  )!
}

function visibleForChoicePoolSource(
  poolSource: (typeof EQUIPMENT_POOL_SOURCES)[number],
  guard?: FieldVisibility,
): FieldVisibility {
  return withGuard(
    {
      dependsOn: ['itemKind', 'poolSource'],
      visibleWhen: (watched) =>
        watched['itemKind'] === 'choice' && watched['poolSource'] === poolSource,
    },
    guard,
  )!
}

function visibleForFilteredEquipmentKind(
  equipmentKind: (typeof EQUIPMENT_KINDS)[number],
  guard?: FieldVisibility,
): FieldVisibility {
  return withGuard(
    {
      dependsOn: ['itemKind', 'poolSource', 'poolEquipmentKind'],
      visibleWhen: (watched) =>
        watched['itemKind'] === 'choice' &&
        watched['poolSource'] === 'filtered' &&
        watched['poolEquipmentKind'] === equipmentKind,
    },
    guard,
  )!
}

export function fixedEquipmentGrantFields(
  ctx: ContentFormCtx,
  guard?: FieldVisibility,
): FormItem[] {
  const equipmentOptions = ctx.options?.equipment ?? []

  return [
    {
      kind: 'row',
      visibility: visibleForItemKind('fixed', guard),
      fields: [
        {
          type: 'combobox',
          name: 'equipmentSlug',
          label: 'Equipment',
          options: equipmentOptions,
          multiple: false,
          placeholder: 'Choose equipment…',
          required: true,
          width: 'full',
        },
        {
          type: 'number',
          name: 'quantity',
          label: 'Quantity',
          min: 1,
          defaultValue: 1,
          width: 'auto',
          digits: 2,
        },
      ],
    },
    {
      type: 'switch',
      name: 'equipped',
      label: 'Equipped',
      visibility: visibleForItemKind('fixed', guard),
    },
  ]
}

export function equipmentChoiceGrantFields(
  ctx: ContentFormCtx,
  guard?: FieldVisibility,
): FormItem[] {
  const equipmentOptions = ctx.options?.equipment ?? []

  return [
    {
      type: 'inlineSentence',
      name: 'choose',
      label: '',
      hideLabel: true,
      visibility: visibleForItemKind('choice', guard),
      segments: [
        { kind: 'text', value: 'Character chooses', tone: 'label' },
        {
          kind: 'number',
          name: 'choose',
          min: 1,
          digits: 1,
          defaultValue: 1,
        },
        { kind: 'text', value: 'item(s) from', tone: 'label' },
        {
          kind: 'select',
          name: 'poolSource',
          options: poolSourceOptions,
          width: 'xl',
          defaultValue: 'filtered',
          ariaLabel: 'Pool source',
        },
      ],
    },
    {
      type: 'combobox',
      name: 'poolEquipmentSlugs',
      label: 'Equipment',
      multiple: true,
      options: equipmentOptions,
      placeholder: 'Choose equipment…',
      visibility: visibleForChoicePoolSource('explicit', guard),
    },
    {
      kind: 'row',
      visibility: visibleForChoicePoolSource('filtered', guard),
      fields: [
        {
          type: 'select',
          name: 'poolEquipmentKind',
          label: 'Equipment type',
          options: equipmentKindOptions,
          required: true,
          defaultValue: 'tool',
        },
        {
          type: 'select',
          name: 'poolToolCategory',
          label: 'Tool category',
          options: categoryOptionsWithAny(toolCategoryOptions),
          defaultValue: EQUIPMENT_POOL_CATEGORY_ANY,
          visibility: visibleForFilteredEquipmentKind('tool', guard),
        },
        {
          type: 'select',
          name: 'poolWeaponCategory',
          label: 'Weapon category',
          options: categoryOptionsWithAny(weaponCategoryOptions),
          defaultValue: EQUIPMENT_POOL_CATEGORY_ANY,
          visibility: visibleForFilteredEquipmentKind('weapon', guard),
        },
        {
          type: 'select',
          name: 'poolArmorCategory',
          label: 'Armor category',
          options: categoryOptionsWithAny(armorCategoryOptions),
          defaultValue: EQUIPMENT_POOL_CATEGORY_ANY,
          visibility: visibleForFilteredEquipmentKind('armor', guard),
        },
        {
          type: 'select',
          name: 'poolGearKind',
          label: 'Gear kind',
          options: categoryOptionsWithAny(gearKindOptions),
          defaultValue: EQUIPMENT_POOL_CATEGORY_ANY,
          visibility: visibleForFilteredEquipmentKind('adventuring_gear', guard),
        },
      ],
    },
  ]
}

export type EquipmentGrantItemFieldsOptions = {
  extraFields?: FormItem[]
  /** Override the item-kind select label (e.g. when composed inside the grants array). */
  kindSelectLabel?: string
  /** AND-combined visibility guard applied to every equipment grant field. */
  guardVisibility?: FieldVisibility
}

export function equipmentGrantItemFields(
  ctx: ContentFormCtx,
  opts: EquipmentGrantItemFieldsOptions = {},
): FormItem[] {
  const guard = opts.guardVisibility

  return [
    {
      type: 'select',
      name: 'itemKind',
      label: opts.kindSelectLabel ?? 'Grant type',
      options: itemKindOptions,
      required: true,
      defaultValue: 'fixed',
      visibility: guard,
    },
    ...fixedEquipmentGrantFields(ctx, guard),
    ...(opts.extraFields ?? []),
    ...equipmentChoiceGrantFields(ctx, guard),
  ]
}
