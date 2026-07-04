import type { ZodType } from 'zod'

interface ZodDefLike {
  type?: string
  innerType?: ZodType
  shape?: Record<string, ZodType>
  element?: ZodType
  options?: ZodType[]
  left?: ZodType
  right?: ZodType
}

function getDef(schema: ZodType): ZodDefLike | undefined {
  const raw = schema as { _zod?: { def?: ZodDefLike }; shape?: Record<string, ZodType> }
  return raw._zod?.def
}

function unwrap(schema: ZodType): ZodType {
  let current = schema

  for (let depth = 0; depth < 24; depth++) {
    const def = getDef(current)
    if (!def?.type) break

    if (def.type === 'optional' || def.type === 'default' || def.type === 'nullable') {
      if (!def.innerType) break
      current = def.innerType
      continue
    }

    break
  }

  return current
}

function objectShape(schema: ZodType): Record<string, ZodType> | undefined {
  const raw = schema as { shape?: Record<string, ZodType> }
  if (raw.shape) return raw.shape

  const def = getDef(schema)
  return def?.shape
}

function leafPath(prefix: string): string[] {
  return prefix ? [prefix] : []
}

function collectObjectPaths(schema: ZodType, prefix: string): string[] {
  const shape = objectShape(schema)
  if (!shape) return leafPath(prefix)

  return Object.entries(shape).flatMap(([key, child]) =>
    collectPaths(child, prefix ? `${prefix}.${key}` : key),
  )
}

function collectArrayPaths(def: ZodDefLike, prefix: string): string[] {
  if (!def.element) return leafPath(prefix)

  const childPrefix = prefix ? `${prefix}.*` : '*'
  return [prefix, ...collectPaths(def.element, childPrefix)].filter(Boolean)
}

function collectBranchPaths(branches: ZodType[], prefix: string): string[] {
  const paths = new Set<string>()
  for (const branch of branches) {
    for (const path of collectPaths(branch, prefix)) paths.add(path)
  }
  return [...paths]
}

function collectPaths(schema: ZodType, prefix = ''): string[] {
  const unwrapped = unwrap(schema)
  const def = getDef(unwrapped)

  switch (def?.type) {
    case 'object':
      return collectObjectPaths(unwrapped, prefix)
    case 'array':
      return collectArrayPaths(def, prefix)
    case 'union':
      return collectBranchPaths(def.options ?? [], prefix)
    case 'intersection':
      return collectBranchPaths(
        [def.left, def.right].filter((b): b is ZodType => !!b),
        prefix,
      )
    default:
      return leafPath(prefix)
  }
}

/** Dot-path leaf keys for a Zod schema (array indices normalized to `*`). */
export function collectSchemaLeafPaths(schema: ZodType): string[] {
  return [...new Set(collectPaths(schema))]
}
