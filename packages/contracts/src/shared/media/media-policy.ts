import { z } from 'zod'

import type { MediaRole } from './roles'
import { MEDIA_ROLES, mediaRoleSchema } from './roles'
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
  representativeRole: MediaRole
}

export const contentMediaPolicySchema = z.object({
  domain: contentMediaDomainSchema,
  allowedRoles: z.array(mediaRoleSchema).min(1),
  representativeRole: mediaRoleSchema,
})

const PRIMARY_ONLY: readonly MediaRole[] = ['primary']

/** Typed media policy registry for v1 opted-in content domains. */
export const CONTENT_MEDIA_POLICIES = {
  character: {
    domain: 'character',
    allowedRoles: MEDIA_ROLES,
    representativeRole: 'portrait',
  },
  class: {
    domain: 'class',
    allowedRoles: PRIMARY_ONLY,
    representativeRole: 'primary',
  },
  species: {
    domain: 'species',
    allowedRoles: PRIMARY_ONLY,
    representativeRole: 'primary',
  },
  equipment: {
    domain: 'equipment',
    allowedRoles: PRIMARY_ONLY,
    representativeRole: 'primary',
  },
  location: {
    domain: 'location',
    allowedRoles: PRIMARY_ONLY,
    representativeRole: 'primary',
  },
  organization: {
    domain: 'organization',
    allowedRoles: PRIMARY_ONLY,
    representativeRole: 'primary',
  },
} as const satisfies Record<ContentMediaDomain, ContentMediaPolicy>

export function getContentMediaPolicy(domain: ContentMediaDomain): ContentMediaPolicy {
  return CONTENT_MEDIA_POLICIES[domain]
}
