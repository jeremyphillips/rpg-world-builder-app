import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'

import { SpellcastingCombinedPreview } from '@/features/campaign/components/spellcasting-combined-preview'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'

type ClassSpellcastingProfilePreviewProps = {
  formCtx: ContentFormCtx
}

export function ClassSpellcastingProfilePreview({ formCtx }: ClassSpellcastingProfilePreviewProps) {
  const profileId = useWatch({ name: 'spellcasting.profileId' }) as string | undefined
  const spellcastingProgression = formCtx.spellcastingProgression
  const campaignRules = formCtx.campaignRules

  const preview = useMemo(() => {
    if (!profileId || !spellcastingProgression) return null

    const profile = spellcastingProgression.profiles.get(profileId)
    if (!profile) return null

    const slotProgression = spellcastingProgression.slotProgressions.get(profile.slotProgressionId)

    return {
      profile,
      slotProgression,
      effectiveMaxLevel: campaignRules?.maxCharacterLevel ?? 20,
      standardMaxLevel: campaignRules?.standardMaxCharacterLevel,
      extendedTierName: campaignRules?.extendedProgression?.tierName,
    }
  }, [campaignRules, profileId, spellcastingProgression])

  if (!preview) return null

  return (
    <SpellcastingCombinedPreview
      profile={preview.profile}
      slotProgression={preview.slotProgression}
      effectiveMaxLevel={preview.effectiveMaxLevel}
      standardMaxLevel={preview.standardMaxLevel}
      extendedTierName={preview.extendedTierName}
      caption="Selected profile progression preview"
    />
  )
}
