'use client'

import { X } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import {
  richTextLinkPreviewCardEyebrowVariants,
  richTextLinkPreviewCardMetaVariants,
  richTextLinkPreviewCardRootVariants,
  richTextLinkPreviewCardTitleVariants,
  type RichTextLinkPreviewCardRootVariantProps,
} from './rich-text-link-preview-card.variants'

function toEyebrow(contentType: string): string {
  if (contentType.toLowerCase() === 'spell') return 'Spell'
  if (contentType.toLowerCase() === 'feat') return 'Feat'
  return contentType.charAt(0).toUpperCase() + contentType.slice(1)
}

export interface RichTextLinkPreviewCardProps extends RichTextLinkPreviewCardRootVariantProps {
  title: string
  contentType: string
  sourceLabel?: string
  className?: string
  onSelect?: () => void
  onClear?: () => void
  clearLabel?: string
}

export function RichTextLinkPreviewCard({
  title,
  contentType,
  sourceLabel,
  tone = 'default',
  interactive = false,
  className,
  onSelect,
  onClear,
  clearLabel = 'Clear selected internal link',
}: RichTextLinkPreviewCardProps) {
  const content = (
    <div className="flex items-start justify-between gap-2 px-2 py-1.5">
      <div className="min-w-0">
        <p className={richTextLinkPreviewCardEyebrowVariants()}>{toEyebrow(contentType)}</p>
        <p className={richTextLinkPreviewCardTitleVariants()}>{title}</p>
        {sourceLabel ? <p className={richTextLinkPreviewCardMetaVariants()}>{sourceLabel}</p> : null}
      </div>
      {onClear ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6"
          aria-label={clearLabel}
          onClick={(event) => {
            event.stopPropagation()
            onClear()
          }}
        >
          <X className="size-3.5" />
        </Button>
      ) : null}
    </div>
  )

  const canUseButtonRoot = onSelect && !onClear

  if (canUseButtonRoot) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          richTextLinkPreviewCardRootVariants({ tone, interactive: interactive || Boolean(onSelect) }),
          className,
        )}
      >
        {content}
      </button>
    )
  }

  return (
    <div
      className={cn(
        richTextLinkPreviewCardRootVariants({ tone, interactive: interactive && !onClear }),
        className,
      )}
      onClick={onSelect}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={
        onSelect
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelect()
              }
            }
          : undefined
      }
    >
      {content}
    </div>
  )
}
