'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

import { cn } from '@rpg/ui'

import type {
  FixedScoresAssignedDragData,
  FixedScoresPoolDragData,
} from '../../../../../lib/steps/fixed-scores-dnd.lib'
import {
  resolveScoreTokenSurface,
  scoreTokenVariants,
  type ScoreTokenVariantProps,
} from './score-token.variants'

type ScoreTokenBaseProps = {
  value?: number
  label?: string
  size: NonNullable<ScoreTokenVariantProps['size']>
  surface: NonNullable<ScoreTokenVariantProps['surface']>
  dragging?: boolean
  dragOverlay?: boolean
  /** Keeps the drag source mounted but visually hidden while DragOverlay is active. */
  sourceHidden?: boolean
  disabled?: boolean
  ariaLabel?: string
  className?: string
}

type InteractiveScoreTokenProps = ScoreTokenBaseProps & {
  interactive: true
  dndId: string
  dndData: FixedScoresPoolDragData | FixedScoresAssignedDragData
}

type StaticScoreTokenProps = ScoreTokenBaseProps & {
  interactive?: false
  dndId?: never
  dndData?: never
}

export type ScoreTokenProps = InteractiveScoreTokenProps | StaticScoreTokenProps

function hasNumericValue(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function resolveScoreTokenContent(value: number | undefined, label: string | undefined) {
  return hasNumericValue(value) ? value : label
}

function resolveScoreTokenAriaLabel(
  ariaLabel: string | undefined,
  value: number | undefined,
): string | undefined {
  if (ariaLabel) return ariaLabel
  return hasNumericValue(value) ? `Score ${value}` : undefined
}

function buildScoreTokenClasses(
  props: ScoreTokenBaseProps & { interactive: boolean },
  effectiveSurface: NonNullable<ScoreTokenVariantProps['surface']>,
) {
  const { size, interactive, dragging, dragOverlay, sourceHidden, disabled, className } = props

  return cn(
    scoreTokenVariants({
      size,
      surface: effectiveSurface,
      interactive,
      dragging,
      dragOverlay,
      sourceHidden,
      disabled,
    }),
    className,
  )
}

function InteractiveScoreToken({
  value,
  label,
  size,
  surface,
  dragging = false,
  dragOverlay = false,
  sourceHidden = false,
  disabled = false,
  ariaLabel,
  className,
  dndId,
  dndData,
}: InteractiveScoreTokenProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: dndId,
    data: dndData,
    disabled,
  })

  const effectiveSurface = resolveScoreTokenSurface({
    surface,
    dragging,
    dragOverlay,
    sourceHidden,
  })
  const classes = buildScoreTokenClasses(
    {
      value,
      label,
      size,
      surface,
      dragging,
      dragOverlay,
      sourceHidden,
      disabled,
      ariaLabel,
      className,
      interactive: true,
    },
    effectiveSurface,
  )
  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined

  return (
    <button
      type="button"
      ref={setNodeRef}
      style={style}
      className={classes}
      aria-label={resolveScoreTokenAriaLabel(ariaLabel, value)}
      disabled={disabled}
      {...listeners}
      {...attributes}
    >
      {resolveScoreTokenContent(value, label)}
    </button>
  )
}

function StaticScoreToken({
  value,
  label,
  size,
  surface,
  dragging = false,
  dragOverlay = false,
  sourceHidden = false,
  disabled = false,
  ariaLabel,
  className,
}: StaticScoreTokenProps) {
  const effectiveSurface = resolveScoreTokenSurface({
    surface,
    dragging,
    dragOverlay,
    sourceHidden,
  })
  const classes = buildScoreTokenClasses(
    {
      value,
      label,
      size,
      surface,
      dragging,
      dragOverlay,
      sourceHidden,
      disabled,
      ariaLabel,
      className,
      interactive: false,
    },
    effectiveSurface,
  )

  return (
    <span
      className={classes}
      aria-hidden={surface === 'placeholder' || dragOverlay ? true : undefined}
      aria-label={ariaLabel}
    >
      {resolveScoreTokenContent(value, label)}
    </span>
  )
}

/** Shared score display for pool tokens, assigned values, placeholders, and drag overlays. */
export function ScoreToken(props: ScoreTokenProps) {
  if (
    props.interactive === true &&
    hasNumericValue(props.value) &&
    !props.disabled &&
    !props.dragOverlay
  ) {
    return <InteractiveScoreToken {...props} />
  }

  const { dndId: _dndId, dndData: _dndData, interactive: _interactive, ...staticProps } = props
  return <StaticScoreToken {...staticProps} />
}
