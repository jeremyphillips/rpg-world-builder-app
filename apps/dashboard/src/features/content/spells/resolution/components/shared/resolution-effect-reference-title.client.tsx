'use client'

import { cn } from '@rpg/ui'

import {
  formatEffectReferenceTitle,
  type EffectReferenceState,
  type ResolveEffectReferenceOptions,
} from '../../lib/form/resolution-effect-reference.lib'

const KIND_SEPARATOR = ' — '
const DETAIL_SEPARATOR = ' · '

export type ResolutionEffectReferenceTitleProps = {
  reference: EffectReferenceState
  id?: string
  className?: string
  resolveOptions?: ResolveEffectReferenceOptions
}

function renderResolvedTitle(reference: Extract<EffectReferenceState, { kind: 'resolved' }>) {
  const { kindLabel, customLabel, mechanicalSummary } = reference.display.segments
  const detailTone = 'text-muted-foreground'

  return (
    <>
      <span>{kindLabel}</span>
      {customLabel ? (
        <>
          <span className={detailTone} aria-hidden>
            {KIND_SEPARATOR}
          </span>
          <span>{customLabel}</span>
        </>
      ) : null}
      {mechanicalSummary ? (
        <>
          <span className={detailTone} aria-hidden>
            {customLabel ? DETAIL_SEPARATOR : KIND_SEPARATOR}
          </span>
          <span className={customLabel ? detailTone : undefined}>{mechanicalSummary}</span>
        </>
      ) : null}
    </>
  )
}

function renderReferenceTitle(reference: EffectReferenceState) {
  switch (reference.kind) {
    case 'resolved':
      return renderResolvedTitle(reference)
    case 'missing':
      return <span className="text-muted-foreground">{formatEffectReferenceTitle(reference)}</span>
    case 'incomplete':
      return (
        <>
          <span>{formatEffectReferenceTitle(reference)}</span>
        </>
      )
    case 'unavailable':
      return <span>{formatEffectReferenceTitle(reference)}</span>
    default: {
      const _exhaustive: never = reference
      return _exhaustive
    }
  }
}

/** Renders an effect reference title with UI separators and truncation recovery. */
export function ResolutionEffectReferenceTitle({
  reference,
  id,
  className,
  resolveOptions,
}: ResolutionEffectReferenceTitleProps) {
  const plainText = formatEffectReferenceTitle(reference, resolveOptions)
  const ariaLabel = plainText

  return (
    <span
      id={id}
      className={cn('block min-w-0 truncate text-sm font-medium leading-none', className)}
      title={plainText}
      aria-label={ariaLabel}
    >
      {renderReferenceTitle(reference)}
    </span>
  )
}
