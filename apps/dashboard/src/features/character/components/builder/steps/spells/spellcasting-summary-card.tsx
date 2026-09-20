import {
  getAbilityLabel,
  type BuilderSpellcastingProfile,
  type CharacterBuildPreview,
} from '@rpg/contracts'

import {
  formatSpellAttackBonus,
  formatSpellcastingCountSummary,
  formatSpellSaveDc,
  formatSpellSlotSummary,
  spellcastingPreviewStats,
} from '../../../../lib/spells/spells-step.lib'
import {
  spellcastingSummaryCardClasses,
  spellcastingSummaryCardLabelClasses,
  spellcastingSummaryCardValueClasses,
} from './spellcasting-summary-card.variants'

export type SpellcastingSummaryCardProps = {
  profile: BuilderSpellcastingProfile
  preview: CharacterBuildPreview | null
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className={spellcastingSummaryCardLabelClasses}>{label}</dt>
      <dd className={spellcastingSummaryCardValueClasses}>{value}</dd>
    </div>
  )
}

/** Spellcasting facts for the Spells step — profile counts plus preview-derived DC/attack/slots. */
export function SpellcastingSummaryCard({ profile, preview }: SpellcastingSummaryCardProps) {
  const spellcasting = spellcastingPreviewStats(preview)

  return (
    <div className="space-y-3">
      <dl className={spellcastingSummaryCardClasses}>
        <SummaryField label="Spellcasting ability" value={getAbilityLabel(profile.ability)} />
        <SummaryField
          label="Preparation"
          value={profile.usesPreparedLoadout ? 'Prepared' : 'Known'}
        />
        <SummaryField label="Choices" value={formatSpellcastingCountSummary(profile)} />
        <SummaryField label="Spell save DC" value={formatSpellSaveDc(spellcasting)} />
        <SummaryField label="Spell attack" value={formatSpellAttackBonus(spellcasting)} />
        <SummaryField label="Spell slots" value={formatSpellSlotSummary(spellcasting)} />
      </dl>
    </div>
  )
}
