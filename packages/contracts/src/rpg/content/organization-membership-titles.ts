import { z } from 'zod'

import {
  ORGANIZATION_AUTHORING_PRESETS,
  ORGANIZATION_AUTHORING_PRESET_IDS,
  type OrganizationAuthoringPresetId,
} from '../vocab/organization-authoring-preset'
import { ORGANIZATION_MEMBERSHIP_TITLE_PRIORITIES } from '../vocab/organization-member-title-entry'
import type { OrganizationMembershipTitlePriority } from '../vocab/organization-member-title-entry'
import {
  getOrganizationMembershipTitleEntry,
  type OrganizationMembershipTitleId,
} from '../vocab/organization-membership-title'
import { comparePriorityDescending } from '../vocab/types'
import { vocabularyOptionIdSchema } from '../vocab/vocabulary'

const organizationAuthoringPresetIdSchema = z.enum(
  ORGANIZATION_AUTHORING_PRESET_IDS as [
    OrganizationAuthoringPresetId,
    ...OrganizationAuthoringPresetId[],
  ],
)

export const ORGANIZATION_MEMBERSHIP_TITLE_ID_PREFIX = 'omt_' as const

export function createOrganizationMembershipTitleId(
  createId: () => string = () => crypto.randomUUID(),
): string {
  return `${ORGANIZATION_MEMBERSHIP_TITLE_ID_PREFIX}${createId()}`
}

export const organizationMembershipTitlePrioritySchema = z.union([
  z.literal(ORGANIZATION_MEMBERSHIP_TITLE_PRIORITIES[0]),
  z.literal(ORGANIZATION_MEMBERSHIP_TITLE_PRIORITIES[1]),
  z.literal(ORGANIZATION_MEMBERSHIP_TITLE_PRIORITIES[2]),
  z.literal(ORGANIZATION_MEMBERSHIP_TITLE_PRIORITIES[3]),
  z.literal(ORGANIZATION_MEMBERSHIP_TITLE_PRIORITIES[4]),
])

export type { OrganizationMembershipTitlePriority } from '../vocab/organization-member-title-entry'

export const organizationMembershipTitleDefinitionSchema = z.object({
  id: z.string().min(1),
  sourceTitleId: vocabularyOptionIdSchema.optional(),
  label: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1).optional(),
  priority: organizationMembershipTitlePrioritySchema,
})

export type OrganizationMembershipTitleDefinition = z.infer<
  typeof organizationMembershipTitleDefinitionSchema
>

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
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Organization membership title ids must be unique within an organization.',
        path: [...path, 'id'],
      })
    } else {
      seenIds.add(title.id)
    }

    const normalizedLabel = title.label.trim().toLocaleLowerCase('en')
    if (seenLabels.has(normalizedLabel)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Organization membership title labels must be unique within an organization.',
        path: [...path, 'label'],
      })
    } else {
      seenLabels.add(normalizedLabel)
    }
  })
}

export const organizationMembershipTitlesSchema = z
  .array(organizationMembershipTitleDefinitionSchema)
  .superRefine((titles, ctx) => {
    validateUniqueOrganizationMembershipTitleDefinitions(titles, ctx)
  })
  .default([])

export function snapshotOrganizationMembershipTitlesFromPreset(
  presetId: OrganizationAuthoringPresetId,
  createId: () => string = () => crypto.randomUUID(),
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
    }
  })
}

export function resolveOrganizationCreateMembershipTitles(input: {
  sourcePresetId?: OrganizationAuthoringPresetId
  titles?: readonly OrganizationMembershipTitleDefinition[]
  createId?: () => string
}): OrganizationMembershipTitleDefinition[] {
  if (input.sourcePresetId !== undefined) {
    return snapshotOrganizationMembershipTitlesFromPreset(
      input.sourcePresetId,
      input.createId ?? (() => crypto.randomUUID()),
    )
  }
  return [...(input.titles ?? [])]
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

export function resolveOrganizationMembershipTitleDefinitionByLabel(
  catalog: readonly OrganizationMembershipTitleDefinition[],
  title: string,
): OrganizationMembershipTitleDefinition | undefined {
  const normalized = title.trim()
  if (normalized === '') return undefined
  return catalog.find((entry) => entry.label === normalized)
}

export const organizationSourcePresetIdSchema = organizationAuthoringPresetIdSchema.optional()

export { organizationAuthoringPresetIdSchema }

/** Create input: preset provenance XOR explicit membership title catalog. */
export function organizationCreateMembershipTitlesInputRefinement(
  value: {
    sourcePresetId?: OrganizationAuthoringPresetId
    members?: {
      titles?: readonly OrganizationMembershipTitleDefinition[]
    }
  },
  ctx: z.RefinementCtx,
): void {
  const hasPreset = value.sourcePresetId !== undefined
  const hasTitles = value.members?.titles !== undefined && value.members.titles.length > 0
  if (hasPreset && hasTitles) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Organization create input must not combine sourcePresetId with members.titles.',
      path: ['members', 'titles'],
    })
  }
}
