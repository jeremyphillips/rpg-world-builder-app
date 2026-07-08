/** Internal kind label for species heritage dependent choices. */
export const DEPENDENT_KIND_HERITAGE = 'heritage' as const

/** Sheet/manage affordance for species heritage choices. */
export const MANAGE_HERITAGE_LABEL = 'Manage heritage' as const

// Future subclass step:
// export const DEPENDENT_KIND_SUBCLASS = 'subclass' as const
// export const MANAGE_SUBCLASS_LABEL = 'Manage subclass' as const

export type ParentChoiceTitleMetaInput = {
  dependentKindLabel: string
  required: boolean
  selectedOptionLabel?: string
}

function capitalizeDependentKindLabel(label: string): string {
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/** Inline muted copy after a parent choice title, e.g. `Heritage required` or `Drow heritage`. */
export function formatParentChoiceTitleMeta({
  dependentKindLabel,
  required,
  selectedOptionLabel,
}: ParentChoiceTitleMetaInput): string {
  if (required || !selectedOptionLabel) {
    return `${capitalizeDependentKindLabel(dependentKindLabel)} required`
  }

  return `${selectedOptionLabel} ${dependentKindLabel}`
}
