import { z } from 'zod'

import {
  armorCategorySchema,
  getArmorCategoryEntry,
  getArmorCategoryLabel,
} from '../../vocab/armor/category'
import {
  getToolCategoryEntry,
  getToolCategoryLabel,
  toolCategorySchema,
} from '../../vocab/equipment/tool-category'
import { getTermLabelSingular, getTermSentenceForm, type GameTermEntry } from '../../vocab/types'
import {
  getWeaponCategoryEntry,
  getWeaponCategoryLabel,
  weaponCategorySchema,
} from '../../vocab/weapon/category'
import { skillSchema, SKILLS } from '../skill-proficiency'
import { contentPoolChoiceSchema } from './choice'

// ---------------------------------------------------------------------------
// Proficiency grants — fixed lists and pool choices for weapon, tool, skill,
// and armor training content grants. Mirrors equipment-grant fixed/choice shape.
// ---------------------------------------------------------------------------

export const PROFICIENCY_GRANT_KINDS = ['fixed', 'choice'] as const

export const proficiencyGrantKindSchema = z.enum(PROFICIENCY_GRANT_KINDS)

export type ProficiencyGrantKind = z.infer<typeof proficiencyGrantKindSchema>

export const PROFICIENCY_POOL_SOURCES = ['explicit', 'filtered', 'any'] as const

export const proficiencyPoolSourceSchema = z.enum(PROFICIENCY_POOL_SOURCES)

export type ProficiencyPoolSource = z.infer<typeof proficiencyPoolSourceSchema>

function refineFixedSlugsOrCategories(
  val: { slugs?: string[]; categories?: string[] },
  ctx: z.RefinementCtx,
  slugPath: string,
): void {
  const hasSlugs = (val.slugs?.length ?? 0) > 0
  const hasCategories = (val.categories?.length ?? 0) > 0
  if (!hasSlugs && !hasCategories) {
    ctx.addIssue({
      code: 'custom',
      message: 'Fixed grants require at least one specific item or category',
      path: [slugPath],
    })
  }
}

// --- Weapon -----------------------------------------------------------------

const explicitWeaponProficiencyPoolSchema = z.object({
  source: z.literal('explicit'),
  weaponSlugs: z.array(z.string().min(1)).min(1),
})

const filteredWeaponProficiencyPoolSchema = z.object({
  source: z.literal('filtered'),
  weaponCategory: weaponCategorySchema.optional(),
})

export const weaponProficiencyPoolSchema = z.discriminatedUnion('source', [
  explicitWeaponProficiencyPoolSchema,
  filteredWeaponProficiencyPoolSchema,
])

export type WeaponProficiencyPool = z.infer<typeof weaponProficiencyPoolSchema>

export const fixedWeaponProficiencyGrantSchema = z
  .object({
    kind: z.literal('fixed'),
    weaponSlugs: z.array(z.string().min(1)).optional(),
    weaponCategories: z.array(weaponCategorySchema).optional(),
  })
  .superRefine((val, ctx) => {
    refineFixedSlugsOrCategories(
      { slugs: val.weaponSlugs, categories: val.weaponCategories },
      ctx,
      'weaponSlugs',
    )
  })

export type FixedWeaponProficiencyGrant = z.infer<typeof fixedWeaponProficiencyGrantSchema>

export const weaponProficiencyChoiceGrantSchema = contentPoolChoiceSchema
  .omit({ label: true })
  .extend({
    kind: z.literal('choice'),
    pool: weaponProficiencyPoolSchema,
  })

export type WeaponProficiencyChoiceGrant = z.infer<typeof weaponProficiencyChoiceGrantSchema>

export const weaponProficiencyGrantSchema = z.discriminatedUnion('kind', [
  fixedWeaponProficiencyGrantSchema,
  weaponProficiencyChoiceGrantSchema,
])

export type WeaponProficiencyGrant = z.infer<typeof weaponProficiencyGrantSchema>

// --- Tool -------------------------------------------------------------------

const explicitToolProficiencyPoolSchema = z.object({
  source: z.literal('explicit'),
  toolSlugs: z.array(z.string().min(1)).min(1),
})

const filteredToolProficiencyPoolSchema = z.object({
  source: z.literal('filtered'),
  toolCategory: toolCategorySchema.optional(),
})

const anyToolProficiencyPoolSchema = z.object({
  source: z.literal('any'),
})

export const toolProficiencyPoolSchema = z.discriminatedUnion('source', [
  explicitToolProficiencyPoolSchema,
  filteredToolProficiencyPoolSchema,
  anyToolProficiencyPoolSchema,
])

export type ToolProficiencyPool = z.infer<typeof toolProficiencyPoolSchema>

export const fixedToolProficiencyGrantSchema = z
  .object({
    kind: z.literal('fixed'),
    toolSlugs: z.array(z.string().min(1)).optional(),
    toolCategories: z.array(toolCategorySchema).optional(),
  })
  .superRefine((val, ctx) => {
    refineFixedSlugsOrCategories(
      { slugs: val.toolSlugs, categories: val.toolCategories },
      ctx,
      'toolSlugs',
    )
  })

export type FixedToolProficiencyGrant = z.infer<typeof fixedToolProficiencyGrantSchema>

export const toolProficiencyChoiceGrantSchema = contentPoolChoiceSchema
  .omit({ label: true })
  .extend({
    kind: z.literal('choice'),
    pool: toolProficiencyPoolSchema,
  })

export type ToolProficiencyChoiceGrant = z.infer<typeof toolProficiencyChoiceGrantSchema>

export const toolProficiencyGrantSchema = z.discriminatedUnion('kind', [
  fixedToolProficiencyGrantSchema,
  toolProficiencyChoiceGrantSchema,
])

export type ToolProficiencyGrant = z.infer<typeof toolProficiencyGrantSchema>

// --- Skill ------------------------------------------------------------------

const explicitSkillProficiencyPoolSchema = z.object({
  source: z.literal('explicit'),
  skillIds: z.array(skillSchema).min(1),
})

const anySkillProficiencyPoolSchema = z.object({
  source: z.literal('any'),
})

export const skillProficiencyPoolSchema = z.discriminatedUnion('source', [
  explicitSkillProficiencyPoolSchema,
  anySkillProficiencyPoolSchema,
])

export type SkillProficiencyPool = z.infer<typeof skillProficiencyPoolSchema>

export const fixedSkillProficiencyGrantSchema = z.object({
  kind: z.literal('fixed'),
  skillIds: z.array(skillSchema).min(1),
})

export type FixedSkillProficiencyGrant = z.infer<typeof fixedSkillProficiencyGrantSchema>

export const skillProficiencyChoiceGrantSchema = contentPoolChoiceSchema
  .omit({ label: true })
  .extend({
    kind: z.literal('choice'),
    pool: skillProficiencyPoolSchema,
  })

export type SkillProficiencyChoiceGrant = z.infer<typeof skillProficiencyChoiceGrantSchema>

export const skillProficiencyGrantSchema = z.discriminatedUnion('kind', [
  fixedSkillProficiencyGrantSchema,
  skillProficiencyChoiceGrantSchema,
])

export type SkillProficiencyGrant = z.infer<typeof skillProficiencyGrantSchema>

// --- Armor training ---------------------------------------------------------

const explicitArmorTrainingPoolSchema = z.object({
  source: z.literal('explicit'),
  armorSlugs: z.array(z.string().min(1)).min(1),
})

const filteredArmorTrainingPoolSchema = z.object({
  source: z.literal('filtered'),
  armorCategory: armorCategorySchema.optional(),
})

export const armorTrainingPoolSchema = z.discriminatedUnion('source', [
  explicitArmorTrainingPoolSchema,
  filteredArmorTrainingPoolSchema,
])

export type ArmorTrainingPool = z.infer<typeof armorTrainingPoolSchema>

export const fixedArmorTrainingGrantSchema = z
  .object({
    kind: z.literal('fixed'),
    armorSlugs: z.array(z.string().min(1)).optional(),
    armorCategories: z.array(armorCategorySchema).optional(),
  })
  .superRefine((val, ctx) => {
    refineFixedSlugsOrCategories(
      { slugs: val.armorSlugs, categories: val.armorCategories },
      ctx,
      'armorSlugs',
    )
  })

export type FixedArmorTrainingGrant = z.infer<typeof fixedArmorTrainingGrantSchema>

export const armorTrainingChoiceGrantSchema = contentPoolChoiceSchema.omit({ label: true }).extend({
  kind: z.literal('choice'),
  pool: armorTrainingPoolSchema,
})

export type ArmorTrainingChoiceGrant = z.infer<typeof armorTrainingChoiceGrantSchema>

export const armorTrainingGrantSchema = z.discriminatedUnion('kind', [
  fixedArmorTrainingGrantSchema,
  armorTrainingChoiceGrantSchema,
])

export type ArmorTrainingGrant = z.infer<typeof armorTrainingGrantSchema>

// --- Formatters -------------------------------------------------------------

export function joinNaturalList(items: string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]!
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`
}

const WEAPON_PROFICIENCY_FORMS = {
  singular: 'weapon proficiency',
  plural: 'weapon proficiencies',
} as const

const TOOL_PROFICIENCY_FORMS = {
  singular: 'tool proficiency',
  plural: 'tool proficiencies',
} as const

const SKILL_PROFICIENCY_FORMS = {
  singular: 'skill proficiency',
  plural: 'skill proficiencies',
} as const

type ProficiencyForms = {
  readonly singular: string
  readonly plural: string
}

function proficiencyForm(forms: ProficiencyForms, count: number): string {
  return count === 1 ? forms.singular : forms.plural
}

function fallbackEntry(category: string): GameTermEntry {
  return { label: category, description: '' }
}

function armorProficiencyScopeForm(entry: GameTermEntry): string {
  return getTermLabelSingular(entry.label)
}

function formatAllCategoriesPhrase(
  categories: string[],
  getEntry: (category: string) => GameTermEntry | undefined,
  getScopeForm: (entry: GameTermEntry) => string = (entry) => getTermSentenceForm(entry, 2),
): string {
  const phrases = categories.map((category) =>
    getScopeForm(getEntry(category) ?? fallbackEntry(category)),
  )
  return joinNaturalList(phrases.map((phrase) => `all ${phrase}`))
}

/** Display label for a weapon proficiency choice pool. */
export function formatWeaponProficiencyPoolLabel(pool: WeaponProficiencyPool): string {
  if (pool.source === 'explicit') {
    return pool.weaponSlugs.join(', ')
  }
  if (pool.weaponCategory) {
    return getWeaponCategoryLabel(pool.weaponCategory)
  }
  return 'any weapon'
}

/** Display label for a tool proficiency choice pool. */
export function formatToolProficiencyPoolLabel(pool: ToolProficiencyPool): string {
  if (pool.source === 'explicit') {
    return pool.toolSlugs.join(', ')
  }
  if (pool.source === 'any') {
    return 'any tool'
  }
  if (pool.toolCategory) {
    return getToolCategoryLabel(pool.toolCategory)
  }
  return 'any tool'
}

/** Display label for a skill proficiency choice pool. */
export function formatSkillProficiencyPoolLabel(pool: SkillProficiencyPool): string {
  if (pool.source === 'any') {
    return 'any skill'
  }
  return pool.skillIds.map((id) => SKILLS[id]).join(', ')
}

/** Display label for an armor training choice pool. */
export function formatArmorTrainingPoolLabel(pool: ArmorTrainingPool): string {
  if (pool.source === 'explicit') {
    return pool.armorSlugs.join(', ')
  }
  if (pool.armorCategory) {
    return getArmorCategoryLabel(pool.armorCategory)
  }
  return 'any armor'
}

function formatFixedWeaponSentence(
  grant: FixedWeaponProficiencyGrant,
  resolveWeaponName?: (slug: string) => string | undefined,
): string {
  const hasSlugs = (grant.weaponSlugs?.length ?? 0) > 0
  const hasCategories = (grant.weaponCategories?.length ?? 0) > 0

  if (hasSlugs && !hasCategories) {
    const names = grant.weaponSlugs!.map((slug) => resolveWeaponName?.(slug) ?? slug)
    return `Character gains proficiency with ${joinNaturalList(names)}.`
  }

  if (hasCategories && !hasSlugs) {
    return `Character gains proficiency with ${formatAllCategoriesPhrase(
      grant.weaponCategories!,
      getWeaponCategoryEntry,
    )}.`
  }

  const parts: string[] = []
  if (hasSlugs) {
    const names = grant.weaponSlugs!.map((slug) => resolveWeaponName?.(slug) ?? slug)
    parts.push(joinNaturalList(names))
  }
  if (hasCategories) {
    parts.push(formatAllCategoriesPhrase(grant.weaponCategories!, getWeaponCategoryEntry))
  }
  return `Character gains proficiency with ${joinNaturalList(parts)}.`
}

function formatFixedToolSentence(
  grant: FixedToolProficiencyGrant,
  resolveToolName?: (slug: string) => string | undefined,
): string {
  const hasSlugs = (grant.toolSlugs?.length ?? 0) > 0
  const hasCategories = (grant.toolCategories?.length ?? 0) > 0

  if (hasSlugs && !hasCategories) {
    const names = grant.toolSlugs!.map((slug) => resolveToolName?.(slug) ?? slug)
    return `Character gains proficiency with ${joinNaturalList(names)}.`
  }

  if (hasCategories && !hasSlugs) {
    return `Character gains proficiency with ${formatAllCategoriesPhrase(
      grant.toolCategories!,
      getToolCategoryEntry,
    )}.`
  }

  const parts: string[] = []
  if (hasSlugs) {
    const names = grant.toolSlugs!.map((slug) => resolveToolName?.(slug) ?? slug)
    parts.push(joinNaturalList(names))
  }
  if (hasCategories) {
    parts.push(formatAllCategoriesPhrase(grant.toolCategories!, getToolCategoryEntry))
  }
  return `Character gains proficiency with ${joinNaturalList(parts)}.`
}

function formatFixedSkillSentence(grant: FixedSkillProficiencyGrant): string {
  const names = grant.skillIds.map((id) => SKILLS[id])
  return `Character gains proficiency in ${joinNaturalList(names)}.`
}

function formatFixedArmorSentence(
  grant: FixedArmorTrainingGrant,
  resolveArmorName?: (slug: string) => string | undefined,
): string {
  const hasSlugs = (grant.armorSlugs?.length ?? 0) > 0
  const hasCategories = (grant.armorCategories?.length ?? 0) > 0

  if (hasSlugs && !hasCategories) {
    const names = grant.armorSlugs!.map((slug) => resolveArmorName?.(slug) ?? slug)
    return `Character gains training with ${joinNaturalList(names)}.`
  }

  if (hasCategories && !hasSlugs) {
    return `Character gains training with ${formatAllCategoriesPhrase(
      grant.armorCategories!,
      getArmorCategoryEntry,
      armorProficiencyScopeForm,
    )}.`
  }

  const parts: string[] = []
  if (hasSlugs) {
    const names = grant.armorSlugs!.map((slug) => resolveArmorName?.(slug) ?? slug)
    parts.push(joinNaturalList(names))
  }
  if (hasCategories) {
    parts.push(
      formatAllCategoriesPhrase(
        grant.armorCategories!,
        getArmorCategoryEntry,
        armorProficiencyScopeForm,
      ),
    )
  }
  return `Character gains training with ${joinNaturalList(parts)}.`
}

function formatWeaponChoiceSentence(choose: number, pool: WeaponProficiencyPool): string {
  if (pool.source === 'filtered' && pool.weaponCategory) {
    return `Character chooses ${choose} ${proficiencyForm(
      WEAPON_PROFICIENCY_FORMS,
      choose,
    )} from ${getTermSentenceForm(
      getWeaponCategoryEntry(pool.weaponCategory) ?? fallbackEntry(pool.weaponCategory),
      2,
    )}.`
  }
  if (pool.source === 'explicit') {
    return `Character chooses ${choose} ${proficiencyForm(
      WEAPON_PROFICIENCY_FORMS,
      choose,
    )} from selected weapons.`
  }
  return `Character chooses ${choose} ${proficiencyForm(WEAPON_PROFICIENCY_FORMS, choose)}.`
}

function formatToolChoiceSentence(choose: number, pool: ToolProficiencyPool): string {
  if (pool.source === 'any') {
    return `Character chooses ${choose} ${proficiencyForm(
      TOOL_PROFICIENCY_FORMS,
      choose,
    )} from any tools.`
  }
  if (pool.source === 'filtered' && pool.toolCategory) {
    return `Character chooses ${choose} ${proficiencyForm(
      TOOL_PROFICIENCY_FORMS,
      choose,
    )} from ${getTermSentenceForm(
      getToolCategoryEntry(pool.toolCategory) ?? fallbackEntry(pool.toolCategory),
      2,
    )}.`
  }
  if (pool.source === 'explicit') {
    return `Character chooses ${choose} ${proficiencyForm(
      TOOL_PROFICIENCY_FORMS,
      choose,
    )} from selected tools.`
  }
  return `Character chooses ${choose} ${proficiencyForm(TOOL_PROFICIENCY_FORMS, choose)}.`
}

function formatSkillChoiceSentence(choose: number, pool: SkillProficiencyPool): string {
  if (pool.source === 'any') {
    return `Character chooses ${choose} ${proficiencyForm(
      SKILL_PROFICIENCY_FORMS,
      choose,
    )} from any skills.`
  }
  return `Character chooses ${choose} ${proficiencyForm(
    SKILL_PROFICIENCY_FORMS,
    choose,
  )} from selected skills.`
}

function formatArmorChoiceSentence(choose: number, pool: ArmorTrainingPool): string {
  if (pool.source === 'filtered' && pool.armorCategory) {
    return `Character chooses ${choose} armor training from ${armorProficiencyScopeForm(
      getArmorCategoryEntry(pool.armorCategory) ?? fallbackEntry(pool.armorCategory),
    )}.`
  }
  if (pool.source === 'explicit') {
    return `Character chooses ${choose} armor training from selected armor.`
  }
  return `Character chooses ${choose} armor training.`
}

/** Human-readable summary for weapon proficiency grant array item headers. */
export function formatWeaponProficiencyGrantSentence(
  grant: WeaponProficiencyGrant,
  resolveWeaponName?: (slug: string) => string | undefined,
): string {
  if (grant.kind === 'fixed') {
    return formatFixedWeaponSentence(grant, resolveWeaponName)
  }
  return formatWeaponChoiceSentence(grant.choose ?? 1, grant.pool)
}

/** Human-readable summary for tool proficiency grant array item headers. */
export function formatToolProficiencyGrantSentence(
  grant: ToolProficiencyGrant,
  resolveToolName?: (slug: string) => string | undefined,
): string {
  if (grant.kind === 'fixed') {
    return formatFixedToolSentence(grant, resolveToolName)
  }
  return formatToolChoiceSentence(grant.choose ?? 1, grant.pool)
}

/** Human-readable summary for skill proficiency grant array item headers. */
export function formatSkillProficiencyGrantSentence(grant: SkillProficiencyGrant): string {
  if (grant.kind === 'fixed') {
    return formatFixedSkillSentence(grant)
  }
  return formatSkillChoiceSentence(grant.choose ?? 1, grant.pool)
}

/** Human-readable summary for armor training grant array item headers. */
export function formatArmorTrainingGrantSentence(
  grant: ArmorTrainingGrant,
  resolveArmorName?: (slug: string) => string | undefined,
): string {
  if (grant.kind === 'fixed') {
    return formatFixedArmorSentence(grant, resolveArmorName)
  }
  return formatArmorChoiceSentence(grant.choose ?? 1, grant.pool)
}
