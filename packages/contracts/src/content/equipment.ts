import { z } from 'zod'
import { abilitySchema } from './ability'
import {
  contentBodyBaseSchema,
  contentMetaSchema,
  contentPatchBaseSchema,
  slugSchema,
} from './content'
import { moneySchema, weightSchema } from './units'

// ---------------------------------------------------------------------------
// Equipment — the consolidated "long tail" content type. Armor, weapons, and
// magic items remain their own content types (rich, frequently-referenced
// mechanics); everything else (adventuring gear, ammunition, focuses, tools,
// mounts, vehicles, ships, and one-off items) lives here as a single content
// type discriminated by `kind`. New item kinds cost a new union variant, never
// a new registry entry — that is what keeps the catalog from blowing up.
//
// Modeling note: only `name`, `description`, `imageKey`, and `cost` are truly
// universal; every other field is per-kind, so this is a discriminated union
// rather than a flat bag of optionals. The four derived schemas (stored,
// create, update, patch) are spelled out as explicit array literals: mapping a
// transform over the variants would collapse the discriminant through `.extend`
// and lose per-kind narrowing.
// ---------------------------------------------------------------------------

export const EQUIPMENT_KIND_LABELS = {
  gear: 'Adventuring Gear',
  ammunition: 'Ammunition',
  focus: 'Focus',
  tool: 'Tool',
  mount: 'Mount',
  vehicle: 'Vehicle',
  ship: 'Ship',
  misc: 'Miscellaneous',
} as const

export type EquipmentKind = keyof typeof EQUIPMENT_KIND_LABELS

export const EQUIPMENT_KINDS = Object.keys(EQUIPMENT_KIND_LABELS) as [
  EquipmentKind,
  ...EquipmentKind[],
]

/**
 * Returns the display name for an equipment kind.
 * Falls back to the raw value for unknown kinds.
 */
export function getEquipmentKindLabel(kind: string): string {
  return EQUIPMENT_KIND_LABELS[kind as EquipmentKind] ?? kind
}

// ---------------------------------------------------------------------------
// Per-kind sub-taxonomies
// ---------------------------------------------------------------------------

export const GEAR_CATEGORY_LABELS = {
  container: 'Container',
  consumable: 'Consumable',
  lighting: 'Lighting',
  writing: 'Writing',
  kit: 'Kit',
  other: 'Other',
} as const

export type GearCategory = keyof typeof GEAR_CATEGORY_LABELS

export const gearCategorySchema = z.enum(
  Object.keys(GEAR_CATEGORY_LABELS) as [GearCategory, ...GearCategory[]],
)

export const FOCUS_TYPE_LABELS = {
  arcane: 'Arcane',
  druidic: 'Druidic',
  holy: 'Holy',
} as const

export type FocusType = keyof typeof FOCUS_TYPE_LABELS

export const focusTypeSchema = z.enum(Object.keys(FOCUS_TYPE_LABELS) as [FocusType, ...FocusType[]])

export const TOOL_CATEGORY_LABELS = {
  artisan: "Artisan's Tools",
  'gaming-set': 'Gaming Set',
  'musical-instrument': 'Musical Instrument',
  other: 'Other',
} as const

export type ToolCategory = keyof typeof TOOL_CATEGORY_LABELS

export const toolCategorySchema = z.enum(
  Object.keys(TOOL_CATEGORY_LABELS) as [ToolCategory, ...ToolCategory[]],
)

// ---------------------------------------------------------------------------
// Shared base — the fields every equipment item has, regardless of kind.
// ---------------------------------------------------------------------------

const equipmentBaseSchema = contentBodyBaseSchema.extend({ cost: moneySchema })

// ---------------------------------------------------------------------------
// Per-kind body variants — each adds only the fields that kind actually uses.
// ---------------------------------------------------------------------------

export const gearBodySchema = equipmentBaseSchema.extend({
  kind: z.literal('gear'),
  weight: weightSchema.optional(),
  gearCategory: gearCategorySchema.optional(),
  /** Open-ended mechanical notes (e.g. "burst DC 13", "1-hour duration"). */
  properties: z.array(z.string()).optional(),
  /** Storage capacity, free text (e.g. "1 cubic foot / 30 lb of gear"). */
  capacity: z.string().optional(),
})

export const ammunitionBodySchema = equipmentBaseSchema.extend({
  kind: z.literal('ammunition'),
  weight: weightSchema.optional(),
  /** How many rounds the listed cost/weight buys (e.g. 20 arrows). */
  bundleSize: z.number().int().min(1),
  /** The container the bundle ships in (e.g. "Quiver", "Case", "Pouch"). */
  storage: z.string(),
})

export const focusBodySchema = equipmentBaseSchema.extend({
  kind: z.literal('focus'),
  weight: weightSchema.optional(),
  focusType: focusTypeSchema,
})

export const toolBodySchema = equipmentBaseSchema.extend({
  kind: z.literal('tool'),
  weight: weightSchema.optional(),
  toolCategory: toolCategorySchema,
  /** The ability a check with this tool typically uses. */
  ability: abilitySchema.optional(),
})

export const mountBodySchema = equipmentBaseSchema.extend({
  kind: z.literal('mount'),
  carryingCapacity: weightSchema,
  /** Movement speed, free text (e.g. "60 ft."). */
  speed: z.string().optional(),
})

export const vehicleBodySchema = equipmentBaseSchema.extend({
  kind: z.literal('vehicle'),
  weight: weightSchema.optional(),
  /** Carrying/cargo capacity for land and drawn vehicles. */
  capacity: weightSchema.optional(),
})

export const shipBodySchema = equipmentBaseSchema.extend({
  kind: z.literal('ship'),
  /** Movement speed, free text (e.g. "8 mph"). */
  speed: z.string().optional(),
  crew: z.number().int().min(0).optional(),
  passengers: z.number().int().min(0).optional(),
  cargoTons: z.number().min(0).optional(),
  ac: z.number().int().min(0).optional(),
  hp: z.number().int().min(0).optional(),
  damageThreshold: z.number().int().min(0).optional(),
})

export const miscBodySchema = equipmentBaseSchema.extend({
  kind: z.literal('misc'),
  weight: weightSchema.optional(),
  /** Free-form notes for one-off items and services. */
  notes: z.string().optional(),
})

// ---------------------------------------------------------------------------
// Equipment — editable body + stored shape + authoring DTOs
// ---------------------------------------------------------------------------

/** The editable shape: what a form authors and what a patch overrides. */
export const equipmentBodySchema = z.discriminatedUnion('kind', [
  gearBodySchema,
  ammunitionBodySchema,
  focusBodySchema,
  toolBodySchema,
  mountBodySchema,
  vehicleBodySchema,
  shipBodySchema,
  miscBodySchema,
])

export type EquipmentBody = z.infer<typeof equipmentBodySchema>

/** Stored shape = ownership envelope + body, per variant. */
export const equipmentSchema = z.discriminatedUnion('kind', [
  contentMetaSchema.extend(gearBodySchema.shape),
  contentMetaSchema.extend(ammunitionBodySchema.shape),
  contentMetaSchema.extend(focusBodySchema.shape),
  contentMetaSchema.extend(toolBodySchema.shape),
  contentMetaSchema.extend(mountBodySchema.shape),
  contentMetaSchema.extend(vehicleBodySchema.shape),
  contentMetaSchema.extend(shipBodySchema.shape),
  contentMetaSchema.extend(miscBodySchema.shape),
])

export type Equipment = z.infer<typeof equipmentSchema>

// Homebrew authoring DTOs (forms). Server sets id/source/campaignId/timestamps.
export const createEquipmentInputSchema = z.discriminatedUnion('kind', [
  gearBodySchema.extend({ slug: slugSchema }),
  ammunitionBodySchema.extend({ slug: slugSchema }),
  focusBodySchema.extend({ slug: slugSchema }),
  toolBodySchema.extend({ slug: slugSchema }),
  mountBodySchema.extend({ slug: slugSchema }),
  vehicleBodySchema.extend({ slug: slugSchema }),
  shipBodySchema.extend({ slug: slugSchema }),
  miscBodySchema.extend({ slug: slugSchema }),
])

export type CreateEquipmentInput = z.infer<typeof createEquipmentInputSchema>

// Partial of create, but `kind` stays required — it is the discriminant, so we
// always know which variant is being edited.
export const updateEquipmentInputSchema = z.discriminatedUnion('kind', [
  gearBodySchema.extend({ slug: slugSchema }).partial().extend({ kind: gearBodySchema.shape.kind }),
  ammunitionBodySchema
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: ammunitionBodySchema.shape.kind }),
  focusBodySchema
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: focusBodySchema.shape.kind }),
  toolBodySchema.extend({ slug: slugSchema }).partial().extend({ kind: toolBodySchema.shape.kind }),
  mountBodySchema
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: mountBodySchema.shape.kind }),
  vehicleBodySchema
    .extend({ slug: slugSchema })
    .partial()
    .extend({ kind: vehicleBodySchema.shape.kind }),
  shipBodySchema.extend({ slug: slugSchema }).partial().extend({ kind: shipBodySchema.shape.kind }),
  miscBodySchema.extend({ slug: slugSchema }).partial().extend({ kind: miscBodySchema.shape.kind }),
])

export type UpdateEquipmentInput = z.infer<typeof updateEquipmentInputSchema>

/**
 * System-patch overlay. Reuses the generic envelope; only the type-specific
 * `patch` body differs. `.partial()` is shallow; the read-time merge handles
 * deep-merging (arrays replaced wholesale). `slug` is not patchable, and `kind`
 * stays required as the discriminant.
 */
export const equipmentPatchSchema = contentPatchBaseSchema.extend({
  patch: z.discriminatedUnion('kind', [
    gearBodySchema.partial().extend({ kind: gearBodySchema.shape.kind }),
    ammunitionBodySchema.partial().extend({ kind: ammunitionBodySchema.shape.kind }),
    focusBodySchema.partial().extend({ kind: focusBodySchema.shape.kind }),
    toolBodySchema.partial().extend({ kind: toolBodySchema.shape.kind }),
    mountBodySchema.partial().extend({ kind: mountBodySchema.shape.kind }),
    vehicleBodySchema.partial().extend({ kind: vehicleBodySchema.shape.kind }),
    shipBodySchema.partial().extend({ kind: shipBodySchema.shape.kind }),
    miscBodySchema.partial().extend({ kind: miscBodySchema.shape.kind }),
  ]),
})

export type EquipmentPatch = z.infer<typeof equipmentPatchSchema>
