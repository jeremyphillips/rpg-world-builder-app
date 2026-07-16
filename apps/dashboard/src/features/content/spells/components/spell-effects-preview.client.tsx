'use client'

import { Text } from '@rpg/ui'
import { useWatch } from 'react-hook-form'

import {
  formatSpellEffectsPreviewLines,
  SPELL_EFFECTS_PREVIEW_LABEL,
} from '../lib/effects/effect-display'
import type { EffectFormRow } from '../lib/effects/effect-form-schema'
import { normalizeSpellEffects } from '../lib/effects/effect-form-values'
import type { SpellFormValues } from '../lib/spell-form-fields'

const EFFECTS_PREVIEW_STATUS_LABEL = {
  empty: 'Prose only',
  partial: 'Partially modeled',
} as const

/** Live preview of normalized spell effects from local form state. */
export function SpellEffectsPreview() {
  const effects = useWatch<SpellFormValues, 'effects'>({ name: 'effects' })
  const effectRows = (effects ?? []) as EffectFormRow[]
  const normalized = normalizeSpellEffects(effectRows)
  const lines = formatSpellEffectsPreviewLines(effectRows)
  const modelingLabel =
    normalized.length === 0
      ? EFFECTS_PREVIEW_STATUS_LABEL.empty
      : EFFECTS_PREVIEW_STATUS_LABEL.partial

  if (lines.length === 0) {
    return (
      <Text variant="muted" className="text-sm" role="status">
        Add effects to preview structured summaries here. Prose in the Basics tab remains the escape
        hatch.
      </Text>
    )
  }

  return (
    <div className="space-y-2" role="status" aria-live="polite">
      <div className="flex flex-wrap items-center gap-2">
        <Text variant="emphasis" as="span" className="text-sm">
          {SPELL_EFFECTS_PREVIEW_LABEL}
        </Text>
        <Text variant="muted" className="text-xs" as="span">
          {modelingLabel}
        </Text>
      </div>
      <ul className="list-inside list-disc space-y-1 text-sm">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  )
}
