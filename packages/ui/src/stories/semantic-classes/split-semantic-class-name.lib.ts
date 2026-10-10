const UI_CLASS_PREFIX = /^ui-/

export type SplitSemanticClassName = {
  semantic: string[]
  utilities: string[]
}

/** Split emitted class strings into semantic `ui-*` tokens and leftover utilities. */
export function splitSemanticClassName(className: string | undefined): SplitSemanticClassName {
  if (!className?.trim()) {
    return { semantic: [], utilities: [] }
  }

  const semantic: string[] = []
  const utilities: string[] = []

  for (const token of className.trim().split(/\s+/)) {
    if (UI_CLASS_PREFIX.test(token)) {
      semantic.push(token)
    } else if (token.length > 0) {
      utilities.push(token)
    }
  }

  return { semantic, utilities }
}
