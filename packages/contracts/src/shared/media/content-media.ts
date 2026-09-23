import { z } from 'zod'

import { contentImageSchema } from './content-image'
import { imagePresentationSchema } from './image-presentation'

const contentMediaRoleAssignmentSchema = z
  .object({
    imageId: z.string().min(1),
    presentation: imagePresentationSchema.optional(),
  })
  .strict()

/** Optional role map. Strict shape rejects unknown role keys. */
export const contentMediaRolesSchema = z
  .object({
    primary: contentMediaRoleAssignmentSchema.optional(),
    portrait: contentMediaRoleAssignmentSchema.optional(),
  })
  .strict()

export type ContentMediaRoles = z.infer<typeof contentMediaRolesSchema>

/** Ordered gallery with independent role assignments. */
export const contentMediaSchema = z
  .object({
    revision: z.number().int().nonnegative(),
    images: z.array(contentImageSchema),
    roles: contentMediaRolesSchema,
  })
  .strict()

export type ContentMedia = z.infer<typeof contentMediaSchema>

/** Explicit empty media clears inherited gallery and roles on write. */
export const emptyContentMediaSchema = contentMediaSchema.parse({
  revision: 0,
  images: [],
  roles: {},
})

/** Deep-merge replacement boundary for campaign overlay patches. */
export const CONTENT_MEDIA_REPLACE_KEY = 'media' as const
