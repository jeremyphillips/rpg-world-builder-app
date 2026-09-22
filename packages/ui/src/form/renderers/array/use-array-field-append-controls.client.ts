'use client'

import type { ArrayAddActionConfig } from '../../field-config'
import { useArrayAddActionIntercept } from '../../context/array-add-action-intercept.context'
import { useArrayFieldAppend } from './use-array-field-append.client'

type UseArrayFieldAppendControlsOptions = Parameters<typeof useArrayFieldAppend>[0] & {
  addAction: ArrayAddActionConfig | null | undefined
}

/** Wires array append handlers, including optional add-action intercept overrides. */
export function useArrayFieldAppendControls({
  addAction,
  ...appendOptions
}: UseArrayFieldAppendControlsOptions) {
  const appendState = useArrayFieldAppend(appendOptions)
  const addActionIntercept = useArrayAddActionIntercept(addAction?.intercept)
  const onAppendItem = addActionIntercept?.onSelect ?? appendState.appendItem

  return {
    ...appendState,
    onAppendItem,
  }
}
