import { z } from 'zod'

import { CONTENT_MEDIA_PRIMARY_ASPECT_HEIGHT, CONTENT_MEDIA_PRIMARY_ASPECT_WIDTH } from './limits'

const bannerAspectLabel = '3:1'
const primaryAspectLabel = `${CONTENT_MEDIA_PRIMARY_ASPECT_WIDTH}:${CONTENT_MEDIA_PRIMARY_ASPECT_HEIGHT}`

/** Attachment presentation roles for content media (not game vocabulary). */
export const MEDIA_ROLE_TERM = {
  label: 'Media role',
  description: 'How an attached image is used on a content record.',
} as const

export const MEDIA_ROLE_ENTRIES = {
  primary: {
    label: 'Primary image',
    description: `${primaryAspectLabel} representative artwork and detail views.`,
  },
  portrait: {
    label: 'Portrait',
    description: 'Compact identity, cards, lists, and tokens.',
  },
  banner: {
    label: 'Banner',
    description: `Wide ${bannerAspectLabel} image for campaign headers.`,
  },
  emblem: {
    label: 'Emblem',
    description: 'Crest or logo shown in full without cropping.',
  },
} as const satisfies Record<string, { label: string; description: string }>

export type MediaRole = keyof typeof MEDIA_ROLE_ENTRIES

export const MEDIA_ROLES = Object.keys(MEDIA_ROLE_ENTRIES) as [MediaRole, ...MediaRole[]]

export const mediaRoleSchema = z.enum(MEDIA_ROLES)
