'use client'

import type { ArrayAddActionConfig } from '../../field-config'
import { useArrayAddActionIntercept } from '../../context/array-add-action-intercept.context'
import { useOptionalRelationshipArrayController } from '../../context/relationship-array-controller.context'
import { useArrayFieldAppend } from './use-array-field-append.client'

type UseArrayFieldAppendControlsOptions = Parameters<typeof useArrayFieldAppend>[0] & {
  addAction: ArrayAddActionConfig | null | undefined
  config: Parameters<typeof useArrayFieldAppend>[0]['config']
}

/** Wires array append handlers, including optional add-action intercept overrides. */
export function useArrayFieldAppendControls({
  addAction,
  fullName,
  config,
  ...appendOptions
}: UseArrayFieldAppendControlsOptions) {
  const appendState = useArrayFieldAppend({
    ...appendOptions,
    config,
    fullName,
    defaultCollapsed: config.item?.defaultCollapsed ?? false,
  })
  const addActionIntercept = useArrayAddActionIntercept(addAction?.intercept)
  const relationshipArrayController = useOptionalRelationshipArrayController()

  const onAppendItem = addAction?.relationship
    ? () => relationshipArrayController.open(fullName)
    : (addActionIntercept?.onSelect ?? appendState.appendItem)

  return {
    ...appendState,
    onAppendItem,
  }
}
