'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { Eyebrow } from './eyebrow'
import {
  previewCardBodyVariants,
  previewCardDescriptionVariants,
  previewCardNoteVariants,
  previewCardRootVariants,
  previewCardTitleVariants,
  type PreviewCardRootVariantProps,
} from './preview-card.variants'

export interface PreviewCardProps extends PreviewCardRootVariantProps {
  title: string
  description?: string
  /** When true, renders `description` inline after `title` instead of on its own line. */
  descriptionInline?: boolean
  eyebrow?: string
  startSlot?: React.ReactNode
  endSlot?: React.ReactNode
  footerSlot?: React.ReactNode
  className?: string
  /**
   * When set with `onSelect`, marks the button as a listbox option for
   * `aria-activedescendant` wiring in searchable menus.
   */
  optionId?: string
  isHighlighted?: boolean
  /**
   * When provided, the root renders as a `<button>`. `startSlot`, `endSlot`, and
   * `footerSlot` must not contain interactive elements — use the non-selectable
   * `<div>` root when nested controls are required.
   */
  onSelect?: () => void
}

function PreviewCardContent({
  title,
  description,
  descriptionInline = false,
  eyebrow,
  startSlot,
  endSlot,
  footerSlot,
  density = 'compact',
  layout = 'list',
}: Pick<
  PreviewCardProps,
  | 'title'
  | 'description'
  | 'descriptionInline'
  | 'eyebrow'
  | 'startSlot'
  | 'endSlot'
  | 'footerSlot'
  | 'density'
  | 'layout'
>) {
  return (
    <div className={previewCardBodyVariants({ density, layout })}>
      {startSlot ? <div className="shrink-0">{startSlot}</div> : null}
      <div className="min-w-0 flex-1">
        {eyebrow ? <Eyebrow size="xs">{eyebrow}</Eyebrow> : null}
        {descriptionInline && description ? (
          <p className={previewCardTitleVariants({ density, layout })}>
            <span>{title}</span>
            <span
              className={cn(previewCardDescriptionVariants({ density, inline: true }), 'font-body')}
            >
              {' '}
              {description}
            </span>
          </p>
        ) : (
          <>
            <p className={previewCardTitleVariants({ density, layout })}>{title}</p>
            {description ? (
              <p className={previewCardDescriptionVariants({ density })}>{description}</p>
            ) : null}
          </>
        )}
        {footerSlot ? (
          layout === 'list' ? (
            <p className={previewCardNoteVariants({ density })}>{footerSlot}</p>
          ) : (
            <div className="mt-1">{footerSlot}</div>
          )
        ) : null}
      </div>
      {endSlot ? <div className="shrink-0">{endSlot}</div> : null}
    </div>
  )
}

/**
 * Compact preview row for searchable pickers and list menus.
 *
 * Root rule: `onSelect` ⇒ `<button>` root (no interactive slots). Without
 * `onSelect`, the root is a `<div>` for nested controls in `endSlot` / etc.
 */
export function PreviewCard({
  title,
  description,
  descriptionInline = false,
  eyebrow,
  startSlot,
  endSlot,
  footerSlot,
  tone = 'default',
  density = 'compact',
  layout = 'list',
  interactive,
  className,
  optionId,
  isHighlighted = false,
  onSelect,
}: PreviewCardProps) {
  const resolvedInteractive = interactive ?? Boolean(onSelect)
  const rootClassName = cn(
    previewCardRootVariants({ tone, density, layout, interactive: resolvedInteractive }),
    className,
  )
  const content = (
    <PreviewCardContent
      title={title}
      description={description}
      descriptionInline={descriptionInline}
      eyebrow={eyebrow}
      startSlot={startSlot}
      endSlot={endSlot}
      footerSlot={footerSlot}
      density={density}
      layout={layout}
    />
  )

  if (onSelect) {
    return (
      <button
        type="button"
        id={optionId}
        role={optionId ? 'option' : undefined}
        aria-selected={optionId ? false : undefined}
        data-active={optionId ? isHighlighted : undefined}
        onClick={onSelect}
        className={rootClassName}
      >
        {content}
      </button>
    )
  }

  return <div className={rootClassName}>{content}</div>
}
