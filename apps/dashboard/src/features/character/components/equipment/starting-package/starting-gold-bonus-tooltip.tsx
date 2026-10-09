import {
  formatInlineWealth,
  formatTierBonusGold,
  joinInlineMetadata,
  type CharacterWealth,
  type TierBonusGold,
} from '@rpg/contracts'

import {
  STARTING_GOLD_BONUS_LABEL,
  startingGoldBonusFormulaVariants,
  startingGoldBonusSummaryVariants,
  startingGoldBonusTooltipVariants,
} from './starting-gold-bonus-tooltip.variants'

const CALCULATED_FROM_LABEL = 'Calculated from'

export type StartingGoldBonusTooltipBodyProps = {
  bonusWealth: CharacterWealth
  bonusGold: TierBonusGold
}

function StartingGoldBonusFormula({
  bonusGold,
  tone,
}: {
  bonusGold: TierBonusGold
  tone?: 'inherit' | 'muted'
}) {
  return (
    <p className={startingGoldBonusFormulaVariants({ tone })}>
      {CALCULATED_FROM_LABEL} {formatTierBonusGold(bonusGold)}
    </p>
  )
}

/** Radio-card tooltip: foreground summary, then a muted formula. */
export function StartingGoldBonusTooltipBody({
  bonusWealth,
  bonusGold,
}: StartingGoldBonusTooltipBodyProps) {
  return (
    <div className={startingGoldBonusTooltipVariants()}>
      <p className={startingGoldBonusSummaryVariants()}>
        {joinInlineMetadata([STARTING_GOLD_BONUS_LABEL, `+${formatInlineWealth(bonusWealth)}`])}
      </p>
      <StartingGoldBonusFormula bonusGold={bonusGold} tone="muted" />
    </div>
  )
}

/** Disclosure tooltip: the authored formula only, at the tooltip's own type size. */
export function StartingGoldBonusFormulaTooltip({ bonusGold }: { bonusGold: TierBonusGold }) {
  return <StartingGoldBonusFormula bonusGold={bonusGold} />
}
