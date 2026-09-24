import { z } from 'zod'

/** Attachment presentation roles for content media (not game vocabulary). */
export const MEDIA_ROLE_TERM = {
  label: 'Media role',
  description: 'How an attached image is used on a content record.',
} as const

export const MEDIA_ROLE_ENTRIES = {
  primary: {
    label: 'Primary image',
    description: 'Representative artwork and detail views.',
  },
  portrait: {
    label: 'Portrait',
    description: 'Compact identity, cards, lists, and tokens.',
  },
  banner: {
    label: 'Banner',
    description: 'Wide 3:1 image for campaign headers.',
  },
  emblem: {
    label: 'Emblem',
    description: 'Crest or logo shown in full without cropping.',
  },
} as const satisfies Record<string, { label: string; description: string }>

export type MediaRole = keyof typeof MEDIA_ROLE_ENTRIES

export const MEDIA_ROLES = Object.keys(MEDIA_ROLE_ENTRIES) as [MediaRole, ...MediaRole[]]

export const mediaRoleSchema = z.enum(MEDIA_ROLES)
