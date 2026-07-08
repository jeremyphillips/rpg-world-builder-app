import { z } from 'zod'

import {
  armorCategorySchema,
  getArmorCategoryCompactLabel,
  getArmorCategoryLabel,
  getArmorCategoryScopeForm,
  getArmorCategorySentenceForm,
} from '../../vocab/armor/category'
import {
  getToolCategoryLabel,
  getToolCategorySentenceForm,
  toolCategorySchema,
} from '../../vocab/equipment/tool-category'
import { formatVocabularySlugLabel } from '../../vocab/format-slug-label'
import {
  getArmorTrainingCompactSuffix,
  getProficiencyGrantCompactSuffix,
  getProficiencyDomainSentenceForm,
  getProficiencyPoolAnyLabel,
  getProficiencyPoolAnyScopePhrase,
  getProficiencyPoolSelectedPhrase,
} from '../../vocab/proficiency'
import {
  getWeaponCategoryCompactLabel,
  getWeaponCategoryLabel,
  getWeaponCategorySentenceForm,
  weaponCategorySchema,
} from '../../vocab/weapon/category'
import { getSkillName, getSkillSentenceForm, skillSchema } from '../skill-proficiency'
import { contentPoolChoiceSchema } from './choice'
import { grantValidationMessages } from './grant-messages'

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
      message: grantValidationMessages.fixedProficiencyRequiresTarget(),
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

function formatAllCategoriesPhrase(
  categories: string[],
  getSentenceForm: (category: string, count: number) => string,
): string {
  const phrases = categories.map((category) => getSentenceForm(category, 2))
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
  return getProficiencyPoolAnyLabel('weapon')
}

/** Display label for a tool proficiency choice pool. */
export function formatToolProficiencyPoolLabel(pool: ToolProficiencyPool): string {
  if (pool.source === 'explicit') {
    return pool.toolSlugs.join(', ')
  }
  if (pool.source === 'any') {
    return getProficiencyPoolAnyLabel('tool')
  }
  if (pool.toolCategory) {
    return getToolCategoryLabel(pool.toolCategory)
  }
  return getProficiencyPoolAnyLabel('tool')
}

/** Display label for a skill proficiency choice pool. */
export function formatSkillProficiencyPoolLabel(pool: SkillProficiencyPool): string {
  if (pool.source === 'any') {
    return getProficiencyPoolAnyLabel('skill')
  }
  return pool.skillIds.map((id) => getSkillName(id)).join(', ')
}

/** Display label for an armor training choice pool. */
export function formatArmorTrainingPoolLabel(pool: ArmorTrainingPool): string {
  if (pool.source === 'explicit') {
    return pool.armorSlugs.join(', ')
  }
  if (pool.armorCategory) {
    return getArmorCategoryLabel(pool.armorCategory)
  }
  return getProficiencyPoolAnyLabel('armor')
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
      getWeaponCategorySentenceForm,
    )}.`
  }

  const parts: string[] = []
  if (hasSlugs) {
    const names = grant.weaponSlugs!.map((slug) => resolveWeaponName?.(slug) ?? slug)
    parts.push(joinNaturalList(names))
  }
  if (hasCategories) {
    parts.push(formatAllCategoriesPhrase(grant.weaponCategories!, getWeaponCategorySentenceForm))
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
      getToolCategorySentenceForm,
    )}.`
  }

  const parts: string[] = []
  if (hasSlugs) {
    const names = grant.toolSlugs!.map((slug) => resolveToolName?.(slug) ?? slug)
    parts.push(joinNaturalList(names))
  }
  if (hasCategories) {
    parts.push(formatAllCategoriesPhrase(grant.toolCategories!, getToolCategorySentenceForm))
  }
  return `Character gains proficiency with ${joinNaturalList(parts)}.`
}

function formatFixedSkillSentence(
  grant: FixedSkillProficiencyGrant,
  resolveSkillName?: (id: string) => string | undefined,
): string {
  const names = grant.skillIds.map((id) => getSkillSentenceForm(id, 1, resolveSkillName?.(id)))
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
      getArmorCategorySentenceForm,
    )}.`
  }

  const parts: string[] = []
  if (hasSlugs) {
    const names = grant.armorSlugs!.map((slug) => resolveArmorName?.(slug) ?? slug)
    parts.push(joinNaturalList(names))
  }
  if (hasCategories) {
    parts.push(formatAllCategoriesPhrase(grant.armorCategories!, getArmorCategorySentenceForm))
  }
  return `Character gains training with ${joinNaturalList(parts)}.`
}

function formatWeaponChoiceSentence(choose: number, pool: WeaponProficiencyPool): string {
  if (pool.source === 'filtered' && pool.weaponCategory) {
    return `Character chooses ${choose} ${getProficiencyDomainSentenceForm('weapon', choose)} from ${getWeaponCategorySentenceForm(pool.weaponCategory, 2)}.`
  }
  if (pool.source === 'explicit') {
    return `Character chooses ${choose} ${getProficiencyDomainSentenceForm('weapon', choose)} from ${getProficiencyPoolSelectedPhrase('weapon')}.`
  }
  return `Character chooses ${choose} ${getProficiencyDomainSentenceForm('weapon', choose)}.`
}

function formatToolChoiceSentence(choose: number, pool: ToolProficiencyPool): string {
  if (pool.source === 'any') {
    return `Character chooses ${choose} ${getProficiencyDomainSentenceForm('tool', choose)} from ${getProficiencyPoolAnyScopePhrase('tool')}.`
  }
  if (pool.source === 'filtered' && pool.toolCategory) {
    return `Character chooses ${choose} ${getProficiencyDomainSentenceForm('tool', choose)} from ${getToolCategorySentenceForm(pool.toolCategory, 2)}.`
  }
  if (pool.source === 'explicit') {
    return `Character chooses ${choose} ${getProficiencyDomainSentenceForm('tool', choose)} from ${getProficiencyPoolSelectedPhrase('tool')}.`
  }
  return `Character chooses ${choose} ${getProficiencyDomainSentenceForm('tool', choose)}.`
}

function formatSkillChoiceSentence(choose: number, pool: SkillProficiencyPool): string {
  if (pool.source === 'any') {
    return `Character chooses ${choose} ${getProficiencyDomainSentenceForm('skill', choose)} from ${getProficiencyPoolAnyScopePhrase('skill')}.`
  }
  return `Character chooses ${choose} ${getProficiencyDomainSentenceForm('skill', choose)} from ${getProficiencyPoolSelectedPhrase('skill')}.`
}

function formatArmorChoiceSentence(choose: number, pool: ArmorTrainingPool): string {
  if (pool.source === 'filtered' && pool.armorCategory) {
    return `Character chooses ${choose} ${getProficiencyDomainSentenceForm('armor', choose)} from ${getArmorCategoryScopeForm(pool.armorCategory)}.`
  }
  if (pool.source === 'explicit') {
    return `Character chooses ${choose} ${getProficiencyDomainSentenceForm('armor', choose)} from ${getProficiencyPoolSelectedPhrase('armor')}.`
  }
  return `Character chooses ${choose} ${getProficiencyDomainSentenceForm('armor', choose)}.`
}

function formatCompactListSuffix(
  labels: string[],
  kind: 'weapon' | 'tool' | 'skill' | 'armor',
): string | undefined {
  if (labels.length === 0) return undefined
  if (kind === 'armor') {
    const suffix = getArmorTrainingCompactSuffix()
    if (labels.length === 1) return `${labels[0]} ${suffix}`
    return `${labels.join(', ')} ${suffix}`
  }
  const suffix = getProficiencyGrantCompactSuffix(labels.length)
  if (labels.length === 1) return `${labels[0]} ${suffix}`
  return `${labels.join(', ')} ${suffix}`
}

function collectFixedWeaponCompactLabels(
  grant: FixedWeaponProficiencyGrant,
  resolveWeaponName?: (slug: string) => string | undefined,
): string[] {
  const labels: string[] = []
  grant.weaponSlugs?.forEach((slug) => {
    labels.push(resolveWeaponName?.(slug) ?? formatVocabularySlugLabel(slug))
  })
  grant.weaponCategories?.forEach((category) => {
    labels.push(getWeaponCategoryCompactLabel(category))
  })
  return labels
}

function collectFixedToolCompactLabels(
  grant: FixedToolProficiencyGrant,
  resolveToolName?: (slug: string) => string | undefined,
): string[] {
  const labels: string[] = []
  grant.toolSlugs?.forEach((slug) => {
    labels.push(resolveToolName?.(slug) ?? formatVocabularySlugLabel(slug))
  })
  grant.toolCategories?.forEach((category) => {
    labels.push(getToolCategoryLabel(category))
  })
  return labels
}

function collectFixedArmorCompactLabels(
  grant: FixedArmorTrainingGrant,
  resolveArmorName?: (slug: string) => string | undefined,
): string[] {
  const labels: string[] = []
  grant.armorSlugs?.forEach((slug) => {
    labels.push(resolveArmorName?.(slug) ?? formatVocabularySlugLabel(slug))
  })
  grant.armorCategories?.forEach((category) => {
    labels.push(getArmorCategoryCompactLabel(category))
  })
  return labels
}

/** Compact summary label: "Simple weapons proficiency", "Longsword, Rapier proficiencies", etc. */
export function formatWeaponProficiencyGrantCompact(
  grant: WeaponProficiencyGrant,
  resolveWeaponName?: (slug: string) => string | undefined,
): string | undefined {
  if (grant.kind !== 'fixed') return undefined
  return formatCompactListSuffix(
    collectFixedWeaponCompactLabels(grant, resolveWeaponName),
    'weapon',
  )
}

/** Compact summary label: "Thieves' Tools proficiency", "Gaming Set, Lute proficiencies", etc. */
export function formatToolProficiencyGrantCompact(
  grant: ToolProficiencyGrant,
  resolveToolName?: (slug: string) => string | undefined,
): string | undefined {
  if (grant.kind !== 'fixed') return undefined
  return formatCompactListSuffix(collectFixedToolCompactLabels(grant, resolveToolName), 'tool')
}

/** Compact summary label: "Athletics proficiency", "Athletics, Stealth proficiencies", etc. */
export function formatSkillProficiencyGrantCompact(
  grant: SkillProficiencyGrant,
  resolveSkillName?: (id: string) => string | undefined,
): string | undefined {
  if (grant.kind !== 'fixed') return undefined
  const labels = grant.skillIds.map((id) => resolveSkillName?.(id) ?? getSkillName(id))
  return formatCompactListSuffix(labels, 'skill')
}

/** Compact summary label: "Light armor training", "Light armor, Medium armor training", etc. */
export function formatArmorTrainingGrantCompact(
  grant: ArmorTrainingGrant,
  resolveArmorName?: (slug: string) => string | undefined,
): string | undefined {
  if (grant.kind !== 'fixed') return undefined
  return formatCompactListSuffix(collectFixedArmorCompactLabels(grant, resolveArmorName), 'armor')
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
export function formatSkillProficiencyGrantSentence(
  grant: SkillProficiencyGrant,
  resolveSkillName?: (id: string) => string | undefined,
): string {
  if (grant.kind === 'fixed') {
    return formatFixedSkillSentence(grant, resolveSkillName)
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
