'use client'

import * as React from 'react'

import { INLINE_METADATA_SEPARATOR } from '@rpg/contracts/primitives'

import { Eyebrow } from './eyebrow'
import {
  listGroupHeadingVariants,
  type ListGroupHeadingVariantProps,
} from './list-group-heading.variants'

export interface ListGroupHeadingProps extends ListGroupHeadingVariantProps {
  /** Host-owned id for `aria-labelledby` / section labelling. */
  id?: string
  label: React.ReactNode
  /** Optional match count or total shown beside the label (`Label · 14`). */
  count?: number
  /** Visual heading element only — hosts own listbox group vs section semantics. */
  as?: 'div' | 'h2' | 'h3' | 'h4'
}

/**
 * Band heading for grouped interactive lists (popover menus, search previews, panel sections).
 * Distinct from row-level {@link IdentityRow} classification. Consumers audited 2026-03:
 * ButtonDropdown (label only), global search preview (label + count + first/follows) — all
 * standardize on this contract; no alternate section-band structure required.
 */
export function ListGroupHeading({
  id,
  label,
  count,
  as: Component = 'div',
  first,
  follows,
}: ListGroupHeadingProps) {
  return (
    <Component id={id} className={listGroupHeadingVariants({ first, follows })}>
      <Eyebrow size="xs" as="span" className="ui-list-group-heading__eyebrow">
        <span className="ui-list-group-heading__label">{label}</span>
        {count != null ? (
          <>
            <span aria-hidden="true">{INLINE_METADATA_SEPARATOR}</span>
            <span className="ui-list-group-heading__count">{count}</span>
          </>
        ) : null}
      </Eyebrow>
    </Component>
  )
}
