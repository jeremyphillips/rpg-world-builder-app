import type { z } from 'zod'

import { proficiencyGrantValidationMessages } from './proficiency-grant-form-fields'
import type { TOOL_PROFICIENCY_POOL_SOURCES } from './tool-proficiency-pool-form-fields'

export type ToolProficiencyPoolFormRow = {
  poolSource: (typeof TOOL_PROFICIENCY_POOL_SOURCES)[number]
  poolToolSlugs?: string[]
  poolToolCategories?: string[]
  poolFilteredToolSlugs?: string[]
  toolProficiencyPoolSlugs?: string[]
  toolProficiencyPoolCategories?: string[]
  toolProficiencyPoolFilteredToolSlugs?: string[]
}

type RefineToolPoolFormRowOptions = {
  slugPath: 'poolToolSlugs' | 'toolProficiencyPoolSlugs'
  categoriesPath: 'poolToolCategories' | 'toolProficiencyPoolCategories'
  filteredSlugsPath?: 'poolFilteredToolSlugs' | 'toolProficiencyPoolFilteredToolSlugs'
  skipWhenChooseZero?: boolean
  choose?: number
}

function refineExplicitToolPoolSlugs(
  row: ToolProficiencyPoolFormRow,
  ctx: z.RefinementCtx,
  slugPath: RefineToolPoolFormRowOptions['slugPath'],
): void {
  if (row.poolSource !== 'explicit' || row[slugPath]?.length) return

  ctx.addIssue({
    code: 'custom',
    message: proficiencyGrantValidationMessages.explicitPoolSlugsRequired(),
    path: [slugPath],
  })
}

function refineFilteredToolPoolTargets(
  row: ToolProficiencyPoolFormRow,
  ctx: z.RefinementCtx,
  categoriesPath: RefineToolPoolFormRowOptions['categoriesPath'],
  filteredSlugsPath: NonNullable<RefineToolPoolFormRowOptions['filteredSlugsPath']>,
): void {
  if (row.poolSource !== 'filtered') return

  const hasCategories = (row[categoriesPath]?.length ?? 0) > 0
  const hasSlugs = (row[filteredSlugsPath]?.length ?? 0) > 0
  if (hasCategories || hasSlugs) return

  ctx.addIssue({
    code: 'custom',
    message: proficiencyGrantValidationMessages.filteredPoolCategoriesRequired(),
    path: [categoriesPath],
  })
}

/** Shared Zod superRefine for tool proficiency pool form rows (grants + character creation). */
export function refineToolProficiencyPoolFormRow(
  row: ToolProficiencyPoolFormRow,
  ctx: z.RefinementCtx,
  options: RefineToolPoolFormRowOptions,
): void {
  if (options.skipWhenChooseZero && (options.choose ?? 0) <= 0) return

  refineExplicitToolPoolSlugs(row, ctx, options.slugPath)

  const filteredSlugsPath = options.filteredSlugsPath ?? 'toolProficiencyPoolFilteredToolSlugs'
  refineFilteredToolPoolTargets(row, ctx, options.categoriesPath, filteredSlugsPath)
}
