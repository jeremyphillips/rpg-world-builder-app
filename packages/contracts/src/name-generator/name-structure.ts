import { z } from 'zod'

// ---------------------------------------------------------------------------
// Name structures — output shape and assembly format (separate from generation).
// ---------------------------------------------------------------------------

export const NAME_PART_ROLES = [
  'given',
  'family',
  'clan',
  'house',
  'virtue',
  'epithet',
  'title',
  'descriptor',
  'placeRoot',
  'placeSuffix',
  'organizationType',
] as const

export const namePartRoleSchema = z.enum(NAME_PART_ROLES)

export type NamePartRole = z.infer<typeof namePartRoleSchema>

const FORMAT_TOKEN_PATTERN = /\{([a-zA-Z][a-zA-Z0-9]*)\}/g

export function extractFormatTokens(format: string): string[] {
  const tokens: string[] = []
  for (const match of format.matchAll(FORMAT_TOKEN_PATTERN)) {
    const token = match[1]
    if (token !== undefined) {
      tokens.push(token)
    }
  }
  return tokens
}

export const namePartDefinitionSchema = z.object({
  key: z.string().min(1),
  role: namePartRoleSchema,
  required: z.boolean().optional(),
})

export type NamePartDefinition = z.infer<typeof namePartDefinitionSchema>

export const nameStructureDefinitionSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1),
    parts: z.array(namePartDefinitionSchema).min(1),
    format: z.string().min(1),
  })
  .superRefine((structure, ctx) => {
    const partKeys = new Set(structure.parts.map((part) => part.key))
    const formatTokens = extractFormatTokens(structure.format)

    for (const token of formatTokens) {
      if (!partKeys.has(token)) {
        ctx.addIssue({
          code: 'custom',
          message: `Format token {${token}} does not match any part key`,
          path: ['format'],
        })
      }
    }

    for (const part of structure.parts) {
      if (part.required !== false && !formatTokens.includes(part.key)) {
        ctx.addIssue({
          code: 'custom',
          message: `Required part "${part.key}" is not referenced in format`,
          path: ['parts'],
        })
      }
    }
  })

export type NameStructureDefinition = z.infer<typeof nameStructureDefinitionSchema>
