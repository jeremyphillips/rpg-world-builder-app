'use client'

import * as React from 'react'

import { IdentityRow } from './identity-row.client'
import { identityRowSizeFromInteractiveListSize } from './interactive-list.lib'
import type { InteractiveListSize } from './interactive-list.variants'
import { InteractiveListRow } from './interactive-list-row.client'

export type ComboboxOptionRowProps = {
  optionId: string
  highlighted?: boolean
  selected: boolean
  disabled?: boolean
  size?: InteractiveListSize
  heading?: string
  classification?: string
  supporting?: React.ReactNode
  supportingWrap?: boolean
  endSlot?: React.ReactNode
  /** Replaces the default identity block while keeping option semantics. */
  renderContent?: React.ReactNode
  ariaLabel?: string
  onHighlight?: () => void
  onSelect: () => void
}

/** Listbox option row — `role="option"` with truthful `aria-selected`. Not for action menus. */
export function ComboboxOptionRow({
  optionId,
  highlighted = false,
  selected,
  disabled = false,
  size = 'md',
  heading,
  classification,
  supporting,
  supportingWrap,
  endSlot,
  renderContent,
  ariaLabel,
  onHighlight,
  onSelect,
}: ComboboxOptionRowProps) {
  const identitySize = identityRowSizeFromInteractiveListSize(size)

  const content =
    renderContent ??
    (heading != null || classification != null || supporting != null ? (
      <IdentityRow
        heading={heading}
        classification={classification}
        supporting={supporting}
        supportingWrap={supportingWrap}
        size={identitySize}
      />
    ) : null)

  return (
    <InteractiveListRow
      highlighted={highlighted}
      selected={selected}
      disabled={disabled}
      size={size}
      content={content}
      endSlot={endSlot}
      asChild
    >
      <button
        id={optionId}
        type="button"
        role="option"
        aria-selected={selected}
        aria-label={ariaLabel}
        disabled={disabled}
        onMouseEnter={onHighlight}
        onClick={onSelect}
      />
    </InteractiveListRow>
  )
}
