'use client'

import { deriveEffectsModelingStatus, getEffectsModelingStatusLabel } from '@rpg/contracts'
import { Text } from '@rpg/ui'
import { useWatch } from 'react-hook-form'

import { formatSpellEffectsPreviewLines, SPELL_EFFECTS_PREVIEW_LABEL } from '../lib/effect-display'
import type { EffectFormRow } from '../lib/effect-form-schema'
import { normalizeSpellEffects } from '../lib/effect-form-values'
import type { SpellFormValues } from '../lib/spell-form-fields'

/** Live preview of normalized spell effects from local form state. */
export function SpellEffectsPreview() {
  const effects = useWatch<SpellFormValues, 'effects'>({ name: 'effects' })
  const effectRows = (effects ?? []) as EffectFormRow[]
  const normalized = normalizeSpellEffects(effectRows)
  const lines = formatSpellEffectsPreviewLines(effectRows)
  const modelingStatus = deriveEffectsModelingStatus({ effects: normalized })

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
          {getEffectsModelingStatusLabel(modelingStatus)}
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
