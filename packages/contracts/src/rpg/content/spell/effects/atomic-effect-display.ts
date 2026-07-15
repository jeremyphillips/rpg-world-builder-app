import {
  getSpellAtomicEffectKindLabel,
  type SpellAtomicEffectKind,
} from '../../../vocab/spell/atomic-effect-kind'
import type { RollValue } from '../../../primitives/mechanics/roll'

import type { EffectRecipient } from './recipient'
import type { SpellAtomicEffect } from './schema'
import { formatAtomicEffectSummary } from './display'
import {
  formatEffectRowSentence,
  formatEffectRowSentenceFromParts,
  type EffectRowParts,
} from './format'

export type AtomicEffectTitleSegments = {
  kindLabel: string
  customLabel?: string
  mechanicalSummary?: string
}

/** Describes an atomic effect — not reference/surface relationship state. */
export type AtomicEffectDisplay = {
  segments: AtomicEffectTitleSegments
  /** Recipient-aware prose; omitted when too incomplete to summarize reliably. */
  summary?: string
}

export type AtomicEffectDisplayInput = {
  kind?: SpellAtomicEffectKind
  label?: string
  unitLabel?: string
  roll?: RollValue
  damageType?: string
  count?: number
}

export type BuildAtomicEffectDisplayOptions = {
  recipient?: EffectRecipient
  /** Fallback index when `kind` is absent during in-progress authoring. */
  fallbackIndex?: number
}

function trimOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function kindLabelFor(
  kind: SpellAtomicEffectKind | undefined,
  fallbackIndex: number | undefined,
): string {
  if (!kind) {
    return fallbackIndex != null ? `Effect ${fallbackIndex + 1}` : 'Effect'
  }
  return getSpellAtomicEffectKindLabel(kind)
}

function effectRowPartsFromInput(input: AtomicEffectDisplayInput): EffectRowParts | undefined {
  if (!input.kind || input.kind === 'projectile-count' || !input.roll) return undefined

  if (input.kind === 'damage') {
    if (!input.damageType) return undefined
    return { kind: 'damage', roll: input.roll, damageType: input.damageType }
  }

  if (input.kind === 'healing') {
    return { kind: 'healing', roll: input.roll }
  }

  return { kind: 'temporary-hit-points', roll: input.roll }
}

function mechanicalSummaryFromInput(input: AtomicEffectDisplayInput): string | undefined {
  if (input.kind === 'projectile-count') {
    if (typeof input.count !== 'number' || !input.unitLabel?.trim()) return undefined
    return formatAtomicEffectSummary({
      id: '',
      kind: 'projectile-count',
      count: input.count,
      unitLabel: input.unitLabel.trim(),
    })
  }

  const parts = effectRowPartsFromInput(input)
  if (!parts) return undefined

  return formatAtomicEffectSummary({
    id: '',
    kind: parts.kind,
    roll: parts.roll,
    ...(parts.kind === 'damage'
      ? { damageType: parts.damageType, label: undefined }
      : { label: undefined }),
  } as SpellAtomicEffect)
}

function customLabelFromInput(input: AtomicEffectDisplayInput): string | undefined {
  if (input.kind === 'projectile-count') {
    return trimOptional(input.unitLabel)
  }
  return trimOptional(input.label)
}

/** Builds display segments and summary from partial authoring input. */
export function buildAtomicEffectDisplayFromParts(
  input: AtomicEffectDisplayInput,
  options: BuildAtomicEffectDisplayOptions = {},
): AtomicEffectDisplay {
  const kindLabel = kindLabelFor(input.kind, options.fallbackIndex)
  const customLabel = customLabelFromInput(input)
  const mechanicalSummary = mechanicalSummaryFromInput(input)

  const parts = effectRowPartsFromInput(input)
  const summary = parts
    ? formatEffectRowSentenceFromParts(parts, { recipient: options.recipient })
    : input.kind === 'projectile-count' &&
        typeof input.count === 'number' &&
        input.unitLabel?.trim()
      ? formatEffectRowSentence({
          id: '',
          kind: 'projectile-count',
          count: input.count,
          unitLabel: input.unitLabel.trim(),
        })
      : undefined

  return {
    segments: {
      kindLabel,
      ...(customLabel ? { customLabel } : {}),
      ...(mechanicalSummary ? { mechanicalSummary } : {}),
    },
    ...(summary ? { summary } : {}),
  }
}

/** Builds display segments and summary from a normalized atomic effect. */
export function buildAtomicEffectDisplay(
  effect: SpellAtomicEffect,
  options: BuildAtomicEffectDisplayOptions = {},
): AtomicEffectDisplay {
  if (effect.kind === 'projectile-count') {
    return buildAtomicEffectDisplayFromParts(
      {
        kind: effect.kind,
        unitLabel: effect.unitLabel,
        count: effect.count,
      },
      options,
    )
  }

  return buildAtomicEffectDisplayFromParts(
    {
      kind: effect.kind,
      label: effect.label,
      roll: effect.roll,
      ...(effect.kind === 'damage' ? { damageType: effect.damageType } : {}),
    },
    options,
  )
}

const PLAIN_TEXT_KIND_SEPARATOR = ' — '
const PLAIN_TEXT_DETAIL_SEPARATOR = ' · '

/** Default plain-text title for menus, tooltips, and non-React surfaces. */
export function formatAtomicEffectDisplayTitle(display: AtomicEffectDisplay): string {
  const { kindLabel, customLabel, mechanicalSummary } = display.segments
  let title = kindLabel

  if (customLabel) {
    title = `${kindLabel}${PLAIN_TEXT_KIND_SEPARATOR}${customLabel}`
  }

  if (!mechanicalSummary) return title

  if (customLabel) {
    return `${title}${PLAIN_TEXT_DETAIL_SEPARATOR}${mechanicalSummary}`
  }

  return `${kindLabel}${PLAIN_TEXT_KIND_SEPARATOR}${mechanicalSummary}`
}

/** Returns the recipient-aware summary when present. */
export function formatAtomicEffectDisplaySummary(display: AtomicEffectDisplay): string | undefined {
  return display.summary
}
