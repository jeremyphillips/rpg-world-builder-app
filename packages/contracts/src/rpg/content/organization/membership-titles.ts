import { z } from 'zod'
import { addCustomRefinementIssue } from '../../../lib/add-custom-refinement-issue'

import { MAX_CHARACTER_LEVEL } from '../../primitives/level'
import {
  ORGANIZATION_AUTHORING_PRESETS,
  ORGANIZATION_AUTHORING_PRESET_IDS,
  type OrganizationAuthoringPresetId,
} from '../../vocab/organization/authoring-preset'
import { npcAuthoringTemplateIdSchema } from '../../vocab/organization/npc-authoring-template'
import { ORGANIZATION_MEMBERSHIP_TITLE_PRIORITIES } from '../../vocab/organization/member-title-entry'
import type { OrganizationMembershipTitlePriority } from '../../vocab/organization/member-title-entry'
import {
  getOrganizationMembershipTitleEntry,
  type OrganizationMembershipTitleId,
} from '../../vocab/organization/membership-title'
import { comparePriorityDescending } from '../../vocab/types'
import { vocabularyOptionIdSchema } from '../../vocab/vocabulary'

const organizationAuthoringPresetIdSchema = z.enum(
  ORGANIZATION_AUTHORING_PRESET_IDS as [
    OrganizationAuthoringPresetId,
    ...OrganizationAuthoringPresetId[],
  ],
)

export const ORGANIZATION_MEMBERSHIP_TITLE_ID_PREFIX = 'omt_' as const

export const ORGANIZATION_DEFAULT_MEMBERSHIP_TITLE_LABEL = 'Member' as const

type GlobalWithWebCrypto = typeof globalThis & {
  crypto?: {
    randomUUID?: () => string
  }
}

function createDefaultOrganizationMembershipTitleUuid(): string {
  const cryptoApi = (globalThis as GlobalWithWebCrypto).crypto
  if (typeof cryptoApi?.randomUUID === 'function') {
    return cryptoApi.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function createOrganizationMembershipTitleId(
  createId: () => string = createDefaultOrganizationMembershipTitleUuid,
): string {
  return `${ORGANIZATION_MEMBERSHIP_TITLE_ID_PREFIX}${createId()}`
}

export function createDefaultOrganizationMembershipTitleDefinition(
  createId: () => string = createDefaultOrganizationMembershipTitleUuid,
): OrganizationMembershipTitleDefinition {
  return {
    id: createOrganizationMembershipTitleId(createId),
    label: ORGANIZATION_DEFAULT_MEMBERSHIP_TITLE_LABEL,
    priority: ORGANIZATION_MEMBERSHIP_TITLE_PRIORITIES[4],
  }
}

export const organizationMembershipTitlePrioritySchema = z.union([
  z.literal(ORGANIZATION_MEMBERSHIP_TITLE_PRIORITIES[0]),
  z.literal(ORGANIZATION_MEMBERSHIP_TITLE_PRIORITIES[1]),
  z.literal(ORGANIZATION_MEMBERSHIP_TITLE_PRIORITIES[2]),
  z.literal(ORGANIZATION_MEMBERSHIP_TITLE_PRIORITIES[3]),
  z.literal(ORGANIZATION_MEMBERSHIP_TITLE_PRIORITIES[4]),
])

export const organizationPresetNpcRecommendationSchema = z.object({
  templateId: npcAuthoringTemplateIdSchema,
  level: z.number().int().min(0).max(MAX_CHARACTER_LEVEL),
})

export type OrganizationPresetNpcRecommendation = z.infer<
  typeof organizationPresetNpcRecommendationSchema
>

export const organizationMembershipTitleIdSchema = z
  .string()
  .min(1)
  .refine((id) => id.startsWith(ORGANIZATION_MEMBERSHIP_TITLE_ID_PREFIX), {
    message: 'Organization membership title id must use the omt_ prefix.',
  })

export const organizationMembershipTitleDefinitionSchema = z.object({
  id: organizationMembershipTitleIdSchema,
  sourceTitleId: vocabularyOptionIdSchema.optional(),
  label: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1).optional(),
  priority: organizationMembershipTitlePrioritySchema,
  npcRecommendation: organizationPresetNpcRecommendationSchema.optional(),
})

export type OrganizationMembershipTitleDefinition = z.infer<
  typeof organizationMembershipTitleDefinitionSchema
>

export function normalizeOrganizationMembershipTitleLabel(label: string): string {
  return label.trim().toLocaleLowerCase('en')
}

function validateUniqueOrganizationMembershipTitleDefinitions(
  titles: readonly OrganizationMembershipTitleDefinition[],
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = [],
): void {
  const seenIds = new Set<string>()
  const seenLabels = new Set<string>()

  titles.forEach((title, index) => {
    const path = [...pathPrefix, index]
    if (seenIds.has(title.id)) {
      addCustomRefinementIssue(
        ctx,
        'Organization membership title ids must be unique within an organization.',
        [...path, 'id'],
      )
    } else {
      seenIds.add(title.id)
    }

    const normalizedLabel = normalizeOrganizationMembershipTitleLabel(title.label)
    if (seenLabels.has(normalizedLabel)) {
      addCustomRefinementIssue(
        ctx,
        'Organization membership title labels must be unique within an organization.',
        [...path, 'label'],
      )
    } else {
      seenLabels.add(normalizedLabel)
    }
  })
}

const organizationMembershipTitleCatalogEntriesSchema = z
  .array(organizationMembershipTitleDefinitionSchema)
  .superRefine((titles, ctx) => {
    validateUniqueOrganizationMembershipTitleDefinitions(titles, ctx)
  })

export const organizationMembershipTitlesSchema =
  organizationMembershipTitleCatalogEntriesSchema.min(
    1,
    'Organization must have at least one membership title.',
  )

export function snapshotOrganizationMembershipTitlesFromPreset(
  presetId: OrganizationAuthoringPresetId,
  createId: () => string = createDefaultOrganizationMembershipTitleUuid,
): OrganizationMembershipTitleDefinition[] {
  const preset = ORGANIZATION_AUTHORING_PRESETS[presetId]
  return preset.members.titles.map((ref) => {
    const entry = getOrganizationMembershipTitleEntry(ref.titleId)
    if (!entry) {
      throw new Error(`Unknown organization membership title id: ${ref.titleId}`)
    }
    return {
      id: createOrganizationMembershipTitleId(createId),
      sourceTitleId: ref.titleId satisfies OrganizationMembershipTitleId,
      label: entry.label,
      description: entry.description,
      priority: ref.priority as OrganizationMembershipTitlePriority,
      ...(ref.npcRecommendation !== undefined ? { npcRecommendation: ref.npcRecommendation } : {}),
    }
  })
}

/** Automatic picker default only when the catalog has exactly one title. */
export function resolveSoleOrganizationMembershipTitleId(
  titles: readonly OrganizationMembershipTitleDefinition[],
): string | undefined {
  if (titles.length !== 1) {
    return undefined
  }
  return titles[0]?.id
}

/** Resolves membership titles for organization create — materializes Member when absent. */
export function resolveOrganizationCreateMembershipTitles(input: {
  titles?: readonly OrganizationMembershipTitleDefinition[]
}): OrganizationMembershipTitleDefinition[] {
  const titles = [...(input.titles ?? [])]
  if (titles.length === 0) {
    return organizationMembershipTitlesSchema.parse([
      createDefaultOrganizationMembershipTitleDefinition(),
    ])
  }
  return organizationMembershipTitlesSchema.parse(titles)
}

export function findRemovedOrganizationMembershipTitleIds(input: {
  previousCatalog: readonly OrganizationMembershipTitleDefinition[]
  nextCatalog: readonly OrganizationMembershipTitleDefinition[]
}): string[] {
  const nextIds = new Set(input.nextCatalog.map((title) => title.id))
  return input.previousCatalog.filter((title) => !nextIds.has(title.id)).map((title) => title.id)
}

export function sortOrganizationMembershipTitleDefinitionsForDisplay<
  T extends OrganizationMembershipTitleDefinition,
>(titles: readonly T[]): T[] {
  return titles
    .map((title, index) => ({ title, index }))
    .sort((left, right) => {
      const priorityCompare = comparePriorityDescending(
        { priority: left.title.priority },
        { priority: right.title.priority },
      )
      if (priorityCompare !== 0) return priorityCompare
      return left.index - right.index
    })
    .map(({ title }) => title)
}

type OrganizationMembershipTitleSemanticRow = {
  normalizedLabel: string
  priority: OrganizationMembershipTitlePriority
  sourceTitleId?: string
}

function organizationMembershipTitleSemanticRows(
  catalog: readonly OrganizationMembershipTitleDefinition[],
): OrganizationMembershipTitleSemanticRow[] {
  return catalog.map((row) => ({
    normalizedLabel: normalizeOrganizationMembershipTitleLabel(row.label),
    priority: row.priority,
    ...(row.sourceTitleId !== undefined ? { sourceTitleId: row.sourceTitleId } : {}),
  }))
}

/** Compares catalog shape to a preset snapshot (ignores org-local `omt_*` ids). */
export function organizationMembershipTitleCatalogMatchesPresetSnapshot(
  catalog: readonly OrganizationMembershipTitleDefinition[],
  presetId: OrganizationAuthoringPresetId,
): boolean {
  const expected = snapshotOrganizationMembershipTitlesFromPreset(presetId, () => 'semantic-compare')
  const currentRows = organizationMembershipTitleSemanticRows(catalog)
  const expectedRows = organizationMembershipTitleSemanticRows(expected)
  if (currentRows.length !== expectedRows.length) {
    return false
  }
  return currentRows.every((row, index) => {
    const expectedRow = expectedRows[index]
    if (!expectedRow) {
      return false
    }
    return (
      row.normalizedLabel === expectedRow.normalizedLabel &&
      row.priority === expectedRow.priority &&
      row.sourceTitleId === expectedRow.sourceTitleId
    )
  })
}

export function resolveOrganizationMembershipTitleDefinitionByLabel(
  catalog: readonly OrganizationMembershipTitleDefinition[],
  title: string,
): OrganizationMembershipTitleDefinition | undefined {
  const normalized = normalizeOrganizationMembershipTitleLabel(title)
  if (normalized === '') return undefined
  return catalog.find(
    (entry) => normalizeOrganizationMembershipTitleLabel(entry.label) === normalized,
  )
}

export { organizationAuthoringPresetIdSchema }

export function organizationCreateMembershipTitlesInputRefinement(
  value: {
    members?: {
      titles?: readonly OrganizationMembershipTitleDefinition[]
    }
  },
  ctx: z.RefinementCtx,
): void {
  const titles = value.members?.titles
  if (titles === undefined) {
    return
  }
  if (titles.length === 0) {
    addCustomRefinementIssue(ctx, 'Organization must have at least one membership title.', [
      'members',
      'titles',
    ])
  }
}
