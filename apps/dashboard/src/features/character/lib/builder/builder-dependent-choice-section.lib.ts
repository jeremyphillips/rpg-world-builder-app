import { useCallback, useState } from 'react'

import type { RadioCardOption } from '@rpg/ui'

export function resolveDependentChoiceVisibleOptions(
  options: readonly RadioCardOption[],
  value: string,
  expanded: boolean,
): RadioCardOption[] {
  const isResolved = value.length > 0
  if (!isResolved || expanded) return [...options]
  return options.filter((option) => option.value === value)
}

export function useDependentChoiceExpandedState(
  expandedProp?: boolean,
  onExpandedChange?: (expanded: boolean) => void,
) {
  const [expandedInternal, setExpandedInternal] = useState(false)
  const expanded = expandedProp ?? expandedInternal
  const setExpanded = onExpandedChange ?? setExpandedInternal

  return { expanded, setExpanded }
}

export function useDependentChoiceValueChangeHandler({
  expanded,
  isResolved,
  onValueChange,
  setExpanded,
}: {
  expanded: boolean
  isResolved: boolean
  onValueChange: (optionId: string) => void
  setExpanded: (expanded: boolean) => void
}) {
  return useCallback(
    (optionId: string) => {
      onValueChange(optionId)
      if (isResolved || expanded) {
        setExpanded(false)
      }
    },
    [expanded, isResolved, onValueChange, setExpanded],
  )
}
