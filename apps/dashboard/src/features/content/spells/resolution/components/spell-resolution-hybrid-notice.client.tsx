'use client'

import { Alert, Text } from '@rpg/ui'
import { useWatch } from 'react-hook-form'

import type { EffectFormRow } from '../../lib/effect-form-schema'
import type { ResolutionFormValues } from '../lib/resolution-form-schema'
import { RESOLUTION_SECTION_LABELS } from '../lib/resolution-form-labels'
import { RESOLUTION_FIELD_NAME } from '../lib/resolution-form-values'

function hasProjectileCountEffect(effects: readonly EffectFormRow[] | undefined): boolean {
  return effects?.some((effect) => effect.kind === 'projectile-count') ?? false
}

/** Notifies authors when beam/dart scaling lives in legacy root effects. */
export function SpellResolutionHybridNotice() {
  const resolution = useWatch({ name: RESOLUTION_FIELD_NAME }) as ResolutionFormValues | undefined
  const rootEffects = useWatch({ name: 'effects' }) as EffectFormRow[] | undefined

  if (!resolution || !hasProjectileCountEffect(rootEffects)) {
    return null
  }

  return (
    <Alert variant="info" title={RESOLUTION_SECTION_LABELS.hybridNoticeTitle} role="status">
      <Text variant="muted" className="text-sm">
        {RESOLUTION_SECTION_LABELS.hybridNoticeBody}
      </Text>
    </Alert>
  )
}
