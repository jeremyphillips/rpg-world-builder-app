import { createElement } from 'react'
import type { ArrayItemShellRenderProps } from '@rpg/ui/form'

import { EntityDisclosureArrayItemShell } from '../../entity/surfaces/cards/disclosure/entity-disclosure-array-item-shell'
import {
  formatGrantRowToolbarAriaLabel,
  resolveGrantRowPresentation,
  type GrantRowHeaderContext,
} from './grant-row-presentation.lib'

export function createGrantArrayItemShell(ctx: GrantRowHeaderContext) {
  return function renderGrantArrayItemShell(props: ArrayItemShellRenderProps) {
    const presentation = resolveGrantRowPresentation(props.itemValues, ctx)
    const heading = presentation?.heading ?? props.header.fallback
    const detail = presentation?.detail

    const toolbarAriaLabel = presentation
      ? formatGrantRowToolbarAriaLabel({ heading, detail })
      : props.header.ariaLabel

    return createElement(EntityDisclosureArrayItemShell, {
      ...props,
      classification: detail,
      toolbarAriaLabel,
    })
  }
}

/** @deprecated Use createGrantArrayItemShell(ctx) so presentation context is available. */
export function renderGrantArrayItemShell(props: ArrayItemShellRenderProps) {
  return createElement(EntityDisclosureArrayItemShell, props)
}
