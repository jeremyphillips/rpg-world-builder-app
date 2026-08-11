import { createElement } from 'react'
import type { ArrayItemShellRenderProps } from '@rpg/ui/form'

import { EntityDisclosureArrayItemShell } from '../../entity/entity-disclosure-array-item-shell.client'
import { GRANT_ROW_TYPE_LABELS } from './grant-form-schema'

/** DEC shell for entity-backed grant array rows — form-owned ≠ form-styled. */
export function renderGrantArrayItemShell(props: ArrayItemShellRenderProps) {
  const grantType = props.itemValues['grantType']
  const classification =
    typeof grantType === 'string' && grantType in GRANT_ROW_TYPE_LABELS
      ? GRANT_ROW_TYPE_LABELS[grantType as keyof typeof GRANT_ROW_TYPE_LABELS]
      : undefined

  return createElement(EntityDisclosureArrayItemShell, {
    ...props,
    classification,
  })
}
