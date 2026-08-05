'use client'

import { Trash2 } from 'lucide-react'

import { cn } from '../../lib/utils'
import { ContentCardIconAction } from './content-card-actions.client'
import { contentCardMediaVariants } from './content-card.variants'

export type ContentCardMediaProps = {
  src: string
  alt?: string
  className?: string
}

export function ContentCardMedia({ src, alt = '', className }: ContentCardMediaProps) {
  return (
    <img
      src={src}
      alt={alt}
      aria-hidden={alt === '' ? true : undefined}
      className={cn(contentCardMediaVariants(), className)}
    />
  )
}

export const CONTENT_CARD_REMOVE_LABEL_PREFIX = 'Remove' as const

export function formatContentCardRemoveLabel(label: string): string {
  return `${CONTENT_CARD_REMOVE_LABEL_PREFIX} ${label}`
}

export type ContentCardRemoveButtonProps = {
  label: string
  removeAriaLabel?: string
  onRemove: () => void
  className?: string
}

export function ContentCardRemoveButton({
  label,
  removeAriaLabel,
  onRemove,
  className,
}: ContentCardRemoveButtonProps) {
  return (
    <ContentCardIconAction
      type="button"
      className={cn('hover:text-destructive', className)}
      aria-label={removeAriaLabel ?? formatContentCardRemoveLabel(label)}
      onClick={onRemove}
    >
      <Trash2 aria-hidden />
    </ContentCardIconAction>
  )
}
