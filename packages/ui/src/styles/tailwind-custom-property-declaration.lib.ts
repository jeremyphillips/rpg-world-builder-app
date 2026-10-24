/** Tailwind arbitrary custom-property declarations in TS/TSX string literals. */

const CUSTOM_PROPERTY_CONST_PATTERN =
  /(?:export\s+)?const\s+([A-Z][A-Z0-9_]*)\s*=\s*['"](--[a-zA-Z0-9-]+)['"]/g

const STATIC_DECLARATION_PATTERN = /\[(--[a-zA-Z0-9-]+):/g

const TEMPLATE_DECLARATION_PATTERN = /\[\$\{([A-Z][A-Z0-9_]*)\}:/g

export type CustomPropertyDeclarationCounts = Record<string, Record<string, number>>

function buildConstToCustomPropertyMap(sourceText: string): Map<string, string> {
  const map = new Map<string, string>()
  for (const match of sourceText.matchAll(CUSTOM_PROPERTY_CONST_PATTERN)) {
    const constName = match[1]
    const customProperty = match[2]
    if (constName && customProperty) {
      map.set(constName, customProperty)
    }
  }
  return map
}

function incrementCount(counts: Record<string, number>, customProperty: string): void {
  counts[customProperty] = (counts[customProperty] ?? 0) + 1
}

/** Count declaration occurrences in one module (not CSS files or inline `style` objects). */
export function findTailwindCustomPropertyDeclarationsInSource(
  sourceText: string,
): Record<string, number> {
  const counts: Record<string, number> = {}
  const constToProperty = buildConstToCustomPropertyMap(sourceText)

  for (const match of sourceText.matchAll(STATIC_DECLARATION_PATTERN)) {
    const customProperty = match[1]
    if (customProperty) incrementCount(counts, customProperty)
  }

  for (const match of sourceText.matchAll(TEMPLATE_DECLARATION_PATTERN)) {
    const constName = match[1]
    if (!constName) continue
    const customProperty = constToProperty.get(constName)
    if (customProperty) incrementCount(counts, customProperty)
  }

  return counts
}
