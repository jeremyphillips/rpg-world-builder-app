import { formatLimitedUseNotation } from '../../../primitives/limited-use'
import type { ContextualCount } from '../../../primitives/contextual-count'
import { LAIR_TERM } from '../../../vocab/mechanics/lair'
import { LEGENDARY_RESISTANCE_LABEL } from './legendary-resistance.constants'
import { legendaryResistanceLimitedUse } from './legendary-resistance-limited-use'

function formatLegendaryResistanceDayNotation(uses: number): string {
  return formatLimitedUseNotation(
    legendaryResistanceLimitedUse({ uses: { normal: uses } }, { inLair: false }),
    'stat-block',
  )
}

export type FormatLegendaryResistanceStatBlockTitleInput = {
  uses: ContextualCount
  lairEnabled: boolean
}

/** PDF-style trait line for monster stat blocks; pass `lairEnabled` only when the monster has lair enhancements on. */
export function formatLegendaryResistanceStatBlockTitle(
  config: FormatLegendaryResistanceStatBlockTitleInput,
): string {
  const { uses, lairEnabled } = config
  const normal = formatLegendaryResistanceDayNotation(uses.normal)

  if (!lairEnabled || uses.inLair === undefined) {
    return `${LEGENDARY_RESISTANCE_LABEL} (${normal})`
  }

  const inLair = formatLegendaryResistanceDayNotation(uses.inLair)
  return `${LEGENDARY_RESISTANCE_LABEL} (${normal}, or ${inLair} in ${LAIR_TERM.label})`
}
