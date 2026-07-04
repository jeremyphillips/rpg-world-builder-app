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

function collectPaths(schema: ZodType, prefix = ''): string[] {
  const unwrapped = unwrap(schema)
  const def = getDef(unwrapped)
  const type = def?.type

  if (type === 'object') {
    const shape = objectShape(unwrapped)
    if (!shape) return prefix ? [prefix] : []

    const paths: string[] = []
    for (const [key, child] of Object.entries(shape)) {
      const childPrefix = prefix ? `${prefix}.${key}` : key
      paths.push(...collectPaths(child, childPrefix))
    }
    return paths
  }

  if (type === 'array') {
    const element = def?.element
    if (!element) return prefix ? [prefix] : []

    const childPrefix = prefix ? `${prefix}.*` : '*'
    return [prefix, ...collectPaths(element, childPrefix)].filter(Boolean)
  }

  if (type === 'union') {
    const paths = new Set<string>()
    for (const option of def?.options ?? []) {
      for (const path of collectPaths(option, prefix)) {
        paths.add(path)
      }
    }
    return [...paths]
  }

  if (type === 'intersection') {
    const paths = new Set<string>()
    if (def?.left) {
      for (const path of collectPaths(def.left, prefix)) paths.add(path)
    }
    if (def?.right) {
      for (const path of collectPaths(def.right, prefix)) paths.add(path)
    }
    return [...paths]
  }

  return prefix ? [prefix] : []
}

/** Dot-path leaf keys for a Zod schema (array indices normalized to `*`). */
export function collectSchemaLeafPaths(schema: ZodType): string[] {
  return [...new Set(collectPaths(schema))]
}
