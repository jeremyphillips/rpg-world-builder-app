import { z } from 'zod'

// ---------------------------------------------------------------------------
// D&D Beyond character v5 — external payload schema.
//
// Narrow "comprehensive": adapter-critical nodes are explicit; known capability
// nodes are shallow; volatile objects use .passthrough().
// ---------------------------------------------------------------------------

const nullableNumber = z.number().nullable()
const nullableString = z.string().nullable()

/** Stat, bonus, and override arrays share this row shape. */
export const dndBeyondStatRowSchema = z
  .object({
    id: z.number().int(),
    name: nullableString,
    value: nullableNumber,
  })
  .passthrough()

export type DndBeyondStatRow = z.infer<typeof dndBeyondStatRowSchema>

export const dndBeyondModifierSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    type: z.string(),
    subType: z.string(),
    value: nullableNumber.optional(),
    statId: nullableNumber.optional(),
    friendlyTypeName: nullableString.optional(),
    friendlySubtypeName: nullableString.optional(),
    componentId: z.number().nullable().optional(),
    componentTypeId: z.number().nullable().optional(),
    isGranted: z.boolean().optional(),
    restriction: nullableString.optional(),
  })
  .passthrough()

export type DndBeyondModifier = z.infer<typeof dndBeyondModifierSchema>

const modifierGroupSchema = z.array(dndBeyondModifierSchema)

export const dndBeyondModifiersSchema = z
  .object({
    race: modifierGroupSchema.optional(),
    class: modifierGroupSchema.optional(),
    background: modifierGroupSchema.optional(),
    item: modifierGroupSchema.optional(),
    feat: modifierGroupSchema.optional(),
    condition: modifierGroupSchema.optional(),
  })
  .passthrough()

export type DndBeyondModifiers = z.infer<typeof dndBeyondModifiersSchema>

export const dndBeyondTraitsSchema = z
  .object({
    personalityTraits: nullableString,
    ideals: nullableString,
    bonds: nullableString,
    flaws: nullableString,
    appearance: nullableString,
  })
  .passthrough()

export const dndBeyondNotesSchema = z
  .object({
    allies: nullableString.optional(),
    personalPossessions: nullableString.optional(),
    otherHoldings: nullableString.optional(),
    organizations: nullableString.optional(),
    enemies: nullableString.optional(),
    backstory: nullableString.optional(),
    otherNotes: nullableString.optional(),
  })
  .passthrough()

export const dndBeyondCustomProficiencySchema = z
  .object({
    name: z.string().optional(),
    type: z.string().optional(),
    subType: z.string().optional(),
  })
  .passthrough()

/** Shallow content definition — id and name only for capability detection. */
const shallowDefinitionSchema = z
  .object({
    id: z.number().optional(),
    name: z.string().optional(),
    slug: z.string().optional(),
  })
  .passthrough()

export const dndBeyondClassSchema = z
  .object({
    id: z.number(),
    level: z.number().int(),
    definitionId: z.number().optional(),
    definition: shallowDefinitionSchema.optional(),
    subclassDefinition: shallowDefinitionSchema.nullable().optional(),
  })
  .passthrough()

export const dndBeyondRaceSchema = z
  .object({
    fullName: nullableString,
    baseName: nullableString,
    definitionId: z.number().optional(),
    definition: shallowDefinitionSchema.optional(),
  })
  .passthrough()

export const dndBeyondBackgroundSchema = z
  .object({
    definitionId: z.number().nullable().optional(),
    definition: shallowDefinitionSchema.optional(),
    customBackground: z.unknown().nullable().optional(),
  })
  .passthrough()

export const dndBeyondInventoryItemSchema = z
  .object({
    id: z.number().optional(),
    definitionId: z.number().optional(),
    quantity: z.number().optional(),
    equipped: z.boolean().optional(),
    definition: shallowDefinitionSchema.optional(),
  })
  .passthrough()

export const dndBeyondFeatSchema = z
  .object({
    id: z.number().optional(),
    definitionId: z.number().optional(),
    definition: shallowDefinitionSchema.optional(),
  })
  .passthrough()

export const dndBeyondSpellSchema = z
  .object({
    id: z.number().optional(),
    definitionId: z.number().optional(),
    definition: shallowDefinitionSchema.optional(),
  })
  .passthrough()

export const dndBeyondCurrenciesSchema = z
  .object({
    cp: z.number().optional(),
    sp: z.number().optional(),
    gp: z.number().optional(),
    ep: z.number().optional(),
    pp: z.number().optional(),
  })
  .passthrough()

/** Character `data` node — validated payload consumed by the adapter. */
export const dndBeyondCharacterDataSchema = z
  .object({
    id: z.number(),
    name: nullableString,
    alignmentId: nullableNumber,
    currentXp: z.number().optional(),
    adjustmentXp: z.number().optional(),
    stats: z.array(dndBeyondStatRowSchema).optional(),
    bonusStats: z.array(dndBeyondStatRowSchema).optional(),
    overrideStats: z.array(dndBeyondStatRowSchema).optional(),
    baseHitPoints: nullableNumber,
    bonusHitPoints: nullableNumber,
    overrideHitPoints: nullableNumber,
    removedHitPoints: nullableNumber,
    temporaryHitPoints: nullableNumber,
    traits: dndBeyondTraitsSchema.optional(),
    notes: dndBeyondNotesSchema.optional(),
    modifiers: dndBeyondModifiersSchema.optional(),
    customProficiencies: z.array(dndBeyondCustomProficiencySchema).optional(),
    classes: z.array(dndBeyondClassSchema).optional(),
    race: dndBeyondRaceSchema.nullable().optional(),
    background: dndBeyondBackgroundSchema.nullable().optional(),
    inventory: z.array(dndBeyondInventoryItemSchema).optional(),
    currencies: dndBeyondCurrenciesSchema.optional(),
    feats: z.array(dndBeyondFeatSchema).optional(),
    classSpells: z.array(dndBeyondSpellSchema).optional(),
    raceSpells: z.array(dndBeyondSpellSchema).optional(),
  })
  .passthrough()

export type DndBeyondCharacterData = z.infer<typeof dndBeyondCharacterDataSchema>

/** Alias used by acquisition + adapter boundaries. */
export const dndBeyondCharacterPayloadSchema = dndBeyondCharacterDataSchema

export type DndBeyondCharacterPayload = DndBeyondCharacterData

/** Full upstream response envelope. */
export const dndBeyondCharacterResponseSchema = z
  .object({
    id: z.number().optional(),
    success: z.boolean(),
    message: nullableString,
    data: dndBeyondCharacterDataSchema.nullable(),
    pagination: z.unknown().nullable().optional(),
  })
  .passthrough()

export type DndBeyondCharacterResponse = z.infer<typeof dndBeyondCharacterResponseSchema>
