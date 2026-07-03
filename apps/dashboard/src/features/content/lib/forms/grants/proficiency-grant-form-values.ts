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
  formatArmorTrainingGrantSentence,
  formatArmorTrainingPoolLabel,
  formatSkillProficiencyGrantSentence,
  formatSkillProficiencyPoolLabel,
  formatToolProficiencyGrantSentence,
  formatToolProficiencyPoolLabel,
  formatWeaponProficiencyGrantSentence,
  formatWeaponProficiencyPoolLabel,
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

function formatExplicitPoolTitle(slugs: string[], options: FieldOption[]): string {
  const labels = slugs.map((slug) => options.find((option) => option.value === slug)?.label ?? slug)
  return labels.length <= 2 ? labels.join(', ') : `${labels.length} items`
}

function formatSkillPoolTitle(skillIds: string[]): string {
  const labels = skillIds.map((id) => SKILLS[id as keyof typeof SKILLS] ?? id)
  return labels.length <= 2 ? labels.join(', ') : `${labels.length} skills`
}

type WeaponProficiencyChoiceItemForm = Extract<WeaponProficiencyItemForm, { itemKind: 'choice' }>
type ToolProficiencyChoiceItemForm = Extract<ToolProficiencyItemForm, { itemKind: 'choice' }>
type SkillProficiencyChoiceItemForm = Extract<SkillProficiencyItemForm, { itemKind: 'choice' }>
type ArmorTrainingChoiceItemForm = Extract<ArmorTrainingItemForm, { itemKind: 'choice' }>

// --- Weapon -----------------------------------------------------------------

export function weaponProficiencyPoolToFormRow(
  pool: WeaponProficiencyPool,
): Pick<
  WeaponProficiencyChoiceItemForm,
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
  row: WeaponProficiencyChoiceItemForm,
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
  if (grant.kind === 'fixed') {
    return {
      itemKind: 'fixed',
      weaponProficiencySlugs: grant.weaponSlugs,
      weaponProficiencyCategories: grant.weaponCategories,
    }
  }

  return {
    itemKind: 'choice',
    choose: grant.choose,
    ...weaponProficiencyPoolToFormRow(grant.pool),
  }
}

export function weaponProficiencyGrantFromFormRow(
  row: WeaponProficiencyItemForm,
): WeaponProficiencyGrant {
  if (row.itemKind === 'fixed') {
    const grant: Extract<WeaponProficiencyGrant, { kind: 'fixed' }> = { kind: 'fixed' }
    if (row.weaponProficiencySlugs?.length) {
      grant.weaponSlugs = row.weaponProficiencySlugs
    }
    if (row.weaponProficiencyCategories?.length) {
      grant.weaponCategories = row.weaponProficiencyCategories
    }
    return grant
  }

  return {
    kind: 'choice',
    choose: row.choose ?? 1,
    pool: weaponProficiencyPoolFromFormRow(row),
  }
}

export function weaponProficiencyGrantTitle(
  row: WeaponProficiencyItemForm | undefined,
  index: number,
  weaponOptions: FieldOption[] = [],
): string {
  if (!row?.itemKind) return `Weapon proficiency ${index + 1}`

  if (row.itemKind === 'fixed') {
    const slugLabels = (row.weaponProficiencySlugs ?? []).map(
      (slug) => weaponOptions.find((option) => option.value === slug)?.label ?? slug,
    )
    const categoryLabels = row.weaponProficiencyCategories ?? []
    const parts = [...slugLabels, ...categoryLabels]
    if (!parts.length) return `Weapon proficiency ${index + 1}`
    return parts.length <= 2 ? parts.join(', ') : `${parts.length} proficiencies`
  }

  const choose = row.choose ?? 1
  const poolLabel =
    row.poolSource === 'explicit'
      ? formatExplicitPoolTitle(row.weaponProficiencyPoolSlugs ?? [], weaponOptions)
      : formatWeaponProficiencyPoolLabel(weaponProficiencyPoolFromFormRow(row))

  return `${poolLabel} — choose ${choose}`
}

export function weaponProficiencyGrantSummary(
  row: WeaponProficiencyItemForm | undefined,
  weaponOptions: FieldOption[] = [],
): string {
  if (!row?.itemKind) return ''

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
  ToolProficiencyChoiceItemForm,
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
  row: ToolProficiencyChoiceItemForm,
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
  if (grant.kind === 'fixed') {
    return {
      itemKind: 'fixed',
      toolProficiencySlugs: grant.toolSlugs,
      toolProficiencyCategories: grant.toolCategories,
    }
  }

  return {
    itemKind: 'choice',
    choose: grant.choose,
    ...toolProficiencyPoolToFormRow(grant.pool),
  }
}

export function toolProficiencyGrantFromFormRow(
  row: ToolProficiencyItemForm,
): ToolProficiencyGrant {
  if (row.itemKind === 'fixed') {
    const grant: Extract<ToolProficiencyGrant, { kind: 'fixed' }> = { kind: 'fixed' }
    if (row.toolProficiencySlugs?.length) {
      grant.toolSlugs = row.toolProficiencySlugs
    }
    if (row.toolProficiencyCategories?.length) {
      grant.toolCategories = row.toolProficiencyCategories
    }
    return grant
  }

  return {
    kind: 'choice',
    choose: row.choose ?? 1,
    pool: toolProficiencyPoolFromFormRow(row),
  }
}

export function toolProficiencyGrantTitle(
  row: ToolProficiencyItemForm | undefined,
  index: number,
  toolOptions: FieldOption[] = [],
): string {
  if (!row?.itemKind) return `Tool proficiency ${index + 1}`

  if (row.itemKind === 'fixed') {
    const slugLabels = (row.toolProficiencySlugs ?? []).map(
      (slug) => toolOptions.find((option) => option.value === slug)?.label ?? slug,
    )
    const categoryLabels = row.toolProficiencyCategories ?? []
    const parts = [...slugLabels, ...categoryLabels]
    if (!parts.length) return `Tool proficiency ${index + 1}`
    return parts.length <= 2 ? parts.join(', ') : `${parts.length} proficiencies`
  }

  const choose = row.choose ?? 1
  const poolLabel =
    row.poolSource === 'explicit'
      ? formatExplicitPoolTitle(row.toolProficiencyPoolSlugs ?? [], toolOptions)
      : formatToolProficiencyPoolLabel(toolProficiencyPoolFromFormRow(row))

  return `${poolLabel} — choose ${choose}`
}

export function toolProficiencyGrantSummary(
  row: ToolProficiencyItemForm | undefined,
  toolOptions: FieldOption[] = [],
): string {
  if (!row?.itemKind) return ''

  const resolveToolName = (slug: string) =>
    toolOptions.find((option) => option.value === slug)?.label

  return formatToolProficiencyGrantSentence(toolProficiencyGrantFromFormRow(row), resolveToolName)
}

// --- Skill ------------------------------------------------------------------

export function skillProficiencyPoolToFormRow(
  pool: SkillProficiencyPool,
): Pick<SkillProficiencyChoiceItemForm, 'poolSource' | 'skillProficiencyPoolIds'> {
  if (pool.source === 'any') {
    return { poolSource: 'any' }
  }

  return {
    poolSource: 'explicit',
    skillProficiencyPoolIds: pool.skillIds,
  }
}

export function skillProficiencyPoolFromFormRow(
  row: SkillProficiencyChoiceItemForm,
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
  if (grant.kind === 'fixed') {
    return {
      itemKind: 'fixed',
      skillProficiencyIds: grant.skillIds,
    }
  }

  return {
    itemKind: 'choice',
    choose: grant.choose,
    ...skillProficiencyPoolToFormRow(grant.pool),
  }
}

export function skillProficiencyGrantFromFormRow(
  row: SkillProficiencyItemForm,
): SkillProficiencyGrant {
  if (row.itemKind === 'fixed') {
    return {
      kind: 'fixed',
      skillIds: row.skillProficiencyIds ?? [],
    }
  }

  return {
    kind: 'choice',
    choose: row.choose ?? 1,
    pool: skillProficiencyPoolFromFormRow(row),
  }
}

export function skillProficiencyGrantTitle(
  row: SkillProficiencyItemForm | undefined,
  index: number,
): string {
  if (!row?.itemKind) return `Skill proficiency ${index + 1}`

  if (row.itemKind === 'fixed') {
    const ids = row.skillProficiencyIds ?? []
    if (!ids.length) return `Skill proficiency ${index + 1}`
    return formatSkillPoolTitle(ids)
  }

  const choose = row.choose ?? 1
  const poolLabel =
    row.poolSource === 'any'
      ? formatSkillProficiencyPoolLabel({ source: 'any' })
      : formatSkillPoolTitle(row.skillProficiencyPoolIds ?? [])

  return `${poolLabel} — choose ${choose}`
}

export function skillProficiencyGrantSummary(row: SkillProficiencyItemForm | undefined): string {
  if (!row?.itemKind) return ''
  return formatSkillProficiencyGrantSentence(skillProficiencyGrantFromFormRow(row))
}

// --- Armor training ---------------------------------------------------------

export function armorTrainingPoolToFormRow(
  pool: ArmorTrainingPool,
): Pick<
  ArmorTrainingChoiceItemForm,
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

export function armorTrainingPoolFromFormRow(row: ArmorTrainingChoiceItemForm): ArmorTrainingPool {
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
  if (grant.kind === 'fixed') {
    return {
      itemKind: 'fixed',
      armorTrainingSlugs: grant.armorSlugs,
      armorTrainingCategories: grant.armorCategories,
    }
  }

  return {
    itemKind: 'choice',
    choose: grant.choose,
    ...armorTrainingPoolToFormRow(grant.pool),
  }
}

export function armorTrainingGrantFromFormRow(row: ArmorTrainingItemForm): ArmorTrainingGrant {
  if (row.itemKind === 'fixed') {
    const grant: Extract<ArmorTrainingGrant, { kind: 'fixed' }> = { kind: 'fixed' }
    if (row.armorTrainingSlugs?.length) {
      grant.armorSlugs = row.armorTrainingSlugs
    }
    if (row.armorTrainingCategories?.length) {
      grant.armorCategories = row.armorTrainingCategories
    }
    return grant
  }

  return {
    kind: 'choice',
    choose: row.choose ?? 1,
    pool: armorTrainingPoolFromFormRow(row),
  }
}

export function armorTrainingGrantTitle(
  row: ArmorTrainingItemForm | undefined,
  index: number,
  armorOptions: FieldOption[] = [],
): string {
  if (!row?.itemKind) return `Armor training ${index + 1}`

  if (row.itemKind === 'fixed') {
    const slugLabels = (row.armorTrainingSlugs ?? []).map(
      (slug) => armorOptions.find((option) => option.value === slug)?.label ?? slug,
    )
    const categoryLabels = row.armorTrainingCategories ?? []
    const parts = [...slugLabels, ...categoryLabels]
    if (!parts.length) return `Armor training ${index + 1}`
    return parts.length <= 2 ? parts.join(', ') : `${parts.length} trainings`
  }

  const choose = row.choose ?? 1
  const poolLabel =
    row.poolSource === 'explicit'
      ? formatExplicitPoolTitle(row.armorTrainingPoolSlugs ?? [], armorOptions)
      : formatArmorTrainingPoolLabel(armorTrainingPoolFromFormRow(row))

  return `${poolLabel} — choose ${choose}`
}

export function armorTrainingGrantSummary(
  row: ArmorTrainingItemForm | undefined,
  armorOptions: FieldOption[] = [],
): string {
  if (!row?.itemKind) return ''

  const resolveArmorName = (slug: string) =>
    armorOptions.find((option) => option.value === slug)?.label

  return formatArmorTrainingGrantSentence(armorTrainingGrantFromFormRow(row), resolveArmorName)
}
