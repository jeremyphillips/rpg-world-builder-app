import { SEMANTIC_CLASS_PREFIXES } from '../../styles/semantic-class-prefix'

export type SplitSemanticClassName = {
  semantic: string[]
  utilities: string[]
}

export type SplitSemanticClassNameOptions = {
  /** Class prefixes treated as semantic. Defaults to `ui-` and `dash-`. */
  prefixes?: readonly string[]
}

/** Split emitted class strings into semantic tokens and leftover utilities. */
export function splitSemanticClassName(
  className: string | undefined,
  options?: SplitSemanticClassNameOptions,
): SplitSemanticClassName {
  if (!className?.trim()) {
    return { semantic: [], utilities: [] }
  }

  const prefixes = options?.prefixes ?? SEMANTIC_CLASS_PREFIXES
  const semantic: string[] = []
  const utilities: string[] = []

  for (const token of className.trim().split(/\s+/)) {
    if (prefixes.some((prefix) => token.startsWith(prefix))) {
      semantic.push(token)
    } else if (token.length > 0) {
      utilities.push(token)
    }
  }

  return { semantic, utilities }
}
