/**
 * Post-processes Zod-generated JSON Schema for editor hover.
 *
 * Zod emits reused string enums as `$ref` pointers into `definitions`. VS Code
 * does not surface enum descriptions through indirection, so inline enum-only
 * definitions at their use sites.
 *
 * VS Code treats `description` as plain text; markdown must use `markdownDescription`.
 * Bare enums without Zod `.describe()` get synthesized value lists for DX.
 */

type JsonObject = Record<string, unknown>

function isPlainObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** String schema whose only constraint is a closed value set (enum or const). */
export function isEnumOnlyDefinition(definition: unknown): boolean {
  if (!isPlainObject(definition)) return false
  if (definition.type !== 'string') return false
  return 'enum' in definition || 'const' in definition
}

function resolveDefinition(schema: JsonObject, ref: string): unknown {
  const match = /^#\/definitions\/([^/]+)$/.exec(ref)
  if (match === null) return undefined
  const definitions = schema.definitions
  if (!isPlainObject(definitions)) return undefined
  return definitions[match[1]!]
}

function cloneEnumDefinition(definition: unknown): unknown {
  return structuredClone(definition)
}

function visitNode(node: unknown, root: JsonObject): unknown {
  if (Array.isArray(node)) {
    return node.map((item) => visitNode(item, root))
  }

  if (!isPlainObject(node)) return node

  if (
    typeof node.$ref === 'string' &&
    Object.keys(node).length === 1 &&
    isEnumOnlyDefinition(resolveDefinition(root, node.$ref))
  ) {
    return visitNode(cloneEnumDefinition(resolveDefinition(root, node.$ref)), root)
  }

  const result: JsonObject = {}
  for (const [key, value] of Object.entries(node)) {
    result[key] = visitNode(value, root)
  }
  return result
}

function containsMarkdownDescription(text: string): boolean {
  return /\*\*|__|(^|\n)\s*-\s+/.test(text)
}

function synthesizeEnumDescription(node: JsonObject): string | undefined {
  if (node.type !== 'string') return undefined
  if (node.description !== undefined || node.markdownDescription !== undefined) return undefined

  if (Array.isArray(node.enum) && node.enum.every((value) => typeof value === 'string')) {
    return (node.enum as string[]).join(' | ')
  }

  if (typeof node.const === 'string') {
    return node.const
  }

  return undefined
}

function promoteMarkdownDescriptions(node: unknown): unknown {
  if (Array.isArray(node)) {
    return node.map((item) => promoteMarkdownDescriptions(item))
  }

  if (!isPlainObject(node)) return node

  const result: JsonObject = {}
  for (const [key, value] of Object.entries(node)) {
    result[key] = promoteMarkdownDescriptions(value)
  }

  if (typeof result.description === 'string' && containsMarkdownDescription(result.description)) {
    result.markdownDescription = result.description
    delete result.description
  }

  const synthesized = synthesizeEnumDescription(result)
  if (synthesized !== undefined) {
    if (containsMarkdownDescription(synthesized)) {
      result.markdownDescription = synthesized
    } else {
      result.description = synthesized
    }
  }

  return result
}

/** Inline enum-only `$ref`s so VS Code hover shows allowed values and descriptions. */
export function postProcessJsonSchema<T>(schema: T): T {
  if (!isPlainObject(schema)) return schema
  const inlined = visitNode(schema, schema)
  return promoteMarkdownDescriptions(inlined) as T
}

/** Collects `$ref` pointers that still target enum-only definitions (for tests). */
export function findEnumOnlyRefs(schema: unknown): string[] {
  const refs: string[] = []

  function walk(node: unknown): void {
    if (Array.isArray(node)) {
      for (const item of node) walk(item)
      return
    }
    if (!isPlainObject(node)) return

    if (
      typeof node.$ref === 'string' &&
      Object.keys(node).length === 1 &&
      isPlainObject(schema) &&
      isEnumOnlyDefinition(resolveDefinition(schema, node.$ref))
    ) {
      refs.push(node.$ref)
    }

    for (const value of Object.values(node)) {
      walk(value)
    }
  }

  walk(schema)
  return refs
}
