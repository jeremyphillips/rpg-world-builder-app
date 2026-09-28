import { z } from 'zod'

import type { ContentTypeKey } from '../content/content-type-keys'

export const SYSTEM_IMAGE_SUBJECT_KINDS = ['content-type', 'vocabulary-set'] as const

export type SystemImageSubjectKind = (typeof SYSTEM_IMAGE_SUBJECT_KINDS)[number]

export const systemImageSubjectKindSchema = z.enum(SYSTEM_IMAGE_SUBJECT_KINDS)

export const systemImageSubjectSchema = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('content-type'),
      key: z.string().min(1),
    })
    .strict(),
  z
    .object({
      kind: z.literal('vocabulary-set'),
      key: z.string().min(1),
    })
    .strict(),
])

export type SystemImageSubject = z.infer<typeof systemImageSubjectSchema>

export function contentTypeSubject(key: ContentTypeKey): SystemImageSubject {
  return { kind: 'content-type', key }
}

export function vocabularySetSubject(key: string): SystemImageSubject {
  return { kind: 'vocabulary-set', key }
}

export function systemImageSubjectLookupKey(subject: SystemImageSubject): string {
  return `${subject.kind}:${subject.key}`
}

export function systemImageEntryLookupKey(input: {
  imageSetId: string
  subject: SystemImageSubject
  assetRole: string
  slug: string
}): string {
  return `${input.imageSetId}:${systemImageSubjectLookupKey(input.subject)}:${input.assetRole}:${input.slug}`
}
