import type {
  ArmorTrainingGrant,
  ArmorTrainingPool,
  SkillProficiencyGrant,
  SkillProficiencyPool,
  ToolProficiencyGrant,
  ToolProficiencyPool,
  WeaponProficiencyGrant,
  WeaponProficiencyPool,
} from '@rpg/contracts'
import {
  categoryProficiencySingular,
  formatArmorTrainingGrantSentence,
  formatSkillProficiencyGrantSentence,
  formatToolProficiencyGrantSentence,
  formatWeaponProficiencyGrantSentence,
  getArmorCategoryLabel,
  getToolCategoryLabel,
  getWeaponCategoryLabel,
  SKILLS,
} from '@rpg/contracts'
import type { FieldOption } from '@rpg/ui/form'

import { PROFICIENCY_POOL_CATEGORY_ANY } from './proficiency-grant-form-fields'
import type {
  ArmorTrainingItemForm,
  SkillProficiencyItemForm,
  ToolProficiencyItemForm,
  WeaponProficiencyItemForm,
} from './proficiency-grant-form-fields'

function categoryFormValueToDomain(value: string | undefined): string | undefined {
  if (!value || value === PROFICIENCY_POOL_CATEGORY_ANY) return undefined
  return value
}

function joinList(items: string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]!
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`
}

function grantTypePrefix(grantLabel: string, detail: string): string {
  return `${grantLabel} — ${detail}`
}

type WeaponProficiencyPoolItemForm = Extract<
  WeaponProficiencyItemForm,
  { proficiencySource: 'pool' }
>
type ToolProficiencyPoolItemForm = Extract<ToolProficiencyItemForm, { proficiencySource: 'pool' }>
type SkillProficiencyPoolItemForm = Extract<SkillProficiencyItemForm, { proficiencySource: 'pool' }>
type ArmorTrainingPoolItemForm = Extract<ArmorTrainingItemForm, { proficiencySource: 'pool' }>

function weaponProficiencySourceFromGrant(
  grant: WeaponProficiencyGrant,
): WeaponProficiencyItemForm['proficiencySource'] {
  if (grant.kind === 'choice') return 'pool'
  if (grant.weaponCategories?.length && !grant.weaponSlugs?.length) return 'category'
  return 'specific'
}

function toolProficiencySourceFromGrant(
  grant: ToolProficiencyGrant,
): ToolProficiencyItemForm['proficiencySource'] {
  if (grant.kind === 'choice') return 'pool'
  if (grant.toolCategories?.length && !grant.toolSlugs?.length) return 'category'
  return 'specific'
}

function skillProficiencySourceFromGrant(
  grant: SkillProficiencyGrant,
): SkillProficiencyItemForm['proficiencySource'] {
  return grant.kind === 'choice' ? 'pool' : 'specific'
}

function armorTrainingSourceFromGrant(
  grant: ArmorTrainingGrant,
): ArmorTrainingItemForm['proficiencySource'] {
  if (grant.kind === 'choice') return 'pool'
  if (grant.armorCategories?.length && !grant.armorSlugs?.length) return 'category'
  return 'specific'
}

// --- Weapon -----------------------------------------------------------------

export function weaponProficiencyPoolToFormRow(
  pool: WeaponProficiencyPool,
): Pick<
  WeaponProficiencyPoolItemForm,
  'poolSource' | 'weaponProficiencyPoolSlugs' | 'weaponProficiencyPoolCategory'
> {
  if (pool.source === 'explicit') {
    return {
      poolSource: 'explicit',
      weaponProficiencyPoolSlugs: pool.weaponSlugs,
    }
  }

  return {
    poolSource: 'filtered',
    weaponProficiencyPoolCategory: pool.weaponCategory ?? PROFICIENCY_POOL_CATEGORY_ANY,
  }
}

export function weaponProficiencyPoolFromFormRow(
  row: WeaponProficiencyPoolItemForm,
): WeaponProficiencyPool {
  if (row.poolSource === 'explicit') {
    return {
      source: 'explicit',
      weaponSlugs: row.weaponProficiencyPoolSlugs ?? [],
    }
  }

  const weaponCategory = categoryFormValueToDomain(row.weaponProficiencyPoolCategory)
  const pool: Extract<WeaponProficiencyPool, { source: 'filtered' }> = { source: 'filtered' }
  if (weaponCategory) {
    pool.weaponCategory = weaponCategory as Extract<
      WeaponProficiencyPool,
      { source: 'filtered' }
    >['weaponCategory']
  }
  return pool
}

export function weaponProficiencyGrantToFormRow(
  grant: WeaponProficiencyGrant,
): WeaponProficiencyItemForm {
  const proficiencySource = weaponProficiencySourceFromGrant(grant)

  if (proficiencySource === 'pool') {
    if (grant.kind !== 'choice') {
      return { proficiencySource: 'specific', weaponProficiencySlugs: [] }
    }
    return {
      proficiencySource: 'pool',
      choose: grant.choose,
      ...weaponProficiencyPoolToFormRow(grant.pool),
    }
  }

  if (proficiencySource === 'category') {
    if (grant.kind !== 'fixed') {
      return { proficiencySource: 'category', weaponProficiencyCategories: [] }
    }
    return {
      proficiencySource: 'category',
      weaponProficiencyCategories: grant.weaponCategories ?? [],
    }
  }

  if (grant.kind !== 'fixed') {
    return { proficiencySource: 'specific', weaponProficiencySlugs: [] }
  }
  return {
    proficiencySource: 'specific',
    weaponProficiencySlugs: grant.weaponSlugs ?? [],
  }
}

export function weaponProficiencyGrantFromFormRow(
  row: WeaponProficiencyItemForm,
): WeaponProficiencyGrant {
  if (row.proficiencySource === 'pool') {
    return {
      kind: 'choice',
      choose: row.choose ?? 1,
      pool: weaponProficiencyPoolFromFormRow(row),
    }
  }

  if (row.proficiencySource === 'category') {
    return {
      kind: 'fixed',
      weaponCategories: row.weaponProficiencyCategories,
    }
  }

  return {
    kind: 'fixed',
    weaponSlugs: row.weaponProficiencySlugs,
  }
}

function weaponPoolTitleDetail(row: WeaponProficiencyPoolItemForm): string {
  const choose = row.choose ?? 1
  if (row.poolSource === 'filtered') {
    const category = categoryFormValueToDomain(row.weaponProficiencyPoolCategory)
    if (category) {
      const phrase = categoryProficiencySingular(getWeaponCategoryLabel(category))
      return `choose ${choose} ${phrase}`
    }
    return `choose ${choose} weapon proficiency`
  }
  if (row.poolSource === 'explicit') {
    return `choose ${choose} from selected weapons`
  }
  return `choose ${choose} weapon proficiency`
}

export function weaponProficiencyGrantTitle(
  row: WeaponProficiencyItemForm | undefined,
  index: number,
  weaponOptions: FieldOption[] = [],
): string {
  if (!row?.proficiencySource) return `Weapon proficiency ${index + 1}`

  if (row.proficiencySource === 'specific') {
    const labels = (row.weaponProficiencySlugs ?? []).map(
      (slug) => weaponOptions.find((option) => option.value === slug)?.label ?? slug,
    )
    if (!labels.length) return `Weapon proficiency ${index + 1}`
    const detail = labels.length <= 2 ? joinList(labels) : `${labels.length} weapons`
    return grantTypePrefix('Weapon proficiency', detail)
  }

  if (row.proficiencySource === 'category') {
    const labels = (row.weaponProficiencyCategories ?? []).map((category) =>
      getWeaponCategoryLabel(category),
    )
    if (!labels.length) return `Weapon proficiency ${index + 1}`
    const detail = labels.length <= 2 ? joinList(labels) : `${labels.length} categories`
    return grantTypePrefix('Weapon proficiency', detail)
  }

  return grantTypePrefix('Weapon proficiency', weaponPoolTitleDetail(row))
}

export function weaponProficiencyGrantSummary(
  row: WeaponProficiencyItemForm | undefined,
  weaponOptions: FieldOption[] = [],
): string {
  if (!row?.proficiencySource) return ''
  if (row.proficiencySource === 'specific' && !row.weaponProficiencySlugs?.length) return ''
  if (row.proficiencySource === 'category' && !row.weaponProficiencyCategories?.length) return ''

  const resolveWeaponName = (slug: string) =>
    weaponOptions.find((option) => option.value === slug)?.label

  return formatWeaponProficiencyGrantSentence(
    weaponProficiencyGrantFromFormRow(row),
    resolveWeaponName,
  )
}

// --- Tool -------------------------------------------------------------------

export function toolProficiencyPoolToFormRow(
  pool: ToolProficiencyPool,
): Pick<
  ToolProficiencyPoolItemForm,
  'poolSource' | 'toolProficiencyPoolSlugs' | 'toolProficiencyPoolCategory'
> {
  if (pool.source === 'explicit') {
    return {
      poolSource: 'explicit',
      toolProficiencyPoolSlugs: pool.toolSlugs,
    }
  }
  if (pool.source === 'any') {
    return { poolSource: 'any' }
  }

  return {
    poolSource: 'filtered',
    toolProficiencyPoolCategory: pool.toolCategory ?? PROFICIENCY_POOL_CATEGORY_ANY,
  }
}

export function toolProficiencyPoolFromFormRow(
  row: ToolProficiencyPoolItemForm,
): ToolProficiencyPool {
  if (row.poolSource === 'explicit') {
    return {
      source: 'explicit',
      toolSlugs: row.toolProficiencyPoolSlugs ?? [],
    }
  }
  if (row.poolSource === 'any') {
    return { source: 'any' }
  }

  const toolCategory = categoryFormValueToDomain(row.toolProficiencyPoolCategory)
  const pool: Extract<ToolProficiencyPool, { source: 'filtered' }> = { source: 'filtered' }
  if (toolCategory) {
    pool.toolCategory = toolCategory as Extract<
      ToolProficiencyPool,
      { source: 'filtered' }
    >['toolCategory']
  }
  return pool
}

export function toolProficiencyGrantToFormRow(
  grant: ToolProficiencyGrant,
): ToolProficiencyItemForm {
  const proficiencySource = toolProficiencySourceFromGrant(grant)

  if (proficiencySource === 'pool') {
    if (grant.kind !== 'choice') {
      return { proficiencySource: 'specific', toolProficiencySlugs: [] }
    }
    return {
      proficiencySource: 'pool',
      choose: grant.choose,
      ...toolProficiencyPoolToFormRow(grant.pool),
    }
  }

  if (proficiencySource === 'category') {
    if (grant.kind !== 'fixed') {
      return { proficiencySource: 'category', toolProficiencyCategories: [] }
    }
    return {
      proficiencySource: 'category',
      toolProficiencyCategories: grant.toolCategories ?? [],
    }
  }

  if (grant.kind !== 'fixed') {
    return { proficiencySource: 'specific', toolProficiencySlugs: [] }
  }

  return {
    proficiencySource: 'specific',
    toolProficiencySlugs: grant.toolSlugs ?? [],
  }
}

export function toolProficiencyGrantFromFormRow(
  row: ToolProficiencyItemForm,
): ToolProficiencyGrant {
  if (row.proficiencySource === 'pool') {
    return {
      kind: 'choice',
      choose: row.choose ?? 1,
      pool: toolProficiencyPoolFromFormRow(row),
    }
  }

  if (row.proficiencySource === 'category') {
    return {
      kind: 'fixed',
      toolCategories: row.toolProficiencyCategories,
    }
  }

  return {
    kind: 'fixed',
    toolSlugs: row.toolProficiencySlugs,
  }
}

function toolPoolTitleDetail(row: ToolProficiencyPoolItemForm): string {
  const choose = row.choose ?? 1
  if (row.poolSource === 'any') return `choose ${choose} from any tools`
  if (row.poolSource === 'filtered') {
    const category = categoryFormValueToDomain(row.toolProficiencyPoolCategory)
    if (category) {
      return `choose ${choose} ${categoryProficiencySingular(getToolCategoryLabel(category))}`
    }
    return `choose ${choose} tool proficiency`
  }
  return `choose ${choose} from selected tools`
}

export function toolProficiencyGrantTitle(
  row: ToolProficiencyItemForm | undefined,
  index: number,
  toolOptions: FieldOption[] = [],
): string {
  if (!row?.proficiencySource) return `Tool proficiency ${index + 1}`

  if (row.proficiencySource === 'specific') {
    const labels = (row.toolProficiencySlugs ?? []).map(
      (slug) => toolOptions.find((option) => option.value === slug)?.label ?? slug,
    )
    if (!labels.length) return `Tool proficiency ${index + 1}`
    const detail = labels.length <= 2 ? joinList(labels) : `${labels.length} tools`
    return grantTypePrefix('Tool proficiency', detail)
  }

  if (row.proficiencySource === 'category') {
    const labels = (row.toolProficiencyCategories ?? []).map((category) =>
      getToolCategoryLabel(category),
    )
    if (!labels.length) return `Tool proficiency ${index + 1}`
    const detail = labels.length <= 2 ? joinList(labels) : `${labels.length} categories`
    return grantTypePrefix('Tool proficiency', detail)
  }

  return grantTypePrefix('Tool proficiency', toolPoolTitleDetail(row))
}

export function toolProficiencyGrantSummary(
  row: ToolProficiencyItemForm | undefined,
  toolOptions: FieldOption[] = [],
): string {
  if (!row?.proficiencySource) return ''
  if (row.proficiencySource === 'specific' && !row.toolProficiencySlugs?.length) return ''
  if (row.proficiencySource === 'category' && !row.toolProficiencyCategories?.length) return ''

  const resolveToolName = (slug: string) =>
    toolOptions.find((option) => option.value === slug)?.label

  return formatToolProficiencyGrantSentence(toolProficiencyGrantFromFormRow(row), resolveToolName)
}

// --- Skill ------------------------------------------------------------------

export function skillProficiencyPoolToFormRow(
  pool: SkillProficiencyPool,
): Pick<SkillProficiencyPoolItemForm, 'poolSource' | 'skillProficiencyPoolIds'> {
  if (pool.source === 'any') {
    return { poolSource: 'any' }
  }

  return {
    poolSource: 'explicit',
    skillProficiencyPoolIds: pool.skillIds,
  }
}

export function skillProficiencyPoolFromFormRow(
  row: SkillProficiencyPoolItemForm,
): SkillProficiencyPool {
  if (row.poolSource === 'any') {
    return { source: 'any' }
  }

  return {
    source: 'explicit',
    skillIds: row.skillProficiencyPoolIds ?? [],
  }
}

export function skillProficiencyGrantToFormRow(
  grant: SkillProficiencyGrant,
): SkillProficiencyItemForm {
  const proficiencySource = skillProficiencySourceFromGrant(grant)

  if (proficiencySource === 'pool') {
    if (grant.kind !== 'choice') {
      return { proficiencySource: 'specific', skillProficiencyIds: [] }
    }
    return {
      proficiencySource: 'pool',
      choose: grant.choose,
      ...skillProficiencyPoolToFormRow(grant.pool),
    }
  }

  if (grant.kind !== 'fixed') {
    return { proficiencySource: 'specific', skillProficiencyIds: [] }
  }

  return {
    proficiencySource: 'specific',
    skillProficiencyIds: grant.skillIds,
  }
}

export function skillProficiencyGrantFromFormRow(
  row: SkillProficiencyItemForm,
): SkillProficiencyGrant {
  if (row.proficiencySource === 'pool') {
    return {
      kind: 'choice',
      choose: row.choose ?? 1,
      pool: skillProficiencyPoolFromFormRow(row),
    }
  }

  return {
    kind: 'fixed',
    skillIds: row.skillProficiencyIds ?? [],
  }
}

function formatSkillPoolTitle(skillIds: string[]): string {
  const labels = skillIds.map((id) => SKILLS[id as keyof typeof SKILLS] ?? id)
  return labels.length <= 2 ? joinList(labels) : `${labels.length} skills`
}

function skillPoolTitleDetail(row: SkillProficiencyPoolItemForm): string {
  const choose = row.choose ?? 1
  if (row.poolSource === 'any') return `choose ${choose} from any skills`
  const ids = row.skillProficiencyPoolIds ?? []
  if (!ids.length) return `choose ${choose} skill proficiency`
  return `choose ${choose} from ${formatSkillPoolTitle(ids)}`
}

export function skillProficiencyGrantTitle(
  row: SkillProficiencyItemForm | undefined,
  index: number,
): string {
  if (!row?.proficiencySource) return `Skill proficiency ${index + 1}`

  if (row.proficiencySource === 'specific') {
    const ids = row.skillProficiencyIds ?? []
    if (!ids.length) return `Skill proficiency ${index + 1}`
    return grantTypePrefix('Skill proficiency', formatSkillPoolTitle(ids))
  }

  return grantTypePrefix('Skill proficiency', skillPoolTitleDetail(row))
}

export function skillProficiencyGrantSummary(row: SkillProficiencyItemForm | undefined): string {
  if (!row?.proficiencySource) return ''
  if (row.proficiencySource === 'specific' && !row.skillProficiencyIds?.length) return ''
  return formatSkillProficiencyGrantSentence(skillProficiencyGrantFromFormRow(row))
}

// --- Armor training ---------------------------------------------------------

export function armorTrainingPoolToFormRow(
  pool: ArmorTrainingPool,
): Pick<
  ArmorTrainingPoolItemForm,
  'poolSource' | 'armorTrainingPoolSlugs' | 'armorTrainingPoolCategory'
> {
  if (pool.source === 'explicit') {
    return {
      poolSource: 'explicit',
      armorTrainingPoolSlugs: pool.armorSlugs,
    }
  }

  return {
    poolSource: 'filtered',
    armorTrainingPoolCategory: pool.armorCategory ?? PROFICIENCY_POOL_CATEGORY_ANY,
  }
}

export function armorTrainingPoolFromFormRow(row: ArmorTrainingPoolItemForm): ArmorTrainingPool {
  if (row.poolSource === 'explicit') {
    return {
      source: 'explicit',
      armorSlugs: row.armorTrainingPoolSlugs ?? [],
    }
  }

  const armorCategory = categoryFormValueToDomain(row.armorTrainingPoolCategory)
  const pool: Extract<ArmorTrainingPool, { source: 'filtered' }> = { source: 'filtered' }
  if (armorCategory) {
    pool.armorCategory = armorCategory as Extract<
      ArmorTrainingPool,
      { source: 'filtered' }
    >['armorCategory']
  }
  return pool
}

export function armorTrainingGrantToFormRow(grant: ArmorTrainingGrant): ArmorTrainingItemForm {
  const proficiencySource = armorTrainingSourceFromGrant(grant)

  if (proficiencySource === 'pool') {
    if (grant.kind !== 'choice') {
      return { proficiencySource: 'specific', armorTrainingSlugs: [] }
    }
    return {
      proficiencySource: 'pool',
      choose: grant.choose,
      ...armorTrainingPoolToFormRow(grant.pool),
    }
  }

  if (proficiencySource === 'category') {
    if (grant.kind !== 'fixed') {
      return { proficiencySource: 'category', armorTrainingCategories: [] }
    }
    return {
      proficiencySource: 'category',
      armorTrainingCategories: grant.armorCategories ?? [],
    }
  }

  if (grant.kind !== 'fixed') {
    return { proficiencySource: 'specific', armorTrainingSlugs: [] }
  }

  return {
    proficiencySource: 'specific',
    armorTrainingSlugs: grant.armorSlugs ?? [],
  }
}

export function armorTrainingGrantFromFormRow(row: ArmorTrainingItemForm): ArmorTrainingGrant {
  if (row.proficiencySource === 'pool') {
    return {
      kind: 'choice',
      choose: row.choose ?? 1,
      pool: armorTrainingPoolFromFormRow(row),
    }
  }

  if (row.proficiencySource === 'category') {
    return {
      kind: 'fixed',
      armorCategories: row.armorTrainingCategories,
    }
  }

  return {
    kind: 'fixed',
    armorSlugs: row.armorTrainingSlugs,
  }
}

function armorPoolTitleDetail(row: ArmorTrainingPoolItemForm): string {
  const choose = row.choose ?? 1
  if (row.poolSource === 'filtered') {
    const category = categoryFormValueToDomain(row.armorTrainingPoolCategory)
    if (category) {
      return `choose ${choose} ${categoryProficiencySingular(getArmorCategoryLabel(category))}`
    }
    return `choose ${choose} armor training`
  }
  return `choose ${choose} from selected armor`
}

export function armorTrainingGrantTitle(
  row: ArmorTrainingItemForm | undefined,
  index: number,
  armorOptions: FieldOption[] = [],
): string {
  if (!row?.proficiencySource) return `Armor training ${index + 1}`

  if (row.proficiencySource === 'specific') {
    const labels = (row.armorTrainingSlugs ?? []).map(
      (slug) => armorOptions.find((option) => option.value === slug)?.label ?? slug,
    )
    if (!labels.length) return `Armor training ${index + 1}`
    const detail = labels.length <= 2 ? joinList(labels) : `${labels.length} armor`
    return grantTypePrefix('Armor training', detail)
  }

  if (row.proficiencySource === 'category') {
    const labels = (row.armorTrainingCategories ?? []).map((category) =>
      getArmorCategoryLabel(category),
    )
    if (!labels.length) return `Armor training ${index + 1}`
    const detail = labels.length <= 2 ? joinList(labels) : `${labels.length} categories`
    return grantTypePrefix('Armor training', detail)
  }

  return grantTypePrefix('Armor training', armorPoolTitleDetail(row))
}

export function armorTrainingGrantSummary(
  row: ArmorTrainingItemForm | undefined,
  armorOptions: FieldOption[] = [],
): string {
  if (!row?.proficiencySource) return ''
  if (row.proficiencySource === 'specific' && !row.armorTrainingSlugs?.length) return ''
  if (row.proficiencySource === 'category' && !row.armorTrainingCategories?.length) return ''

  const resolveArmorName = (slug: string) =>
    armorOptions.find((option) => option.value === slug)?.label

  return formatArmorTrainingGrantSentence(armorTrainingGrantFromFormRow(row), resolveArmorName)
}
