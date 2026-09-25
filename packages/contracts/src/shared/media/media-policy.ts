import { z } from 'zod'

import type { MediaRole } from './roles'
import { mediaRoleSchema } from './roles'
import { CONTENT_MEDIA_MAX_ATTACHMENTS_CEILING } from './limits'

export const contentMediaCollectionConstraintSchema = z.object({
  maxItems: z.number().int().positive().max(CONTENT_MEDIA_MAX_ATTACHMENTS_CEILING).optional(),
})

export type ContentMediaCollectionConstraint = z.infer<
  typeof contentMediaCollectionConstraintSchema
>

export function resolveContentMediaMaxItems(constraint?: ContentMediaCollectionConstraint): number {
  return (
    contentMediaCollectionConstraintSchema.parse(constraint ?? {}).maxItems ??
    CONTENT_MEDIA_MAX_ATTACHMENTS_CEILING
  )
}

/** Domains opted into reusable content media management. */
export const CONTENT_MEDIA_DOMAINS = [
  'character',
  'campaign',
  'class',
  'species',
  'equipment',
  'location',
  'organization',
] as const

export type ContentMediaDomain = (typeof CONTENT_MEDIA_DOMAINS)[number]

export const contentMediaDomainSchema = z.enum(CONTENT_MEDIA_DOMAINS)

export type ContentMediaPolicy = {
  domain: ContentMediaDomain
  allowedRoles: readonly MediaRole[]
  representativeRoles: readonly MediaRole[]
}

export const contentMediaPolicySchema = z.object({
  domain: contentMediaDomainSchema,
  allowedRoles: z.array(mediaRoleSchema).min(1),
  representativeRoles: z.array(mediaRoleSchema).min(1),
})

const PRIMARY_ONLY: readonly MediaRole[] = ['primary']
const PRIMARY_REPRESENTATIVE: readonly MediaRole[] = ['primary']

/** Typed media policy registry for opted-in content domains. */
export const CONTENT_MEDIA_POLICIES = {
  character: {
    domain: 'character',
    allowedRoles: ['portrait', 'primary'] as const,
    representativeRoles: ['portrait', 'primary'] as const,
  },
  campaign: {
    domain: 'campaign',
    allowedRoles: ['banner', 'primary', 'emblem'] as const,
    representativeRoles: ['primary', 'banner'] as const,
  },
  class: {
    domain: 'class',
    allowedRoles: PRIMARY_ONLY,
    representativeRoles: PRIMARY_REPRESENTATIVE,
  },
  species: {
    domain: 'species',
    allowedRoles: PRIMARY_ONLY,
    representativeRoles: PRIMARY_REPRESENTATIVE,
  },
  equipment: {
    domain: 'equipment',
    allowedRoles: PRIMARY_ONLY,
    representativeRoles: PRIMARY_REPRESENTATIVE,
  },
  location: {
    domain: 'location',
    allowedRoles: ['primary', 'emblem'] as const,
    representativeRoles: PRIMARY_REPRESENTATIVE,
  },
  organization: {
    domain: 'organization',
    allowedRoles: ['primary', 'emblem'] as const,
    representativeRoles: PRIMARY_REPRESENTATIVE,
  },
} as const satisfies Record<ContentMediaDomain, ContentMediaPolicy>

export function getContentMediaPolicy(domain: ContentMediaDomain): ContentMediaPolicy {
  return CONTENT_MEDIA_POLICIES[domain]
}
