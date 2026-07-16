'use client'

import { X } from 'lucide-react'

import { Button } from './button.client'
import { PreviewCard } from './preview-card.client'
import type { PreviewCardRootVariantProps } from './preview-card.variants'

function toEyebrow(contentType: string): string {
  if (contentType.toLowerCase() === 'spell') return 'Spell'
  if (contentType.toLowerCase() === 'feat') return 'Feat'
  return contentType.charAt(0).toUpperCase() + contentType.slice(1)
}

export interface RichTextLinkPreviewCardProps extends PreviewCardRootVariantProps {
  title: string
  contentType: string
  sourceLabel?: string
  className?: string
  onSelect?: () => void
  onClear?: () => void
  clearLabel?: string
  layout?: PreviewCardRootVariantProps['layout']
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
  layout = 'list',
}: RichTextLinkPreviewCardProps) {
  const resolvedInteractive = onClear ? false : interactive || Boolean(onSelect)

  return (
    <PreviewCard
      title={title}
      eyebrow={toEyebrow(contentType)}
      description={sourceLabel}
      tone={tone}
      layout={layout}
      interactive={resolvedInteractive}
      className={className}
      onSelect={onClear ? undefined : onSelect}
      endSlot={
        onClear ? (
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
        ) : undefined
      }
    />
  )
}
